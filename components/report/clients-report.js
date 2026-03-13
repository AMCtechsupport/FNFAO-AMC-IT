/*
This component generates a detailed report for a specific client,
fetching data from multiple related tables in Supabase.
It displays sections for general information, child information,
family and friends, case notes, and legal notes.
*/

"use client";

import React, { useEffect, useState } from "react";
import supabase from "../../src/app/lib/supabase";
import { decodeHtml } from "../../src/app/utils/decode-html";

function humanLabel(key) {
  return String(key)
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ClientsReport({ clientId, setReportData }) {
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
          .select(`client_id,
           createdAt,
           dateModified,
           firstName,
           lastName,
           phoneNumber,
           email,
           firstNationMembership,
           otherFirstNation,
           onReserve,
           transitionFromReserve,
           previousFNFAOClient,
           seekingAdvocacy,
           cfsAgency,
           statusCFSFile,
           casePlanCopyDescribe,
           involvedCFSReason,
           prenatalSupport,
           housingSupport,
           addictionsSupport,
           addictionsSupportSpecified,
           youthSupport,
           youthSupportSpecified,
           legalAssistance,
           criminalCharges,
           activeWarrant,
           activeInvestigation,
           activeOrders,
           unableToAssistExplained,
           referForSupport,
           completedBy,
           assignedStaff,
           inSchool,
           accessElder,
           youthWorkshops,
           disabilities,
           previousInvolvement,
           selfHarm,
           childAbuse,
           criminalRecord,
           noContact,
           parentalCapacity,
           otherAdultsInvolved,
           otherAdultsInvolvedExplained,
           referredBy,
           relationshipToChildren,
           visitsChildFrequency,
           createdBy,
           modifiedBy,
           clientStatus,
           lastFaceToFace,
           motherLastName,
           connectedCommunity,
           cfsChildrenApprehesionReason,
           kinship`)
          .eq("client_id", clientId)
          .maybeSingle();
        setClient(clientData);

        const { data: childrenData } = await supabase
          .from("Childs")
          .select(`child_id,
            firstName,
            lastName,
            birthDate,
            gender,
            isFamily,
            isCFS,
            fathersName,
            childNation,
            childPlaced,
            childCfsAgency,
            childStatusCfsFile,
            childMedicalNeeds,
            biologicalParentFirstName,
            biologicalParentLastName,
            biologicalParentFirstNation`)
          .eq("client_id", clientId);
        setChildren(childrenData || []);

        const { data: familyData } = await supabase
          .from("Home Members")
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

        // Pass report data upward for CSV/JSON download buttons if needed
        if (setReportData) {
          setReportData([
            { section: "Client", data: clientData },
            { section: "Children", data: childrenData },
            { section: "Family", data: familyData },
            { section: "Case Notes", data: caseFiltered },
            { section: "Legal Notes", data: legalFiltered },
          ]);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load client report.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId, setReportData]);

  const filterOutIds = (obj) =>
    Object.entries(obj).filter(([key]) => !key.toLowerCase().includes("id"));

  const getValue = (val) => (val ? decodeHtml(String(val)) : "—");

  if (loading) return <p className="text-center py-6 text-gray-500">Loading...</p>;
  if (error) return <p className="text-center py-6 text-red-500">{error}</p>;
  if (!client) return <p className="text-center py-6 text-gray-400">No client found.</p>;

  const fullName = `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim();

  const renderSection = (title, dataArray) => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 overflow-hidden">
      <div className="px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
        {title}
      </div>

      <div className="p-6">
        {dataArray.length > 0 ? (
          dataArray.map((record, i) => (
            <div key={i} className="mb-4">
              {dataArray.length > 1 && (
                <h4 className="font-medium mb-2" style={{ color: "rgba(97, 0, 215, 0.8)" }}>
                  {title} #{i + 1}
                </h4>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 border-b">
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
    </div>
  );

  return (
    <div className="space-y-0">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-6">
        <div className="px-4 py-4 text-white text-center" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
          <h2 className="text-xl font-bold">Report of {fullName}</h2>
        </div>
      </div>

      {renderSection("General Information", [client])}
      {renderSection("Child Information", children)}
      {renderSection("Important Family and Friends", family)}
      {renderSection("Case Notes", caseNotes)}
      {renderSection("Legal Notes", legalNotes)}
    </div>
  );
}
