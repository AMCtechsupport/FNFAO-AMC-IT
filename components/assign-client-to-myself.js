"use client";

import { updateClientStatus } from "./client-active";
import { useState, useEffect, useRef } from "react";

export default function AssignAdvocate() {
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isAssigned, setIsAssigned] = useState(false);

}