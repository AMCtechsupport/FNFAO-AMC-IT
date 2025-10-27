"use client";

import React, { useEffect, useState } from "react";
import supabase from "../../src/app/lib/supabase";

function humanLabel(key) {
  return String(key)
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ClientsReport({ clientId }) {
  const [client, setClient] = useState(null);
  const [children, setChildren] = useState([]);
  const [family, setFamily] = useState([]);
  const [caseNotes, setCaseNotes] = useState([]);
  const [legalNotes, setLegalNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!clientId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const { data: clientData } = await supabase
          .from("Clients")
          .select("*")
          .eq("client_id", clientId)
          .maybeSingle();
        setClient(clientData);

        const { data: childrenData } = await supabase
          .from("Childs")
          .select("*")
          .eq("client_id", clientId);
        setChildren(childrenData || []);

        const { data: familyData } = await supabase
          .from("Important Family and Friends")
          .select("*")
          .eq("client_id", clientId);
        setFamily(familyData || []);

        const { data: notesData } = await supabase
          .from("Notes")
          .select("*")
          .eq("client_id", clientId);
        const caseFiltered = notesData?.filter((n) => n.noteType === "Case") || [];
        const legalFiltered = notesData?.filter((n) => n.noteType === "Legal") || [];
        setCaseNotes(caseFiltered);
        setLegalNotes(legalFiltered);
      } catch (err) {
        console.error(err);
        setError("Unable to load client report.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  const filterOutIds = (obj) =>
    Object.entries(obj).filter(([key]) => !key.toLowerCase().includes("id"));

  const getValue = (val) => (val ? String(val) : "—");

  if (loading) return <p className="text-center py-6 text-gray-500">Loading...</p>;
  if (error) return <p className="text-center py-6 text-red-500">{error}</p>;
  if (!client) return <p className="text-center py-6 text-gray-400">No client found.</p>;

  const fullName = `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim();

  const renderSection = (title, dataArray) => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
      <h3 className="text-indigo-600 font-bold text-center  text-lg border-b border-indigo-200 pb-2 mb-4">
        {title}
      </h3>

      {dataArray.length > 0 ? (
        dataArray.map((record, i) => (
          <div key={i} className="mb-4">
            {dataArray.length > 1 && (
              <h4 className="font-medium text-indigo-600 mb-2">
                {title} #{i + 1}
              </h4>
            )}

            {/* side by side grid within sections */}
            <div className="grid grid-cols-1 border-b md:grid-cols-2 gap-x-8 gap-y-2">
              {filterOutIds(record).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-gray-100 py-1">
                  <span className="font-medium text-gray-600">{humanLabel(key)}:</span>
                  <span className="text-gray-800">{getValue(value)}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-sm">No data available.</p>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-gray-50 rounded-2xl shadow-md">
      {/* Header */}
      <div className="text-center bg-indigo-50 border border-indigo-200 rounded-xl py-4 mb-8">
        <h2 className="text-2xl font-bold text-indigo-600">
          Report of {fullName}
        </h2>
      </div>

      {/* all sections */}
      {renderSection("General Information", [client])}
      {renderSection("Child Information", children)}
      {renderSection("Important Family and Friends", family)}
      {renderSection("Case Notes", caseNotes)}
      {renderSection("Legal Notes", legalNotes)}
    </div>
  );
}
