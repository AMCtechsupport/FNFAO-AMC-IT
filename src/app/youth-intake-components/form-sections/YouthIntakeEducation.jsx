"use client";
import styles from "../../youth-intake/youthIntake.module.css";
import { Field, FieldArray } from "formik";
import ValidNameInput from "@/components/ValidNameInput";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import EmailInput from "@/components/ValidEmailInput";

const labelCls = "block text-xs font-medium text-gray-600 mb-1";

const RadioPair = ({ name, labelYes = "Yes", labelNo = "No" }) => (
  <div className="flex items-center gap-4 mt-1.5">
    <label className="flex items-center gap-1.5 cursor-pointer text-sm font-normal text-gray-700">
      <Field type="radio" name={name} value="yes" /><span>{labelYes}</span>
    </label>
    <label className="flex items-center gap-1.5 cursor-pointer text-sm font-normal text-gray-700">
      <Field type="radio" name={name} value="no" /><span>{labelNo}</span>
    </label>
  </div>
);

const YouthIntakeEducation = ({ values, setFieldValue, errors, isEditing }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
        Education
      </div>
      <div className="p-5 space-y-4">

        {/* In School */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className={labelCls}>Are you currently in school or any other program?</label>
              <RadioPair name="inSchool" />
            </div>
            {values.inSchool === "yes" && (
              <div className="col-span-8 space-y-3">
                <div>
                  <label className={labelCls}>What school or program are you attending?</label>
                  <Field as="textarea" name="schoolAttending" placeholder="Attending at..." className={styles.textarea} />
                </div>
                <div>
                  <label className={labelCls}>What grade are you currently in?</label>
                  <Field as="textarea" name="currentGrade" placeholder="Current grade level is..." className={styles.textarea} />
                </div>
                <div>
                  <label className={labelCls}>Are you a full-time or part-time student?</label>
                  <div className="flex items-center gap-4 mt-1.5">
                    <label className="flex items-center gap-1.5 cursor-pointer text-sm font-normal text-gray-700">
                      <Field type="radio" name="fullStudent" value="yes" /><span>Full-Time</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-sm font-normal text-gray-700">
                      <Field type="radio" name="fullStudent" value="no" /><span>Part-Time</span>
                    </label>
                  </div>
                </div>
                {values.fullStudent === "no" && (
                  <div>
                    <label className={labelCls}>What days/hours do you attend school?</label>
                    <Field as="textarea" name="schoolSchedule" placeholder="e.g., Client attends X hours over X days..." className={styles.textarea} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Personal ID */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Personal Identification (Check all that apply)</p>
          <div className="grid grid-cols-12 gap-2">
            {[
              { name: "birthCertificate", label: "Birth Certificate" },
              { name: "driversLicense", label: "Driver's License" },
              { name: "healthCard", label: "Manitoba Health Card" },
              { name: "statusCard", label: "Status Card" },
              { name: "enhancedID", label: "Enhanced I.D." },
              { name: "studentID", label: "Student I.D." },
            ].map(({ name, label }) => (
              <div key={name} className="col-span-4 flex items-center gap-2">
                <Field
                  type="checkbox"
                  name={name}
                  id={name}
                  onChange={({ target: { checked } }) => setFieldValue(name, checked)}
                  className="w-4 h-4 accent-purple-600/80"
                />
                <label htmlFor={name} className="text-sm font-normal text-gray-700 cursor-pointer">{label}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Elder Access */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className={labelCls}>Do you have access to an Elder or Counsellor?</label>
              <RadioPair name="accessElder" />
            </div>
            {values.accessElder === "no" && (
              <div className="col-span-8">
                <label className={labelCls}>Are you interested in getting access to an Elder or Counsellor?</label>
                <Field as="textarea" name="accessElderExplained" placeholder="Is/Isn't interested in access to Elder/Counsellor because..." className={styles.textarea} />
              </div>
            )}
          </div>
        </div>

        {/* Educational Support Persons */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Educational Support Persons</p>
          <FieldArray name="educationalPersons">
            {({ push, remove }) => (
              <div className="space-y-4">
                {values.educationalPersons.map((educationalPerson, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Person {index + 1}</p>
                      {isEditing && (
                      <button type="button" onClick={() => remove(index)} className="text-xs px-3 py-1 rounded-full font-medium transition-colors border" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)", color: "#ef4444", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#ef4444"; e.currentTarget.style.color = "#ffffff"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"; e.currentTarget.style.color = "#ef4444"; }}>
                        Delete
                      </button>
                      )}
                    </div>
                    <div className="grid grid-cols-12 gap-4 mb-3">
                      <div className="col-span-3">
                        <label className={labelCls} htmlFor={`educationalPersons.${index}.firstName`}>First Name:</label>
                        <Field id={`educationalPersons.${index}.firstName`} name={`educationalPersons.${index}.firstName`} placeholder="Person's First Name" component={ValidNameInput} />
                      </div>
                      <div className="col-span-3">
                        <label className={labelCls} htmlFor={`educationalPersons.${index}.middleName`}>Middle Name:</label>
                        <Field id={`educationalPersons.${index}.middleName`} name={`educationalPersons.${index}.middleName`} placeholder="Person's Middle Name" component={ValidNameInput} />
                      </div>
                      <div className="col-span-4">
                        <label className={labelCls} htmlFor={`educationalPersons.${index}.lastName`}>Last Name:</label>
                        <Field id={`educationalPersons.${index}.lastName`} name={`educationalPersons.${index}.lastName`} placeholder="Person's Last Name" component={ValidNameInput} />
                      </div>
                    </div>
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-4">
                        <label className={labelCls} htmlFor={`educationalPersons.${index}.relationship`}>Relationship:</label>
                        <Field id={`educationalPersons.${index}.relationship`} name={`educationalPersons.${index}.relationship`} placeholder="e.g., Counsellor, Instructor..." component={ValidNameInput} />
                      </div>
                      <div className="col-span-4">
                        <label className={labelCls}>Phone Number:</label>
                        <Field name={`educationalPersons.${index}.phoneNumber`} component={PhoneNumberInput} placeholder="(123) 456-7890" />
                      </div>
                      <div className="col-span-4">
                        <Field name={`educationalPersons.${index}.email`} label="Email:" component={EmailInput} placeholder="e.g., name@example.com" />
                      </div>
                    </div>
                  </div>
                ))}
                {isEditing && (
                <button
                  type="button"
                  onClick={() => push({ firstName: "", middleName: "", lastName: "", relationship: "", phoneNumber: "", email: "" })}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors border"
                  style={{ backgroundColor: "rgba(97, 0, 215, 0.08)", borderColor: "rgba(97, 0, 215, 0.24)", color: "rgba(97, 0, 215, 0.8)", transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.8)"; e.currentTarget.style.color = "#ffffff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.08)"; e.currentTarget.style.color = "rgba(97, 0, 215, 0.8)"; }}
                >
                  + Add Educational Support Person
                </button>
                )}
              </div>
            )}
          </FieldArray>
        </div>

      </div>
    </div>
  );
};

export default YouthIntakeEducation;
