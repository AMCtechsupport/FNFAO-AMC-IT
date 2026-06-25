import { NextResponse } from "next/server";
import supabase from "../../lib/supabase.server";
import { requireApiAdmin, requireApiUser } from "../../lib/api-auth";

export async function GET(request) {
  const authResult = await requireApiAdmin();
  if (!authResult.ok) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    let query = supabase
      .from("User Logs")
      .select("*, Advocates!advocate_id(firstName, lastName)", { count: "exact" });

    if (search) {
      const { data: clientData } = await supabase
        .from("Clients")
        .select("client_id")
        .or(`firstName.ilike.%${search}%,lastName.ilike.%${search}%`);

      const matchingClientIds = (clientData || []).map((c) => c.client_id);

      if (matchingClientIds.length > 0) {
        // Match existing clients by client_id OR deleted clients by embedded name in description
        query = query.or(`client_id.in.(${matchingClientIds.join(",")}),description.ilike.%${search}%`);
      } else {
        // No matching clients in DB — search description only (covers deleted clients)
        query = query.ilike("description", `%${search}%`);
      }
    }

    query = query
      .order("createdAt", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("[/api/user-logs] Error fetching user logs:", error);
      return NextResponse.json(
        { error: "Error fetching user logs", details: error.message },
        { status: 500 }
      );
    }

    const logsData = data || [];

    // Fetch client names and types for all unique client_ids in the result
    const clientIds = [...new Set(logsData.map((l) => l.client_id).filter(Boolean))];
    let clientMap = {};
    if (clientIds.length > 0) {
      const { data: clientsData } = await supabase
        .from("Clients")
        .select("client_id, firstName, lastName, clientType")
        .in("client_id", clientIds);
      (clientsData || []).forEach((c) => {
        clientMap[c.client_id] = {
          name: `${c.firstName} ${c.lastName}`,
          clientType: c.clientType || null,
        };
      });
    }

    const enrichedLogs = logsData.map((log) => {
      let clientName = clientMap[log.client_id]?.name || null;

      // If client no longer exists in DB, fall back to extracting name from description.
      if (!clientName && log.description) {
        // Matches: "...for client: John Doe" or "...for client: John Doe. Changed fields:..." (INSERT / UPDATE)
        const forClientMatch = log.description.match(/for client: ([^.|\n]+)/);
        if (forClientMatch) {
          clientName = forClientMatch[1];
        } else if (log.description.startsWith("Client deleted: ")) {
          // Matches: "Client deleted: John Doe" (DELETE)
          clientName = log.description.replace("Client deleted: ", "").split("||")[0];
        }
      }

      // Derive formType from description (INSERT/UPDATE always embed the intake type).
      // Fall back to DB lookup for DELETE logs where description has no intake prefix.
      let formType = null;
      if (log.description) {
        const rawDesc = log.description.split("||by:")[0];
        if (/youth[\s-]intake/i.test(rawDesc)) formType = "Youth Intake";
        else if (/full[\s-]intake/i.test(rawDesc) || /pre[\s-]intake/i.test(rawDesc)) formType = "Pre-Intake";
        // Extract formType from ||formType: tag for deleted clients
        const formTypeTagMatch = log.description.match(/\|\|formType:([^|\n]+)/);
        if (formTypeTagMatch && formTypeTagMatch[1]) {
          formType = formTypeTagMatch[1];
        }
      }
      if (!formType) {
        formType = clientMap[log.client_id]?.clientType || null;
      }

      // Strip embedded advocate name suffix from description before displaying
      let displayDescription = log.description || "";
      let advocateName = log.Advocates
        ? `${log.Advocates.firstName} ${log.Advocates.lastName}`
        : null;

      const byIndex = displayDescription.lastIndexOf("||by:");
      if (byIndex !== -1) {
        const embedded = displayDescription.substring(byIndex + 5);
        displayDescription = displayDescription.substring(0, byIndex);
        if (!advocateName) {
          advocateName = embedded;
        }
      }

      // Strip embedded ||formType: tag (used in DELETE logs to survive client deletion)
      const formTypeTagIndex = displayDescription.indexOf("||formType:");
      if (formTypeTagIndex !== -1) {
        displayDescription = displayDescription.substring(0, formTypeTagIndex);
      }

      return {
        ...log,
        description: displayDescription,
        advocateName,
        clientName,
        formType,
      };
    });

    return NextResponse.json({
      logs: enrichedLogs,
      count: typeof count === "number" ? count : logsData.length,
    });
  } catch (err) {
    console.error("[/api/user-logs] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const authResult = await requireApiUser();
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const { description, logType, client_id, advocateId } = body;

    let advocate_id = advocateId || null;
    let advocateName = null;

    if (!advocate_id) {
      advocate_id = authResult.session.user.advocateId || null;
      advocateName = authResult.session.user.name || null;
    }

    if (advocate_id && !advocateName) {
      const { data: advocateData } = await supabase
        .from("Advocates")
        .select("advocate_id, firstName, lastName")
        .eq("advocate_id", advocate_id)
        .single();
      if (advocateData?.firstName || advocateData?.lastName) {
        advocateName = `${advocateData.firstName || ""} ${advocateData.lastName || ""}`.trim();
      }
    }

    // Embed advocate name as a structured suffix so it survives advocate deletion
    const fullDescription = advocateName
      ? `${description}||by:${advocateName}`
      : description;

    const { error } = await supabase.from("User Logs").insert([
      { description: fullDescription, logType, advocate_id, client_id },
    ]);

    if (error) {
      console.error("[/api/user-logs POST] Error inserting log:", error);
      return NextResponse.json(
        { error: "Error inserting log", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/user-logs POST] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
