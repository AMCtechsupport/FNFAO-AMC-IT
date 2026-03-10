"use client";
import { Field } from "formik";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";

const labelCls = "block text-xs font-medium text-gray-600 mb-1";

const YouthIntakeEmergencyContact = ({ errors }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#47315E" }}>
        Emergency Contact
      </div>
      <div className="p-5">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <InputField name="emergencyContactFirstName" label="First Name:" placeholder="Enter First Name" error={errors.emergencyContactFirstName} />
          </div>
          <div className="col-span-4">
            <InputField name="emergencyContactLastName" label="Last Name:" placeholder="Enter Last Name" error={errors.emergencyContactLastName} />
          </div>
          <div className="col-span-4">
            <label className={labelCls} htmlFor="emergencyContactNumber">Phone Number:</label>
            <Field name="emergencyContactNumber" component={PhoneNumberInput} placeholder="(123) 456-7890" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouthIntakeEmergencyContact;
