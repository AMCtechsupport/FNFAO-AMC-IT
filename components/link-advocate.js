"use client";

import { useState } from "react";
import { createAdvocate } from "../src/app/lib/create-advocate-server";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const LinkAdvocate = ({ onAdvocateCreated }) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nameSource, setNameSource] = useState(null);
  const [manualNames, setManualNames] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupHint, setLookupHint] = useState("");

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetNameState = () => {
    setFirstName("");
    setLastName("");
    setNameSource(null);
    setManualNames(false);
    setLookupHint("");
  };

  const lookupNameForEmail = async (rawEmail) => {
    const trimmed = rawEmail.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      resetNameState();
      return;
    }

    setLookupLoading(true);
    setError(null);
    setLookupHint("");

    try {
      const response = await fetch(
        `/api/directory/lookup?email=${encodeURIComponent(trimmed)}`,
      );
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        resetNameState();
        setManualNames(true);
        setError(
          json.error ||
            "Could not look up this email address. Enter the name manually.",
        );
        return;
      }

      if (json.found && json.firstName) {
        setFirstName(json.firstName);
        setLastName(json.lastName || "");
        setNameSource(json.source || "graph");
        setManualNames(false);

        if (json.source === "graph") {
          setLookupHint("Name loaded from Microsoft 365.");
        } else if (json.graphError || json.notInDirectory || json.incompleteProfile) {
          setLookupHint(
            "Could not confirm the name in Microsoft 365. Review the suggested name before creating the user.",
          );
        } else if (!json.configured) {
          setLookupHint("Suggested name from email address. Review before creating the user.");
        }
        return;
      }

      resetNameState();
      setManualNames(true);
      setError(json.error || "Enter first and last name manually for this email.");
    } catch (lookupErr) {
      console.error("Directory lookup failed:", lookupErr);
      resetNameState();
      setManualNames(true);
      setError("Could not look up this email address. Enter the name manually.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleEmailBlur = () => {
    if (email.trim()) {
      lookupNameForEmail(email);
    }
  };

  const handleCreateAdvocate = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Please enter a valid email address (e.g. name@manitobachiefs.com).");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError("Enter an email address and wait for the name to load, or fill in the name fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await createAdvocate({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });

      if (result.success) {
        try {
          const emailResponse = await fetch("/api/send-welcome-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.trim(),
            }),
          });

          if (!emailResponse.ok) {
            const emailResult = await emailResponse.json().catch(() => ({}));
            const message = emailResult?.error || "Welcome email could not be sent.";
            setError(`User created, but email was not sent: ${message}`);
            setSuccess(result.message);
          } else {
            setSuccess(
              `${result.message} A welcome email with Microsoft sign-in instructions was sent.`,
            );
            if (onAdvocateCreated) onAdvocateCreated();
          }
        } catch (emailErr) {
          console.error("Welcome email failed:", emailErr);
          setSuccess(result.message);
          setError("User created, but email was not sent due to a network error.");
        }

        setEmail("");
        resetNameState();
      }
    } catch (createError) {
      console.error("Error creating advocate:", createError);
      setError(createError?.message || "Error creating user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const namesReady = Boolean(firstName.trim() && lastName.trim());

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div
        className="px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider"
        style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}
      >
        Create New User
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleCreateAdvocate} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              placeholder="name@manitobachiefs.com"
              onChange={(e) => {
                setEmail(e.target.value);
                if (success) setSuccess(null);
                if (error) setError(null);
              }}
              onBlur={handleEmailBlur}
              required
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-700 focus:outline-none transition"
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Enter their work email, then tab out of the field to load their name from Microsoft 365.
            </p>
          </div>

          {lookupLoading && (
            <p className="text-sm text-gray-600">Looking up name in Microsoft 365…</p>
          )}

          {!lookupLoading && namesReady && !manualNames && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-semibold">First name:</span> {firstName}
              </p>
              <p>
                <span className="font-semibold">Last name:</span> {lastName}
              </p>
              {lookupHint && <p className="text-xs text-gray-500">{lookupHint}</p>}
              {nameSource === "graph" && (
                <button
                  type="button"
                  onClick={() => setManualNames(true)}
                  className="text-xs font-medium text-[#6100d7] underline"
                >
                  Edit name manually
                </button>
              )}
            </div>
          )}

          {!lookupLoading && manualNames && (
            <>
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  placeholder="User's first name"
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-700 focus:outline-none transition"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  placeholder="User's last name"
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-700 focus:outline-none transition"
                />
              </div>
            </>
          )}

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-1.5 text-sm text-gray-600">
            <p>• Creates a user account for Microsoft 365 sign-in</p>
            <p>• Email must match their @manitobachiefs.com Microsoft account</p>
            <p>• Sends a welcome email with the sign-in link (no password)</p>
          </div>

          <button
            type="submit"
            disabled={loading || lookupLoading || !namesReady}
            className="w-full py-2.5 text-sm font-medium rounded-lg transition-colors border disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "rgba(97, 0, 215, 0.02)",
              borderColor: "rgba(97, 0, 215, 0.3)",
              color: "rgba(97, 0, 215, 0.8)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (!loading && !lookupLoading && namesReady) {
                e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.8)";
                e.currentTarget.style.color = "#ffffff";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.02)";
                e.currentTarget.style.color = "rgba(97, 0, 215, 0.8)";
              }
            }}
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LinkAdvocate;
