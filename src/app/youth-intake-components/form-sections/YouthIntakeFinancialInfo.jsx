"use client";
import styles from "../../youth-intake/youthIntake.module.css";
import { Field, ErrorMessage } from "formik";
import ValidNameInput from "@/components/ValidNameInput";
import PhoneNumberInput from "@/components/ValidPhoneNumber";

const fieldCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white";
const labelCls = "block text-xs font-medium text-gray-600 mb-1";

const RadioPair = ({ name }) => (
  <div className="flex items-center gap-4 mt-1.5">
    <label className="flex items-center gap-1.5 cursor-pointer text-sm font-normal text-gray-700">
      <Field type="radio" name={name} value="yes" /><span>Yes</span>
    </label>
    <label className="flex items-center gap-1.5 cursor-pointer text-sm font-normal text-gray-700">
      <Field type="radio" name={name} value="no" /><span>No</span>
    </label>
  </div>
);

const YouthIntakeFinancialInfo = ({ errors }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#47315E" }}>
        Financial Information
      </div>
      <div className="p-5 space-y-4">

        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className={labelCls}>Do you have a Bank Account?</label>
              <RadioPair name="bankAccount" />
            </div>
            <div className="col-span-6">
              <label className={labelCls}>Are you on Employment and Income Assistance?</label>
              <RadioPair name="incomeAssistance" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <label className={labelCls} htmlFor="caseWorkerFullName">Case Worker's Full Name:</label>
            <Field id="caseWorkerFullName" name="caseWorkerFullName" component={ValidNameInput} placeholder="First Name, Last Name" />
          </div>
          <div className="col-span-4">
            <label className={labelCls}>Case Worker Phone Number:</label>
            <Field name="caseWorkerPhoneNumber" component={PhoneNumberInput} placeholder="(123) 456-7890" />
          </div>
          <div className="col-span-4">
            <label className={labelCls} htmlFor="caseWorkerEmail">Case Worker Email:</label>
            <Field type="email" id="caseWorkerEmail" name="caseWorkerEmail" placeholder="e.g., name@example.com" className={fieldCls} />
            <ErrorMessage name="caseWorkerEmail" component={() => <p className={styles.errorText}>{errors.caseWorkerEmail}</p>} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default YouthIntakeFinancialInfo;
