// src/app/link-advocate.js
"use client";

import { useState } from "react";
import { linkAdvocate } from "../src/app/lib/link-advocate-server";

const LinkAdvocate = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleLinkAdvocate = async (e) => {
    e.preventDefault();
    try {
      const data = await linkAdvocate(firstName, lastName, email);
      setSuccess("Advocate linked successfully!");
      console.log("Advocate linked successfully:", data);
    } catch (error) {
      setError("Error linking advocate: " + error.message);
      console.error("Error linking advocate:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Link Advocate
      </h2>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {success && <p className="text-green-600 text-center mb-4">{success}</p>}

      <form onSubmit={handleLinkAdvocate} className="space-y-6">
        <div>
          <label
            htmlFor="firstName"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            First Name:
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Last Name:
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 transition"
        >
          Link Advocate
        </button>
      </form>
    </div>
  );
};

export default LinkAdvocate;
