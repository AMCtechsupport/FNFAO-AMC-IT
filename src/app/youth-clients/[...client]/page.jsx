"use client";
import UserHome from "../../user-home/page";
import styles from "./page.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "@clerk/nextjs";

import "react-tabs/style/react-tabs.css";
import { useParams } from 'next/navigation';
import { PreIntakeForm } from "../../youth-intake/page";

export default function YouthClientEdit({}) {
    const params = useParams(); // e.g., { client: ['301'] }
    const clientArray = params?.client;

    const client_id = Array.isArray(clientArray) ? clientArray[0] : '61';

    const { getToken } = useAuth();

    return (
        <UserHome>
            <div className={styles.fullIntakeContainer}>
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
                            Editing Youth Client
                        </h2>
                        <p style={{ 
                            color: '#1e40af', 
                            margin: 0,
                            fontSize: '14px'
                        }}>
                            You are editing an existing youth client record (ID: {client_id})
                        </p>
                    </div>
                    <PreIntakeForm
                        editClientId={client_id}
                        isEditMode={true}
                        getToken={getToken}
                    />
                </div>
            </div>
        </UserHome>
    );
} 