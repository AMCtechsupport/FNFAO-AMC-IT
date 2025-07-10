"use client";
import UserHome from "../user-home/page";
import styles from "./preIntake.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import PreIntakeForm from "../pre-intake-components/preIntakeForm";

export default function PreIntake() {
  return (
    <UserHome>
      <div className={styles.preIntakeContainer}>
        <div className={styles.container}>
          <PreIntakeForm />
        </div>
      </div>
    </UserHome>
  );
}