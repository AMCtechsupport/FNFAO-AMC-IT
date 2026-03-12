"use client";
import { Field, ErrorMessage, FieldArray } from "formik";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import RelationshipToChildrenSelect from "@/components/RelationshipToChildrenSelect";
import StatusCFSFileSelect from "@/components/StatusCFSFileSelect";
import FirstNationSelect from "@/components/FirstNationSelect";
import GenderSelect from "@/components/GenderSelect";
import ManageCfsAgencies from "@/components/ManageCfsAgencies";

const today = new Date().toISOString().split("T")[0]; //get the current date

const ChildrenPartition = ({
    childrenData,
    values,
    isEditing,
    errors
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#6100D7" }}>
                Children
            </div>
            <div className="p-5">

                {values.children.length === 0 ? (
                    <p>No children found for this client.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-12 gap-4 mb-4">
                            <div className="col-span-4">
                                <RelationshipToChildrenSelect name="relationshipToChildren" label="What is your relationship to the child(ren)?" error={errors.relationshipToChildren} disabled={!isEditing} />
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-5">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Are there any other adults involved in your matter?</label>
                                    <div className="flex gap-4 mt-1">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field type="radio" name="otherAdultsInvolved" value="yes" checked={values.otherAdultsInvolved === "yes"} disabled={!isEditing} className="accent-purple-600" /> Yes
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field type="radio" name="otherAdultsInvolved" value="no" checked={values.otherAdultsInvolved === "no"} disabled={!isEditing} className="accent-purple-600" /> No
                                        </label>
                                    </div>
                                    <ErrorMessage name="otherAdultsInvolved" component="div" className="text-xs text-red-500 mt-1" />
                                </div>
                                {values.otherAdultsInvolved === "yes" && (
                                    <div className="col-span-12">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Please specify:</label>
                                        <Field as="textarea" name="otherAdultsInvolvedExplained" placeholder="e.g., grandparent, step-parent..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white resize-none" disabled={!isEditing} />
                                        <ErrorMessage name="otherAdultsInvolvedExplained" component="div" className="text-xs text-red-500 mt-1" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* list of children */}
                <h5 className="text-sm font-semibold text-gray-700 mb-1">List of Children</h5>
                <label className="block text-xs font-medium text-gray-600 mb-3">(List all children, including those at home or in care):</label>

                <FieldArray name="children">
                    {({ push, remove }) => (
                        <div>
                            {values.children
                                .map((child, originalIndex) => ({ child, originalIndex }))
                                .sort((a, b) => (a.child.child_id ?? Infinity) - (b.child.child_id ?? Infinity))
                                .map(({ child, originalIndex }, displayIndex) => (
                                    <div key={`${child.child_id ?? 'new'}-${originalIndex}`} className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">

                                        <h5 className="text-sm font-semibold text-gray-700 mb-3">{displayIndex + 1}.</h5>

                                        {/* Name fields */}
                                        <div className="grid grid-cols-12 gap-4 mb-3">
                                            <div className="col-span-3">
                                                <InputField name={`children.${originalIndex}.firstName`} label="First Name:" placeholder="Enter First Name" disabled={!isEditing} />
                                            </div>
                                            <div className="col-span-3">
                                                <InputField name={`children.${originalIndex}.middleName`} label="Middle Name:" placeholder="Enter Middle Name" disabled={!isEditing} />
                                            </div>
                                            <div className="col-span-6">
                                                <InputField name={`children.${originalIndex}.lastName`} label="Last Name:" placeholder="Enter Last Name" disabled={!isEditing} />
                                            </div>
                                        </div>

                                        {/* DOB, FirstNation, Gender */}
                                        <div className="grid grid-cols-12 gap-4 mb-3">
                                            <div className="col-span-3">
                                                <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor={`children.${originalIndex}.birthDate`}>Date of Birth:</label>
                                                <Field
                                                    type="date"
                                                    id={`children.${originalIndex}.birthDate`}
                                                    name={`children.${originalIndex}.birthDate`}
                                                    disabled={!isEditing}
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white"
                                                    max={today}
                                                />
                                                <ErrorMessage
                                                    name={`children.${originalIndex}.birthDate`}
                                                    component={() => <p className="text-xs text-red-500 mt-1">{errors.children?.[originalIndex]?.birthDate}</p>}
                                                />
                                            </div>
                                            <div className="col-span-6">
                                                <Field
                                                    name={`children.${originalIndex}.childNation`}
                                                    component={FirstNationSelect}
                                                    label="First Nation Membership"
                                                    error={errors.childNation}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <GenderSelect name={`children.${originalIndex}.gender`} label="Gender:" error={errors.gender} disabled={!isEditing} />
                                            </div>
                                        </div>

                                        {/* Place of Stay */}
                                        <div className="grid grid-cols-12 gap-4 mb-3">
                                            <div className="col-span-6">
                                                <InputField name={`children.${originalIndex}.childPlaced`} label="Place of Stay:" placeholder="e.g., Foster Home" disabled={!isEditing} />
                                            </div>
                                        </div>

                                        {/* Agency information */}
                                        <div className="border-t border-gray-200 pt-4 mt-4">
                                            <h5 className="text-sm font-semibold text-gray-700 mb-3">Agency Information</h5>
                                            <div className="grid grid-cols-12 gap-4 mb-3">
                                                <div className="col-span-4">
                                                    <Field
                                                        name={`children.${originalIndex}.childCfsAgency`}
                                                        component={ManageCfsAgencies}
                                                        label="CFS Agency Name:"
                                                        error={<ErrorMessage name={`children.${originalIndex}.childCfsAgency`} component="div" className="text-red-500" />}
                                                        disabled={!isEditing}
                                                        value={child.childCfsAgency}
                                                        onChange={(e) => setFieldValue(`children.${originalIndex}.childCfsAgency`, e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-span-6">
                                                    <Field
                                                        name={`children.${originalIndex}.childStatusCfsFile`}
                                                        component={StatusCFSFileSelect}
                                                        label="CFS File Status"
                                                        error={errors.children?.[originalIndex]?.childStatusCfsFile}
                                                        disabled={!isEditing}
                                                        value={child.childStatusCfsFile}
                                                        onChange={(e) => setFieldValue(`children.${originalIndex}.childStatusCfsFile`, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-12 gap-4 mb-3">
                                                <div className="col-span-4">
                                                    <InputField name={`children.${originalIndex}.childCfsAgentFullName`} label="Worker's Full Name:" placeholder="Enter Full Name" disabled={!isEditing} />
                                                </div>
                                                <div className="col-span-4">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor={`children.${originalIndex}.childCfsAgentNumber`}>Worker's Phone Number:</label>
                                                    <Field type="number" id={`children.${originalIndex}.childCfsAgentNumber`} name={`children.${originalIndex}.childCfsAgentNumber`} component={PhoneNumberInput} placeholder="(123) 456-7890" disabled={!isEditing} />
                                                    <ErrorMessage
                                                        name={`children.${originalIndex}.childCfsAgentNumber`}
                                                        component={() => <p className="text-xs text-red-500 mt-1">{errors.children?.[originalIndex]?.childCfsAgentNumber}</p>} />
                                                </div>
                                                <div className="col-span-4">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor={`children.${originalIndex}.childCfsAgentEmail`}>Worker's Email:</label>
                                                    <Field
                                                        type="email"
                                                        id={`children.${originalIndex}.childCfsAgentEmail`}
                                                        name={`children.${originalIndex}.childCfsAgentEmail`}
                                                        placeholder="e.g., name@example.com"
                                                        disabled={!isEditing}
                                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white"
                                                    />
                                                    <ErrorMessage
                                                        name={`children.${originalIndex}.childCfsAgentEmail`}
                                                        component={() => <p className="text-xs text-red-500 mt-1">{errors.children?.[originalIndex]?.childCfsAgentEmail}</p>} />
                                                </div>
                                            </div>

                                            {/* CFS Supervisor information */}
                                            <div className="grid grid-cols-12 gap-4">
                                                <div className="col-span-4">
                                                    <InputField name={`children.${originalIndex}.childCfsSupervisorFullName`} label="Supervisor Full Name:" placeholder="Enter Full Name" disabled={!isEditing} />
                                                </div>
                                                <div className="col-span-4">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor={`children.${originalIndex}.childCfsSupervisorNumber`}>Supervisor Phone Number:</label>
                                                    <Field type="number" id={`children.${originalIndex}.childCfsSupervisorNumber`} name={`children.${originalIndex}.childCfsSupervisorNumber`} component={PhoneNumberInput} placeholder="(123) 456-7890" disabled={!isEditing} />
                                                    <ErrorMessage
                                                        name={`children.${originalIndex}.childCfsSupervisorNumber`}
                                                        component={() => <p className="text-xs text-red-500 mt-1">{errors.children?.[originalIndex]?.childCfsSupervisorNumber}</p>} />
                                                </div>
                                                <div className="col-span-4">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor={`children.${originalIndex}.childCfsSupervisorEmail`}>Supervisor Email:</label>
                                                    <Field
                                                        type="email"
                                                        id={`children.${originalIndex}.childCfsSupervisorEmail`}
                                                        name={`children.${originalIndex}.childCfsSupervisorEmail`}
                                                        placeholder="e.g., name@example.com"
                                                        disabled={!isEditing}
                                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white"
                                                    />
                                                    <ErrorMessage
                                                        name={`children.${originalIndex}.childCfsSupervisorEmail`}
                                                        component={() => <p className="text-xs text-red-500 mt-1">{errors.children?.[originalIndex]?.childCfsSupervisorEmail}</p>} />
                                                </div>
                                            </div>
                                        </div>
                                        {/* END Agency information */}

                                        {/* Child medical condition */}
                                        <div className="border-t border-gray-200 pt-4 mt-4">
                                            <h5 className="text-sm font-semibold text-gray-700 mb-3">Child's Medical Information</h5>
                                            <div className="grid grid-cols-12 gap-4">
                                                <div className="col-span-5">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Does your child have any medical needs?</label>
                                                    <div className="flex gap-4 mt-1">
                                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                            <Field type="radio" name={`children.${originalIndex}.childMedicalNeeds`} value="yes" checked={child.childMedicalNeeds === "yes"} disabled={!isEditing} className="accent-purple-600" /> Yes
                                                        </label>
                                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                            <Field type="radio" name={`children.${originalIndex}.childMedicalNeeds`} value="no" checked={child.childMedicalNeeds === "no"} disabled={!isEditing} className="accent-purple-600" /> No
                                                        </label>
                                                    </div>
                                                    <ErrorMessage name={`children.${originalIndex}.childMedicalNeeds`} component="div" className="text-xs text-red-500 mt-1" />
                                                </div>
                                                {child.childMedicalNeeds === "yes" && (
                                                    <div className="col-span-12">
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Please specify:</label>
                                                        <Field as="textarea" name={`children.${originalIndex}.childMedicalNeedsExplained`} placeholder="e.g., diabetes, asthma..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white resize-none" disabled={!isEditing} />
                                                        <ErrorMessage name={`children.${originalIndex}.childMedicalNeedsExplained`} component="div" className="text-xs text-red-500 mt-1" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* END Child medical condition */}

                                        {/* Another Biological Parent*/}
                                        <div className="border-t border-gray-200 pt-4 mt-4">
                                            <h5 className="text-sm font-semibold text-gray-700 mb-3">Other Biological Parent Information</h5>
                                            <div className="grid grid-cols-12 gap-4">
                                                <div className="col-span-3">
                                                    <InputField name={`children.${originalIndex}.biologicalParentFirstName`} label="First Name:" placeholder="Enter First Name" disabled={!isEditing} />
                                                </div>
                                                <div className="col-span-3">
                                                    <InputField name={`children.${originalIndex}.biologicalParentLastName`} label="Last Name:" placeholder="Enter Last Name" disabled={!isEditing} />
                                                </div>
                                                <div className="col-span-6">
                                                    <Field
                                                        name={`children.${originalIndex}.biologicalParentFirstNation`}
                                                        component={FirstNationSelect}
                                                        label="First Nation Membership"
                                                        error={errors.biologicalParentFirstNation}
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {/* END Another Biological Parent*/}

                                        {/* Delete button */}
                                        <div className="flex justify-end mt-4">
                                            <button
                                                type="button"
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors"
                                                onClick={() => remove(originalIndex)}
                                                disabled={!isEditing}
                                            >
                                                Delete
                                            </button>
                                        </div>

                                    </div>
                                ))}
                            <button
                                type="button"
                                className="px-4 py-2 text-xs font-semibold rounded-lg text-white transition-colors"
                                style={{ backgroundColor: "#6100D7" }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#3a2649"}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#6100D7"}
                                onClick={() =>
                                    push({
                                        firstName: "",
                                        middleName: "",
                                        lastName: "",
                                        birthDate: "",
                                        childNation: "",
                                        gender: "",
                                        childPlaced: "",
                                        childCfsAgency: "",
                                        childCfsAgentFullName: "",
                                        childCfsAgentNumber: "",
                                        childCfsAgentEmail: "",
                                        childStatusCfsFile: "",
                                        childCfsSupervisorFullName: "",
                                        childCfsSupervisorNumber: "",
                                        childCfsSupervisorEmail: "",
                                        childMedicalNeeds: "",
                                        childMedicalNeedsExplained: "",
                                        biologicalParentFirstName: "",
                                        biologicalParentLastName: "",
                                        biologicalParentFirstNation: "",
                                    })}
                                disabled={!isEditing}
                            >
                                + Add Child
                            </button>
                        </div>
                    )}
                </FieldArray>
            </div>
        </div>
    );
};

export default ChildrenPartition;
