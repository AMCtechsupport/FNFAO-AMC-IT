"use client";

import { useEffect, useState } from "react";
import supabase from "@/app/lib/supabase";

export default function ClientsPreview() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalInactive: 0,
    communityCounts: {},
    agencyCounts: {}
  });

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase.from("Clients").select("*");

      if (error) {
        console.error("Error fetching clients:", error);
        return;
      }

      const totalClients = data.length;
      const totalInactive = data.filter((c) => c.clientStatus === "Inactive").length;

      const communityCounts = data.reduce((acc, cur) => {
        const community = cur.firstNationMembership || "Unknown";
        acc[community] = (acc[community] || 0) + 1;
        return acc;
      }, {});

      const agencyCounts = data.reduce((acc, cur) => {
        const agency = cur.cfsAgency || "Unknown";
        acc[agency] = (acc[agency] || 0) + 1;
        return acc;
      }, {});

      setStats({ totalClients, totalInactive, communityCounts, agencyCounts });
    };

    fetchClients();
  }, []);

  const SectionCard = ({ title, children }) => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
      <h3 className="text-indigo-600 font-bold text-lg border-b border-indigo-200 pb-2 mb-4 text-center">
        {title}
      </h3>
      {children}
    </div>
  );

  const Row = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-gray-800 font-semibold">{value}</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-gray-50 rounded-2xl shadow-md">

      {/* Header */}
      <div className="text-center bg-indigo-50 border border-indigo-200 rounded-xl py-4 mb-8 shadow-sm">
        <h2 className="text-2xl font-bold text-indigo-600">
          Client Summary Report
        </h2>
        <p className="text-gray-500 text-sm mt-1">Overview Preview</p>
      </div>

      {/* general stats */}
      <SectionCard title="General Summary">
        <Row label="Total Clients" value={stats.totalClients} />
        <Row label="Total Inactive Files" value={stats.totalInactive} />
      </SectionCard>

      {/* first nation membership */}
      <SectionCard title="Clients by First Nation Membership">
        {Object.keys(stats.communityCounts).map((c) => (
          <Row key={c} label={c} value={stats.communityCounts[c]} />
        ))}
      </SectionCard>

      {/* agency */}
      <SectionCard title="Clients by CFS Agency">
        {Object.keys(stats.agencyCounts).map((a) => (
          <Row key={a} label={a} value={stats.agencyCounts[a]} />
        ))}
      </SectionCard>

    </div>
  );
}
