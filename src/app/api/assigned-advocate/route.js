import { NextResponse } from "next/server";
import supabase from "../../lib/supabase.server";
import { requireApiUser } from "../../lib/api-auth";
import { sendClientAssignmentEmail } from "../../lib/email";

async function logAssignment({
  description,
  logType,
  client_id,
  advocate_id,
  actorAdvocateId,
}) {
  await supabase.from("User Logs").insert([
    {
      description,
      logType,
      client_id,
      advocate_id: actorAdvocateId || advocate_id || null,
    },
  ]);
}

export async function GET(request) {
  const authResult = await requireApiUser();
  if (!authResult.ok) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const client_id = searchParams.get("client_id");
    const userId = searchParams.get("userId") || "";

    if (!client_id) {
      return NextResponse.json({ error: "client_id is required" }, { status: 400 });
    }

    let currentAdvocateId = null;
    if (userId) {
      currentAdvocateId = parseInt(userId, 10) || null;
    }

    const { data: assignmentData, error: assignmentError } = await supabase
      .from("Assigned Advocates")
      .select("advocate_id")
      .eq("client_id", client_id)
      .maybeSingle();

    if (assignmentError) {
      console.error("[/api/assigned-advocate] Error fetching assignment:", assignmentError);
      return NextResponse.json({ error: assignmentError.message }, { status: 500 });
    }

    if (!assignmentData?.advocate_id) {
      return NextResponse.json({
        advocateName: null,
        advocate_id: null,
        isAssignedAdvocate: false,
        currentAdvocateId,
      });
    }

    const { data: advocateData, error: advocateError } = await supabase
      .from("Advocates")
      .select("firstName, lastName, advocate_id")
      .eq("advocate_id", assignmentData.advocate_id)
      .single();

    if (advocateError || !advocateData) {
      return NextResponse.json({
        advocateName: null,
        advocate_id: null,
        isAssignedAdvocate: false,
        currentAdvocateId,
      });
    }

    const advocateName = `${advocateData.firstName} ${advocateData.lastName}`;
    const isAssignedAdvocate =
      currentAdvocateId !== null && currentAdvocateId === advocateData.advocate_id;

    return NextResponse.json({
      advocateName,
      advocate_id: advocateData.advocate_id,
      isAssignedAdvocate,
      currentAdvocateId,
    });
  } catch (err) {
    console.error("[/api/assigned-advocate] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const authResult = await requireApiUser();
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const client_id = Number(body.client_id);
    const advocate_id = Number(body.advocate_id);

    if (!client_id || !advocate_id) {
      return NextResponse.json({ error: "client_id and advocate_id are required" }, { status: 400 });
    }

    const { data: existingSame, error: checkError } = await supabase
      .from("Assigned Advocates")
      .select("*")
      .eq("client_id", client_id)
      .eq("advocate_id", advocate_id);

    if (checkError) {
      console.error("[/api/assigned-advocate POST] Check error:", checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existingSame && existingSame.length > 0) {
      return NextResponse.json({ alreadyAssigned: true });
    }

    const { data: priorAssignments } = await supabase
      .from("Assigned Advocates")
      .select("advocate_id")
      .eq("client_id", client_id);

    const { error: deleteError } = await supabase
      .from("Assigned Advocates")
      .delete()
      .eq("client_id", client_id);

    if (deleteError) {
      console.error("[/api/assigned-advocate POST] Delete error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    const { error: insertError } = await supabase
      .from("Assigned Advocates")
      .insert([{ client_id, advocate_id }]);

    if (insertError) {
      console.error("[/api/assigned-advocate POST] Insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    await supabase
      .from("Clients")
      .update({ clientStatus: "Active" })
      .eq("client_id", client_id);

    const [{ data: client }, { data: advocate }] = await Promise.all([
      supabase
        .from("Clients")
        .select("firstName, lastName")
        .eq("client_id", client_id)
        .single(),
      supabase
        .from("Advocates")
        .select("firstName, lastName, email")
        .eq("advocate_id", advocate_id)
        .single(),
    ]);

    const clientName = [client?.firstName, client?.lastName].filter(Boolean).join(" ");
    const advocateName = [advocate?.firstName, advocate?.lastName].filter(Boolean).join(" ");

    if (priorAssignments?.length) {
      await logAssignment({
        description: `Reassigned client ${clientName || client_id} to advocate ${advocateName}`,
        logType: "UPDATE",
        client_id,
        advocate_id,
        actorAdvocateId: authResult.session.user.advocateId,
      });
    } else {
      await logAssignment({
        description: `Assigned advocate ${advocateName} to client: ${clientName || client_id}`,
        logType: "INSERT",
        client_id,
        advocate_id,
        actorAdvocateId: authResult.session.user.advocateId,
      });
    }

    if (advocate?.email) {
      await sendClientAssignmentEmail({
        advocateEmail: advocate.email,
        advocateFirstName: advocate.firstName,
        advocateLastName: advocate.lastName,
        clientFirstName: client?.firstName,
        clientLastName: client?.lastName,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/assigned-advocate POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const authResult = await requireApiUser();
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const client_id = Number(body.client_id);

    if (!client_id) {
      return NextResponse.json({ error: "client_id is required" }, { status: 400 });
    }

    const { data: client } = await supabase
      .from("Clients")
      .select("firstName, lastName")
      .eq("client_id", client_id)
      .single();

    const { error: deleteError } = await supabase
      .from("Assigned Advocates")
      .delete()
      .eq("client_id", client_id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    await supabase
      .from("Clients")
      .update({ clientStatus: "Inactive" })
      .eq("client_id", client_id);

    const clientName = [client?.firstName, client?.lastName].filter(Boolean).join(" ");
    await logAssignment({
      description: `Unassigned advocate from client: ${clientName || client_id}`,
      logType: "DELETE",
      client_id,
      actorAdvocateId: authResult.session.user.advocateId,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/assigned-advocate DELETE] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}
