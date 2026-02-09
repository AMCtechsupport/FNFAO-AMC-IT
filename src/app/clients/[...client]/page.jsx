"use client";
import { useState, useEffect } from "react";
import UserHome from "../../user-home/page";
import styles from "./page.module.css"; 
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "@clerk/nextjs";
import supabase from "../../lib/supabase";

import "react-tabs/style/react-tabs.css";
import { useParams } from 'next/navigation';
import FullIntakeForm from "../../full-intake-components/fullIntakeForm";

export default function AdultClientEdit({}) {
    const params = useParams(); // e.g., { client: ['190'] }
    const clientArray = params?.client;

    const client_id = Array.isArray(clientArray) ? clientArray[0] : '61';
    const [clientName, setClientName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const { userId, getToken } = useAuth();

    // Fetch client name from database
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
            <div className={styles.from}>
                <div className={styles.container}>
                        <div style={{
                            backgroundColor: '#dbeafe',
                            border: '1px solid #3b82f6',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '24px',
                            textAlign: 'center'
                        }}>
                            <h2 style={{ 
                                color: '#1d4ed8', 
                                margin: '0 0 8px 0',
                                fontSize: '20px',
                                fontWeight: 'bold'
                            }}>
                                Editing Adult Client
                            </h2>
                            <p style={{ 
                                color: '#1e40af', 
                                margin: 0,
                                ontSize: '14px'
                            }}>
                                You are editing an existing adult client record (Name: {isLoading ? 'Loading...' : clientName})
                            </p>
                        </div>
                            <FullIntakeForm
                                client_id={client_id}
                                userId={userId}
                                isEditMode={true}
                                getToken={getToken}
                            />
                    </div>
                </div>
        </UserHome>
    );
}

