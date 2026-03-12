"use client";

import { useState } from "react";
import { createAdvocate } from "../src/app/lib/create-advocate-server";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const LinkAdvocate = ({ onAdvocateCreated }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateAdvocate = async (e) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Please enter a valid email address (e.g. name@example.com).");
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
        setSuccess(result.message);

        // Send welcome email and surface API errors to help troubleshooting
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
            const message =
              emailResult?.error || "Welcome email could not be sent.";
            setError(`Advocate created, but email was not sent: ${message}`);
          } else {
            // Email sent successfully - trigger refresh of pending advocates
            if (onAdvocateCreated) onAdvocateCreated();
          }
        } catch (emailErr) {
          console.error("Welcome email failed:", emailErr);
          setError(
            "Advocate created, but email was not sent due to a network error.",
          );
        }

        setFirstName("");
        setLastName("");
        setEmail("");
      }
    } catch (error) {
      console.error("Error creating advocate:", error);
      setError(error?.message || "Error creating advocate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider"
        style={{ backgroundColor: "#6100D7" }}
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
              onChange={(e) => {
                setFirstName(e.target.value);
                if (success) setSuccess(null);
              }}
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
              onChange={(e) => {
                setLastName(e.target.value);
                if (success) setSuccess(null);
              }}
              required
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-700 focus:outline-none transition"
            />
          </div>

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
              placeholder="e.g., name@example.com"
              onChange={(e) => {
                setEmail(e.target.value);
                if (success) setSuccess(null);
              }}
              required
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-700 focus:outline-none transition"
            />
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-1.5 text-sm text-gray-600">
            <p>• Creates a user account so the user can log in</p>
            <p>• Sends an invitation email to set up their password</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium rounded-lg transition-colors border disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#B2B3D7",
              borderColor: "#9899C0",
              color: "#6100D7",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#ffffff";
            }}
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.02)")
            }
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LinkAdvocate;
