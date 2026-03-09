"use client";
import React from "react";
import styles from "../../pre-intake/preIntake.module.css";
import { Field, ErrorMessage } from "formik";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import ReferredBySelect from "@/components/ReferredBySelect";
import ProvincesSelect from "@/components/ProvincesSelect";

const fieldCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white";
const labelCls = "block text-xs font-medium text-gray-600 mb-1";

const PreIntakeGeneralInfo = ({ errors }) => {
  return (
    <>
      {/* Referred By */}
      <div className="flex justify-end mb-4">
        <div className="w-72">
          <ReferredBySelect name="referredBy" label="How did the client learn about FNFAO?" error={errors.referredBy} />
        </div>
      </div>

      {/* General Information Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#47315E" }}>
          General Information
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <InputField name="firstName" label="First Name:*" placeholder="Enter First Name" error={errors.firstName} />
            </div>
            <div className="col-span-3">
              <InputField name="middleName" label="Middle Name:" placeholder="Enter Middle Name" error={errors.middleName} />
            </div>
            <div className="col-span-3">
              <InputField name="lastName" label="Last Name:*" placeholder="Enter Last Name" error={errors.lastName} />
            </div>
            <div className="col-span-3">
              <label className={labelCls} htmlFor="dateOfBirth">Date of Birth:*</label>
              <Field type="date" id="dateOfBirth" name="dateOfBirth" className={fieldCls} />
              <ErrorMessage name="dateOfBirth" component={() => <p className={styles.errorText}>{errors.dateOfBirth}</p>} />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <InputField name="address" label="Address:" placeholder="e.g., 123 Main Street" error={errors.address} />
            </div>
            <div className="col-span-3">
              <InputField name="city" label="City:" placeholder="e.g., Winnipeg" error={errors.city} />
            </div>
            <div className="col-span-4">
              <ProvincesSelect name="province" label="Province:" error={errors.province} />
            </div>
            <div className="col-span-2">
              <InputField name="postalCode" label="Postal code:" placeholder="A1A 1A1" error={errors.postalCode} />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <label className={labelCls} htmlFor="phoneNumber">Phone Number:</label>
              <Field type="number" id="phoneNumber" name="phoneNumber" component={PhoneNumberInput} placeholder="(123) 456-7890" />
            </div>
            <div className="col-span-4">
              <label className={labelCls} htmlFor="email">Email:</label>
              <Field type="email" id="email" name="email" placeholder="e.g., name@example.com" className={fieldCls} />
              <ErrorMessage name="email" component={() => <p className={styles.errorText}>{errors.email}</p>} />
            </div>
          </div>

          {/* Emergency Contact sub-panel */}
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Emergency Contact</p>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <InputField name="emergencyContactFirstName" label="First Name:" placeholder="Enter First Name" error={errors.emergencyContactFirstName} />
              </div>
              <div className="col-span-4">
                <InputField name="emergencyContactLastName" label="Last Name:" placeholder="Enter Last Name" error={errors.emergencyContactLastName} />
              </div>
              <div className="col-span-4">
                <label className={labelCls} htmlFor="emergencyContactNumber">Phone Number:</label>
                <Field type="number" id="emergencyContactNumber" name="emergencyContactNumber" component={PhoneNumberInput} placeholder="(123) 456-7890" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PreIntakeGeneralInfo;
