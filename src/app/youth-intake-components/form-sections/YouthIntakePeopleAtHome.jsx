"use client";
import { Field, FieldArray } from "formik";
import ValidNameInput from "@/components/ValidNameInput";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import EmailInput from "@/components/ValidEmailInput";

const labelCls = "block text-xs font-medium text-gray-600 mb-1";

const YouthIntakePeopleAtHome = ({ values, errors, isEditing }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
        People at Home
      </div>
      <div className="p-5">
        <FieldArray name="homeMembers">
          {({ push, remove }) => (
            <div className="space-y-4">
              {values.homeMembers.map((homeMember, index) => (
                <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
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
                      <label className={labelCls} htmlFor={`homeMembers.${index}.firstName`}>First Name:</label>
                      <Field id={`homeMembers.${index}.firstName`} name={`homeMembers.${index}.firstName`} placeholder="Person's First Name" component={ValidNameInput} />
                    </div>
                    <div className="col-span-3">
                      <label className={labelCls} htmlFor={`homeMembers.${index}.middleName`}>Middle Name:</label>
                      <Field id={`homeMembers.${index}.middleName`} name={`homeMembers.${index}.middleName`} placeholder="Person's Middle Name" component={ValidNameInput} />
                    </div>
                    <div className="col-span-4">
                      <label className={labelCls} htmlFor={`homeMembers.${index}.lastName`}>Last Name:</label>
                      <Field id={`homeMembers.${index}.lastName`} name={`homeMembers.${index}.lastName`} placeholder="Person's Last Name" component={ValidNameInput} />
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                      <label className={labelCls} htmlFor={`homeMembers.${index}.relationship`}>Relationship:</label>
                      <Field id={`homeMembers.${index}.relationship`} name={`homeMembers.${index}.relationship`} placeholder="e.g., Sibling, Grandparent..." component={ValidNameInput} />
                    </div>
                    <div className="col-span-4">
                      <label className={labelCls}>Phone Number:</label>
                      <Field name={`homeMembers.${index}.phoneNumber`} component={PhoneNumberInput} placeholder="(123) 456-7890" />
                    </div>
                    <div className="col-span-4">
                      <Field name={`homeMembers.${index}.email`} label="Email:" component={EmailInput} placeholder="e.g., name@example.com" />
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
                + Add Home Member
              </button>
              )}
            </div>
          )}
        </FieldArray>
      </div>
    </div>
  );
};

export default YouthIntakePeopleAtHome;
