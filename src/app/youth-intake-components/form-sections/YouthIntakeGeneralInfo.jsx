"use client";
import styles from "../../youth-intake/youthIntake.module.css";
import { Field, ErrorMessage, useFormikContext } from "formik";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import ProvincesSelect from "@/components/ProvincesSelect";
import PronounSelect from "@/components/Pronouns";
import FirstNationSelect from "@/components/FirstNationSelect";

const labelCls = "block text-xs font-medium text-gray-600 mb-1";
const today = new Date().toISOString().split("T")[0]; // get the current date

const YouthIntakeGeneralInfo = ({ errors, isEditMode, assignedAdvocateName }) => {
  const { setFieldValue, values } = useFormikContext();

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#6100D7" }}>
          General Information
        </div>
        <div className="p-5 space-y-4">

          {/* Meta row - edit/view mode only */}
          {isEditMode && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Created At</span>
                  <span className="text-sm text-gray-800">{values.createdAt ? values.createdAt.split("T")[0] : "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Last Updated</span>
                  <span className="text-sm text-gray-800">{values.dateModified ? values.dateModified.split("T")[0] : "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Assigned To</span>
                  <span className="text-sm text-gray-800">{assignedAdvocateName || "—"}</span>
                </div>
              </div>
              <div className="border-t border-gray-100" />
            </>
          )}
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
              <PronounSelect name="pronouns" label="Preferred Pronouns:" error={errors.pronouns} />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <label className={labelCls} htmlFor="dateOfBirth">Birth Date:*</label>
              <Field type="date" id="dateOfBirth" name="dateOfBirth" className={styles.input} max={today} />
              <ErrorMessage name="dateOfBirth" component={() => <p className={styles.errorText}>{errors.dateOfBirth}</p>} />
            </div>
            <div className="col-span-3">
              <InputField name="address" label="Address:" placeholder="e.g., 123 Main Street" error={errors.address} />
            </div>
            <div className="col-span-3">
              <InputField name="city" label="City:" placeholder="e.g., Winnipeg" error={errors.city} />
            </div>
            <div className="col-span-3">
              <InputField name="postalCode" label="Postal Code:" placeholder="A1A 1A1" error={errors.postalCode} />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <ProvincesSelect name="province" label="Province:" error={errors.province} />
            </div>
            <div className="col-span-3">
              <label className={labelCls} htmlFor="phoneNumber">Phone Number:</label>
              <Field name="phoneNumber" component={PhoneNumberInput} placeholder="(123) 456-7890" />
            </div>
            <div className="col-span-5">
              <label className={labelCls} htmlFor="socialMedia">Social Media Contact:</label>
              <Field type="text" id="socialMedia" name="socialMedia" placeholder="e.g., 'Name' on 'Platform'" className={styles.input} />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              <label className={labelCls} htmlFor="email">Email:</label>
              <Field type="email" id="email" name="email" placeholder="e.g., name@example.com" className={styles.input} />
              <ErrorMessage name="email" component={() => <p className={styles.errorText}>{errors.email}</p>} />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <Field name="firstNationMembership" component={FirstNationSelect} label="First Nation Membership" error={errors.firstNationMembership} />
            </div>
            <div className="col-span-4">
              <label className={labelCls}>Treaty Number (10-Digit):</label>
              <Field
                type="text" inputMode="numeric" pattern="\d*" maxLength={10}
                id="treatyNumber" placeholder="1234567890" name="treatyNumber"
                className={styles.input}
                onChange={(e) => { const d = String(e.target.value || "").replace(/\D/g, ""); setFieldValue("treatyNumber", d); }}
                onBlur={(e) => { const d = String(e.target.value || "").replace(/\D/g, ""); setFieldValue("treatyNumber", d.length > 0 ? d.padStart(10, "0") : ""); }}
              />
            </div>
            <div className="col-span-4">
              <Field name="otherFirstNation" component={FirstNationSelect} label="Other First Nation Membership" error={errors.otherFirstNation} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default YouthIntakeGeneralInfo;
