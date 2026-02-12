"use client";
import { useState, useEffect } from "react";
import UserHome from "../../user-home/page";
import styles from "./page.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "@clerk/nextjs";
import supabase from "../../lib/supabase";

import "react-tabs/style/react-tabs.css";
import { useParams, useRouter } from "next/navigation";
import FullIntakeForm from "../../full-intake-components/fullIntakeForm";

export default function AdultClientEdit({}) {
  const params = useParams();
  const router = useRouter();
  const client_id = params?.clientId || "61";

  const [clientName, setClientName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { userId, getToken } = useAuth();

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/user-dashboard");
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

  return (
    <UserHome>
      <div className={styles.fullIntakeContainer}>
        <div className={styles.container}>
          {/* Close button: top-left */}
          <div style={{ marginTop: "30px", marginBottom: "10px" }}>
            <button
              onClick={handleClose}
              style={{
                backgroundColor: "#070707",
                color: "white",
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>

          <div style={{ marginTop: "20px" }}>
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
                Editing Adult Client
              </h2>
              <p style={{ color: "#075985", margin: 0, fontSize: "14px" }}>
                You are editing an existing adult client record (Name:{" "}
                {isLoading ? "Loading..." : clientName})
              </p>
            </div>

            <div style={{ marginTop: "-50px" }}>
              <FullIntakeForm
                client_id={client_id}
                userId={userId}
                isEditMode={true}
                getToken={getToken}
              />
            </div>
          </div>
        </div>
      </div>
    </UserHome>
  );
}
