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
    <div>
      <h2>Link Advocate</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleLinkAdvocate}>
        <div>
          <label>
            First Name:
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Last Name:
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit">Link Advocate</button>
      </form>
    </div>
  );
};

export default LinkAdvocate;
