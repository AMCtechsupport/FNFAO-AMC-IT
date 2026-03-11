"use client";
import styles from "../../pre-intake/preIntake.module.css";
import { Field, ErrorMessage } from "formik";

const labelCls = "block text-xs font-medium text-gray-600 mb-1";

const PreIntakeStaffOnly = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#6100D7" }}>
        Staff Only
      </div>
      <div className="p-5 space-y-4">

        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <label className={labelCls}>
            If we are unable to assist, please list why (Example: they do not fit FNFAO's mandate, etc.):
          </label>
          <Field as="textarea" name="unableToAssistExplained" placeholder="Unable to assist because..." className={styles.textarea} />
          <ErrorMessage name="unableToAssistExplained" component="div" className={styles.errorText} />
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <label className={labelCls}>
            If we are unable to assist, please identify where you are referring them to for support:
          </label>
          <Field as="textarea" name="referForSupport" placeholder="Referring to..." className={styles.textarea} />
          <ErrorMessage name="referForSupport" component="div" className={styles.errorText} />
        </div>

      </div>
    </div>
  );
};

export default PreIntakeStaffOnly;
