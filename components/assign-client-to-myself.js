"use client";

import { updateClientStatus } from "./client-active";
import { useState, useEffect, useRef } from "react";

import supabase from "../../lib/supabase";

export default async function AssignAdvocateToMyself({ clientToAssign }) {
    let advocate = null;
    let advocateError = null;

    try {
    advocate = await getAdvocateProfile();
    } catch (err) {
    console.error("Error fetching advocate:", err.message);
    advocateError = err.message || "Could not load advocate profile";
    }

    let advocateId = advocate.advocate_id;

    const { error: autoassignError } = await supabase
      .from("Assigned Advocates")
      .insert([{ clientToAssign, advocateId }]);

    if (autoassignError) {
        throw autoassignError;
    }
}