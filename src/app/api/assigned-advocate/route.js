import { NextResponse } from "next/server";
import supabase from "../../lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const client_id = searchParams.get("client_id");
    const userId = searchParams.get("userId") || "";

    if (!client_id) {
      return NextResponse.json({ error: "client_id is required" }, { status: 400 });
    }

    // Fetch assignment
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
      return NextResponse.json({ advocateName: null, isAssignedAdvocate: false });
    }

    // Fetch advocate name
    const { data: advocateData, error: advocateError } = await supabase
      .from("Advocates")
      .select("firstName, lastName, advocate_id")
      .eq("advocate_id", assignmentData.advocate_id)
      .single();

    if (advocateError || !advocateData) {
      return NextResponse.json({ advocateName: null, isAssignedAdvocate: false });
    }

    const advocateName = `${advocateData.firstName} ${advocateData.lastName}`;
    let isAssignedAdvocate = false;

    // Check if the current user is the assigned advocate
    if (userId) {
      const { data: currentAdvocate } = await supabase
        .from("Advocates")
        .select("advocate_id")
        .eq("clerk_user_id", userId)
        .single();

      isAssignedAdvocate =
        !!currentAdvocate && currentAdvocate.advocate_id === advocateData.advocate_id;
    }

    return NextResponse.json({ advocateName, isAssignedAdvocate });
  } catch (err) {
    console.error("[/api/assigned-advocate] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { client_id, advocate_id } = body;

    if (!client_id || !advocate_id) {
      return NextResponse.json({ error: "client_id and advocate_id are required" }, { status: 400 });
    }

    // Check if assignment already exists
    const { data: existing, error: checkError } = await supabase
      .from("Assigned Advocates")
      .select("*")
      .eq("client_id", client_id)
      .eq("advocate_id", advocate_id);

    if (checkError) {
      console.error("[/api/assigned-advocate POST] Check error:", checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({ alreadyAssigned: true });
    }

    // Insert new assignment
    const { error: insertError } = await supabase
      .from("Assigned Advocates")
      .insert([{ client_id, advocate_id }]);

    if (insertError) {
      console.error("[/api/assigned-advocate POST] Insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/assigned-advocate POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}
