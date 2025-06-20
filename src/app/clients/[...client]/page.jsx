"use client";
import UserHome from "../../user-home/page";
import styles from "./page.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "@clerk/nextjs";

import "react-tabs/style/react-tabs.css";
import { useParams } from 'next/navigation';
import FullIntakeForm from "../../full-intake-components/fullIntakeForm";

export default function FullIntake({}) {
    const params = useParams(); // e.g., { client: ['190'] }
    const clientArray = params?.client;

    const client_id = Array.isArray(clientArray) ? clientArray[0] : '61';

    const { getToken } = useAuth();

    return (
        <UserHome>
            <div className={styles.fullIntakeContainer}>
                <div className={styles.container}>
                    <FullIntakeForm
                        client_id = {client_id}
                        getToken={getToken} />
                </div>
            </div>
        </UserHome>
    );
}

