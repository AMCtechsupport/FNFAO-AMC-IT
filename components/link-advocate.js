"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { linkAdvocate } from "../src/app/lib/link-advocate-server";
import supabase from "@/app/lib/supabase";

const LinkAdvocate = () => {
  const { user } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleLinkAdvocate = async (e) => {
    e.preventDefault();

    // Make sure the user is logged in before checking the database
    if (!user) {
      setError("User is not authenticated.");
      return;
    }

    // Check if the email or clerk_user_id already exists in the database
    const { data, error: checkError } = await supabase
      .from("Advocates")
      .select("advocate_id")
      .eq("clerk_user_id", user.id)
      .limit(1);

    if (checkError) {
      console.error("Error checking User ID :", checkError.message);
    }

    // If advocate already exists, prevent linking again
    if (data && data.length > 0) {
      setError("Your User ID is already registered.");
      return;
    }

    try {
      // Proceed to link advocate if not already linked
      const data = await linkAdvocate(firstName, lastName, email);
      setSuccess("User ID linked successfully!");
      console.log("User ID  linked successfully:", data);
    } catch (error) {
      setError("Error linking User ID : " + error.message);
      console.error("Error linking User ID :", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Link User ID
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
            className="w-full px-4 py-2 border mb-4 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 transition"
        >
          Link User ID
        </button>
      </form>
    </div>
  );
};

export default LinkAdvocate;
