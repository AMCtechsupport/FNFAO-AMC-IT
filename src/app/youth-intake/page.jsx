"use client";
import { useSearchParams } from "next/navigation";
import UserHome from "../user-home/page";
import YouthIntakeForm from "../youth-intake-components/YouthIntakeForm";

export default function YouthIntake() {
  const searchParams = useSearchParams();
  const editClientId = searchParams.get('edit');
  const isEditMode = !!editClientId;

  return (
    <UserHome>
      <main className="min-h-screen bg-gray-100 p-6">
        {isEditMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5 text-sm text-center text-blue-800">
            <strong>Edit Mode:</strong> You are editing an existing youth client record.
          </div>
        )}
        <YouthIntakeForm editClientId={editClientId} isEditMode={isEditMode} />
      </main>
    </UserHome>
  );
}
