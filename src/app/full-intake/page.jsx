"use client";
import UserHome from "../user-home/page";
import styles from "./fullIntake.module.css";
import { useAuth } from "@clerk/nextjs";
import "react-tabs/style/react-tabs.css";
import FullIntakeForm from "../full-intake-components/fullIntakeForm";


export default function FullIntake({client_id}) {
    const testClientId = client_id || "61";
    const { userId, getToken } = useAuth();

    return (
        <UserHome>
            <div className={styles.fullIntakeContainer}>
                <div className={styles.container}>
                    <FullIntakeForm
                        client_id = {testClientId}
                        userId={userId}
                        getToken={getToken} />
                </div>
            </div>
        </UserHome>
    );
}
