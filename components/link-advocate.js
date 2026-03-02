"use client";

import { useState } from "react";
import { createAdvocate } from "../src/app/lib/create-advocate-server";

const LinkAdvocate = () => {
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

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await createAdvocate({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim()
      });

      if (result.success) {
        let successMsg = `Advocate ${firstName} ${lastName} has been successfully created! An invitation has been sent to ${email}.`;
        
        // In development, show the invitation URL since emails might not be sent
        if (result.invitationUrl && process.env.NODE_ENV === 'development') {
          successMsg += ` Since you're in development mode, use this link to accept the invitation: ${result.invitationUrl}`;
        }
        
        setSuccess(successMsg);
        // Clear form
        clearForm();
      }
    } catch (error) {
      setError("Error creating advocate: " + error.message);
      console.error("Error creating advocate:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setError(null);
    // Don't clear success message - let user see it
  };

  return (
    <div>
      {/* Title moved to header - removed duplicate */}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleCreateAdvocate} className="space-y-6">
        <div>
          <label
            htmlFor="firstName"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            First Name: <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            placeholder="Advocate's First Name"
            onChange={(e) => {
              setFirstName(e.target.value);
              if (success) setSuccess(null); // Clear success message when user starts typing
            }}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Last Name: <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            placeholder="Advocate's Last Name"
            onChange={(e) => {
              setLastName(e.target.value);
              if (success) setSuccess(null); // Clear success message when user starts typing
            }}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Email: <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            placeholder="e.g., name@example.com"
            onChange={(e) => {
              setEmail(e.target.value);
              if (success) setSuccess(null); // Clear success message when user starts typing
            }}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Clerk Account Options */}
        <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-md">
        
          
          <div className="flex items-center">
            <label htmlFor="createClerkAccount" className="ml-2 text-sm text-gray-700">
              Create user account (allows advocate to login)
            </label>
          </div>
          
          <div className="flex items-center">
            <label htmlFor="sendInvitation" className="ml-2 text-sm text-gray-700">
              Send invitation email to set up their password
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg border border-blue-600 font-semibold hover:bg-blue-700 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Advocate"}
        </button>
      </form>
      
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> This creates a new advocate record that can be assigned to clients. 
          An invitation will be sent to their email address to set up their account.
        </p>
      </div>
    </div>
  );
};

export default LinkAdvocate;
