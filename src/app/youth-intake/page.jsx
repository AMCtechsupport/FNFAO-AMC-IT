"use client";
import { useSearchParams } from "next/navigation";
import UserHome from "../user-home/page";
import styles from "./youthIntake.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import YouthIntakeForm from "../youth-intake-components/YouthIntakeForm";

export default function YouthIntake() {
  const searchParams = useSearchParams();
  const editClientId = searchParams.get('edit');
  const isEditMode = !!editClientId;

  return (
    <UserHome>
      <div className={styles.container}>
        <div className={styles.centeredContent}>
          {isEditMode && (
            <div style={{
              backgroundColor: '#dbeafe',
              border: '1px solid #93c5fd',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <strong>Edit Mode:</strong> You are editing an existing youth client record.
            </div>
          )}
          <YouthIntakeForm editClientId={editClientId} isEditMode={isEditMode} />
        </div>
      </div>
    </UserHome>
  );
}