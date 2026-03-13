"use client";
import UserHome from "../user-home/page";
import styles from "./preIntake.module.css";
import PreIntakeForm from "../pre-intake-components/PreIntakeForm";

export default function PreIntake() {
  return (
    <UserHome>
      <main className="min-h-screen bg-gray-100 p-6">
        <PreIntakeForm />
      </main>
    </UserHome>
  );
}
