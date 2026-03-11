"use client";
import styles from "../../youth-intake/youthIntake.module.css";
import { Field, ErrorMessage } from "formik";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import ValidNameInput from "@/components/ValidNameInput";
import StatusCFSFileSelect from "@/components/StatusCFSFileSelect";
import ManageCfsAgencies from "@/components/ManageCfsAgencies";

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

const YouthIntakeAgencyInfo = ({ values, errors }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#6100D7" }}>
        Agency Information
      </div>
      <div className="p-5 space-y-4">

        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className={labelCls}>Are you currently in care?</label>
              <RadioPair name="inCare" />
            </div>
            {values.inCare === "yes" && (
              <div className="col-span-8">
                <Field name="statusCFSFile" component={StatusCFSFileSelect} label="CFS File Status" error={errors.statusCFSFile} />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className={labelCls}>When is the last time you had a face-to-face with your Agency Worker?</label>
          <Field as="textarea" name="lastFaceToFace" placeholder="Last face-to-face was..." className={styles.textarea} />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <Field name="cfsAgency" component={ManageCfsAgencies} label="CFS Agency" error={errors.cfsAgency} />
          </div>
          <div className="col-span-4">
            <label className={labelCls} htmlFor="cfsAgentFullName">CFS Agent Full Name:</label>
            <Field id="cfsAgentFullName" name="cfsAgentFullName" component={ValidNameInput} placeholder="First Name, Last Name" />
          </div>
          <div className="col-span-4">
            <label className={labelCls}>CFS Agent Phone Number:</label>
            <Field name="cfsAgentNumber" component={PhoneNumberInput} placeholder="(123) 456-7890" />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <label className={labelCls} htmlFor="cfsAgentEmail">Email:</label>
            <Field type="email" id="cfsAgentEmail" name="cfsAgentEmail" placeholder="e.g., name@example.com" className={fieldCls} />
            <ErrorMessage name="cfsAgentEmail" component={() => <p className={styles.errorText}>{errors.cfsAgentEmail}</p>} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default YouthIntakeAgencyInfo;
