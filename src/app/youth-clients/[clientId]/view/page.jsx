"use client";
import { useState, useEffect } from "react";
import UserHome from "../../../user-home/page";
import styles from "../page.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import supabase from "../../../lib/supabase";

import YouthIntakeForm from "../../../youth-intake-components/YouthIntakeForm";

export default function YouthClientView() {
  const params = useParams();
  const router = useRouter();
  const client_id = params?.clientId;

  const [clientName, setClientName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

    const handleClose = () => {
    if (history.state && history.state.idx > 0) {
      router.back();
    } else {
      router.push("/clients");
    }
  };

  useEffect(() => {
    const fetchClientName = async () => {
      if (!client_id) return;

      try {
        setIsLoading(true);
        const { data: client, error } = await supabase
          .from("Clients")
          .select("firstName, lastName")
          .eq("client_id", client_id)
          .single();

        if (error) {
          console.error("Error fetching client name:", error);
          setClientName("Unknown Client");
        } else {
          setClientName(`${client.firstName} ${client.lastName}`);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setClientName("Unknown Client");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientName();
  }, [client_id]);

  const buttonRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: "1000px",
    margin: "20px auto 10px auto",
  };

  const closeBtnStyle = {
    backgroundColor: "#111827", // keep black
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
  };

  const editBtnStyle = {
    backgroundColor: "#7C3AED", // purple
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  };

  return (
    <UserHome>
        <div className={styles.container}>
          {/* TOP BUTTON ROW */}
          <div style={buttonRowStyle}>
            <button onClick={handleClose} style={closeBtnStyle}>
              Close
            </button>

            <Link href={`/youth-clients/${client_id}`} style={editBtnStyle}>
              Edit
            </Link>
          </div>

          {/* Header Box */}
          <div
            style={{
              backgroundColor: "#f0f9ff",
              border: "1px solid #0ea5e9",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "24px",
              textAlign: "center",
              width: "100%",
              maxWidth: "1000px",
              boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <h2
              style={{
                color: "#0c4a6e",
                margin: "0 0 8px 0",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              Viewing Youth Client
            </h2>
            <p style={{ color: "#075985", margin: 0, fontSize: "14px" }}>
              Read-only view (Name: {isLoading ? "Loading..." : clientName})
            </p>
          </div>

          {/* Form */}
          <YouthIntakeForm editClientId={client_id} isEditMode={true} isViewOnly={true} />

          {/* BOTTOM BUTTON ROW */}
          <div style={buttonRowStyle}>
            <button onClick={handleClose} style={closeBtnStyle}>
              Close
            </button>

            <Link href={`/youth-clients/${client_id}`} style={editBtnStyle}>
              Edit
            </Link>
          </div>
        </div>
    </UserHome>
  );
}
