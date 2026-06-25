"use client";
import { Field, ErrorMessage, FieldArray } from "formik";

import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";

const ChildFamilyServicesPartition = ({
    childrenData,
    isEditing,
    values,
    hideCfsAgencies = false,
}) => {
    return (
        <>
            {/* Card 1: CFS Agencies */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
                    CFS Agencies
                </div>
                <div className="p-5">
                    {hideCfsAgencies ? (
                        <p className="text-sm text-gray-500 italic">CFS agency details will be available after the client is created.</p>
                    ) : (<>

                        {/* CFS Agencies table */}
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">CFS Agencies</h5>
                        {childrenData.length === 0 ? (
                            <p>No CFS agencies found for this client.</p>
                        ) : (
                            (() => {
                                // Group children by agency
                                const agenciesMap = new Map();

                                childrenData.forEach(child => {
                                    if (!agenciesMap.has(child.childCfsAgency)) {
                                        agenciesMap.set(child.childCfsAgency, []);
                                    }
                                    agenciesMap.get(child.childCfsAgency).push(child);
                                });

                                // Convert Map to an array for rendering
                                const agenciesArray = Array.from(agenciesMap.entries());

                                return (
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="text-white text-xs uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
                                                <th className="px-4 py-2 text-left">CFS Agency</th>
                                                <th className="px-4 py-2 text-left">Child Name</th>
                                                <th className="px-4 py-2 text-left">CFS Agent</th>
                                                <th className="px-4 py-2 text-left">Status</th>
                                            </tr>
                                        </thead>

                                        {/* Table body with grouped data */}
                                        <tbody>
                                            {agenciesArray.map(([agency, children]) =>
                                                children.map((child, index) => (
                                                    <tr key={child.child_id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        {/* Show agency name only on the first row of the group */}
                                                        {index === 0 && (
                                                            <td rowSpan={children.length} className="px-4 py-3 text-gray-700">{agency || "N/A"}</td>
                                                        )}
                                                        <td className="px-4 py-3 text-gray-700">{child.firstName} {child.lastName}</td>
                                                        <td className="px-4 py-3 text-gray-700">{child.childCfsAgentFullName || "N/A"}</td>
                                                        <td className="px-4 py-3 text-gray-700">{child.childStatusCfsFile || "N/A"}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                );
                            })()
                        )}

                        <hr className="my-4 border-gray-200" />

                        {/* Agency Worker's table */}
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">Agency Worker</h5>
                        {childrenData.length > 0 && (() => {
                            // Extract unique agents from childrenData
                            const uniqueAgents = Array.from(
                                new Map(
                                    childrenData
                                        .filter(child => child.childCfsAgentFullName)
                                        .map(child => [child.childCfsAgentFullName, {
                                            fullName: child.childCfsAgentFullName,
                                            phone: child.childCfsAgentNumber || "N/A",
                                            email: child.childCfsAgentEmail || "N/A",
                                            supervisorName: child.childCfsSupervisorFullName || "N/A"
                                        }])
                                ).values()
                            );

                            return uniqueAgents.length > 0 ? (
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="text-white text-xs uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
                                            <th className="px-4 py-2 text-left">Full Name</th>
                                            <th className="px-4 py-2 text-left">Phone</th>
                                            <th className="px-4 py-2 text-left">Email</th>
                                        </tr>
                                    </thead>

                                    {/* Body of the table with the data of the unique agents*/}
                                    <tbody>
                                        {uniqueAgents.map((agent, index) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-700">{agent.fullName}</td>
                                                <td className="px-4 py-3 text-gray-700">{agent.phone}</td>
                                                <td className="px-4 py-3 text-gray-700">{agent.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : null;
                        })()}

                        <hr className="my-4 border-gray-200" />

                        {/* Supervisor's table */}
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">Supervisor</h5>
                        {childrenData.length > 0 && (() => {
                            // Extract unique supervisors from childrenData
                            const uniqueSupervisors = Array.from(
                                new Map(
                                    childrenData
                                        .filter(child => child.childCfsSupervisorFullName)
                                        .map(child => [child.childCfsSupervisorFullName, {
                                            supervisorName: child.childCfsSupervisorFullName,
                                            supervisorPhone: child.childCfsSupervisorNumber || "N/A",
                                            supervisorEmail: child.childCfsSupervisorEmail || "N/A"
                                        }])
                                ).values()
                            );

                            return uniqueSupervisors.length > 0 ? (
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="text-white text-xs uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
                                            <th className="px-4 py-2 text-left">Supervisor Name</th>
                                            <th className="px-4 py-2 text-left">Phone</th>
                                            <th className="px-4 py-2 text-left">Email</th>
                                        </tr>
                                    </thead>

                                    {/* Body of the table with the data of the unique supervisors*/}
                                    <tbody>
                                        {uniqueSupervisors.map((supervisor, index) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-700">{supervisor.supervisorName}</td>
                                                <td className="px-4 py-3 text-gray-700">{supervisor.supervisorPhone}</td>
                                                <td className="px-4 py-3 text-gray-700">{supervisor.supervisorEmail}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : null;
                        })()}

                    </>)}
                </div>
            </div>

            {/* Card 2: Child & Family Services */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
                    Child &amp; Family Services
                </div>
                <div className="p-5">

                    {/* How long in care */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">How long have your children been in CFS care?</label>
                        <Field
                            as="textarea"
                            name="childrenInCareDuration"
                            placeholder="e.g., 6 months, 2 years..."
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none"
                            disabled={!isEditing}
                        />
                        <ErrorMessage
                            name="childrenInCareDuration"
                            component="div"
                            className="text-xs text-red-500 mt-1"
                        />
                    </div>

                    {/* Apprehension reason */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">What was the reason given by CFS for apprehending your children?</label>
                        <Field
                            as="textarea"
                            name="cfsChildrenApprehesionReason"
                            placeholder="e.g., neglect, domestic violence..."
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none"
                            disabled={!isEditing}
                        />
                        <ErrorMessage
                            name="cfsChildrenApprehesionReason"
                            component="div"
                            className="text-xs text-red-500 mt-1"
                        />
                    </div>

                    {/* Kinship care radio */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Are any of your children placed with family (Kinship Care)?</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <Field type="radio" name="kinship" value="yes" checked={values.kinship === "yes"} disabled={!isEditing} className="accent-purple-600/80" /> Yes
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <Field type="radio" name="kinship" value="no" checked={values.kinship === "no"} disabled={!isEditing} className="accent-purple-600/80" /> No
                                    </label>
                                </div>
                                <ErrorMessage name="kinship" component="div" className="text-xs text-red-500 mt-1" />
                            </div>
                            {values.kinship === "yes" && (
                                <div className="col-span-8">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">If yes, explain:</label>
                                    <Field as="textarea" name="kinshipExplained" placeholder="e.g., aunt caring for two children..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none" disabled={!isEditing} />
                                    <ErrorMessage name="kinshipExplained" component="div" className="text-xs text-red-500 mt-1" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Family members or friends for Kinship Care */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">Family Members or Friends for Kinship Care</h5>
                        <div className="grid grid-cols-12 gap-4 mb-3">
                            <div className="col-span-8">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Do you have any family members or friends that you can turn to for Kinship Care?</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <Field type="radio" name="turnToKinshipCare" value="yes" checked={values.turnToKinshipCare === "yes"} disabled={!isEditing} className="accent-purple-600/80" /> Yes
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <Field type="radio" name="turnToKinshipCare" value="no" checked={values.turnToKinshipCare === "no"} disabled={!isEditing} className="accent-purple-600/80" /> No
                                    </label>
                                </div>
                                <ErrorMessage name="turnToKinshipCare" component="div" className="text-xs text-red-500 mt-1" />
                            </div>
                        </div>
                        {values.turnToKinshipCare === "yes" && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                                <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
                                    Family Members
                                </div>
                                <div className="p-5">
                                    <FieldArray name="family">
                                        {({ push, remove }) => (
                                            <div>
                                                {values.family.map((member, index) => (
                                                    <div key={`${member.family_and_friends_id}-${index}`} className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                                                        <div className="grid grid-cols-12 gap-4">
                                                            <div className="col-span-4">
                                                                <InputField
                                                                    name={`family.${index}.firstName`}
                                                                    label="First Name:"
                                                                    placeholder="Enter First Name"
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                            <div className="col-span-4">
                                                                <InputField
                                                                    name={`family.${index}.lastName`}
                                                                    label="Last Name:"
                                                                    placeholder="Enter Last Name"
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                            <div className="col-span-4">
                                                                <InputField
                                                                    name={`family.${index}.relationshipToClient`}
                                                                    label="Relationship:"
                                                                    placeholder="e.g., aunt, uncle..."
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-12 gap-4 mt-3">
                                                            <div className="col-span-4">
                                                                <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor={`family.${index}.phoneNumber`}>
                                                                    Phone Number:
                                                                </label>
                                                                <Field
                                                                    type="number"
                                                                    id={`family.${index}.phoneNumber`}
                                                                    name={`family.${index}.phoneNumber`}
                                                                    component={PhoneNumberInput}
                                                                    placeholder="(123) 456-7890"
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end mt-3">
                                                            <button
                                                                type="button"
                                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors"
                                                                onClick={() => remove(index)}
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
                                                    style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(58, 38, 73, 0.8)"}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.8)"}
                                                    disabled={!isEditing}
                                                    onClick={() =>
                                                        push({
                                                            firstName: "",
                                                            lastName: "",
                                                            relationshipToClient: "",
                                                            phoneNumber: "",
                                                        })
                                                    }
                                                >
                                                    + Add Member
                                                </button>
                                            </div>
                                        )}
                                    </FieldArray>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* END Family or friends for Kinship Care */}

                    {/* Concerns */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Are there any concerns you have about the level of care your child(ren) are currently receiving?</label>
                        <Field
                            as="textarea"
                            name="anyConcerns"
                            placeholder="e.g., I am concerned about the visits being too infrequent..."
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none"
                            disabled={!isEditing}
                        />
                        <ErrorMessage
                            name="anyConcerns"
                            component="div"
                            className="text-xs text-red-500 mt-1"
                        />
                    </div>

                    {/* Case plan copy */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Do you have a copy of your case plan(s)?</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <Field type="radio" name="casePlanCopy" value="yes" disabled={!isEditing} className="accent-purple-600/80" /> Yes
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <Field type="radio" name="casePlanCopy" value="no" disabled={!isEditing} className="accent-purple-600/80" /> No
                                    </label>
                                </div>
                                <ErrorMessage
                                    name="casePlanCopy"
                                    component="div"
                                    className="text-xs text-red-500 mt-1"
                                />
                            </div>
                            {values.casePlanCopy === "no" && (
                                <div className="col-span-8">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        If no, describe the last requests the agency asked you to complete to get your children home:
                                    </label>
                                    <Field
                                        as="textarea"
                                        name="casePlanCopyDescribe"
                                        placeholder="e.g., attend counselling, parenting classes..."
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none"
                                        disabled={!isEditing}
                                    />
                                    <ErrorMessage
                                        name="casePlanCopyDescribe"
                                        component="div"
                                        className="text-xs text-red-500 mt-1"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preventative support */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Did you receive any preventative supports to assist you with your children prior to their apprehension?</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <Field type="radio" name="preventativeSupport" value="yes" checked={values.preventativeSupport === "yes"} disabled={!isEditing} className="accent-purple-600/80" /> Yes
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <Field type="radio" name="preventativeSupport" value="no" checked={values.preventativeSupport === "no"} disabled={!isEditing} className="accent-purple-600/80" /> No
                                    </label>
                                </div>
                                <ErrorMessage name="preventativeSupport" component="div" className="text-xs text-red-500 mt-1" />
                            </div>
                            {values.preventativeSupport === "yes" && (
                                <div className="col-span-8">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">If yes, explain:</label>
                                    <Field as="textarea" name="preventativeSupportExplained" placeholder="e.g., family support worker, parenting programs..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none" disabled={!isEditing} />
                                    <ErrorMessage name="preventativeSupportExplained" component="div" className="text-xs text-red-500 mt-1" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Private agreement */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Do you currently have a Private Agreement or Safety Plan for any of your children?</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <Field type="radio" name="privateAgreement" value="yes" checked={values.privateAgreement === "yes"} disabled={!isEditing} className="accent-purple-600/80" /> Yes
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <Field type="radio" name="privateAgreement" value="no" checked={values.privateAgreement === "no"} disabled={!isEditing} className="accent-purple-600/80" /> No
                                    </label>
                                </div>
                                <ErrorMessage name="privateAgreement" component="div" className="text-xs text-red-500 mt-1" />
                            </div>
                            {values.privateAgreement === "yes" && (
                                <div className="col-span-8">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">If yes, explain:</label>
                                    <Field as="textarea" name="privateAgreementExplained" placeholder="e.g., safety plan with relative since Jan 2024..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none" disabled={!isEditing} />
                                    <ErrorMessage name="privateAgreementExplained" component="div" className="text-xs text-red-500 mt-1" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CFS explain */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Did CFS accurately explain the process that was to be followed to get your children home?</label>
                        <div className="flex gap-4 mt-1">
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <Field type="radio" name="cfsExplain" value="yes" checked={values.cfsExplain === "yes"} disabled={!isEditing} className="accent-purple-600/80" /> Yes
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <Field type="radio" name="cfsExplain" value="no" checked={values.cfsExplain === "no"} disabled={!isEditing} className="accent-purple-600/80" /> No
                            </label>
                        </div>
                        <ErrorMessage name="cfsExplain" component="div" className="text-xs text-red-500 mt-1" />
                    </div>

                    {/* Previous involvement */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Have you had previous involvement with CFS?</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <Field type="radio" name="previousInvolvement" value="yes" checked={values.previousInvolvement === "yes"} disabled={!isEditing} className="accent-purple-600/80" /> Yes
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <Field type="radio" name="previousInvolvement" value="no" checked={values.previousInvolvement === "no"} disabled={!isEditing} className="accent-purple-600/80" /> No
                                    </label>
                                </div>
                                <ErrorMessage name="previousInvolvement" component="div" className="text-xs text-red-500 mt-1" />
                            </div>
                            {values.previousInvolvement === "yes" && (
                                <div className="col-span-8">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">If yes, explain:</label>
                                    <Field as="textarea" name="previousInvolvementExplain" placeholder="e.g., involved in 2015 for neglect concerns..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none" disabled={!isEditing} />
                                    <ErrorMessage name="previousInvolvementExplain" component="div" className="text-xs text-red-500 mt-1" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Visitation schedule */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">What is your current visitation schedule with your children?</label>
                        <Field as="textarea" name="visitsChildFrequency" placeholder="e.g., twice a week, every weekend..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none" disabled={!isEditing} />
                        <ErrorMessage name="visitsChildFrequency" component="div" className="text-xs text-red-500 mt-1" />
                    </div>

                    {/* Parental capacity */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Have you had a Parental Capacity Assessment (PCA) done?</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <Field type="radio" name="parentalCapacityDone" value="yes" checked={values.parentalCapacityDone === "yes"} disabled={!isEditing} className="accent-purple-600/80" /> Yes
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <Field type="radio" name="parentalCapacityDone" value="no" checked={values.parentalCapacityDone === "no"} disabled={!isEditing} className="accent-purple-600/80" /> No
                                    </label>
                                </div>
                                <ErrorMessage name="parentalCapacityDone" component="div" className="text-xs text-red-500 mt-1" />
                            </div>
                            {values.parentalCapacityDone === "yes" && (
                                <div className="col-span-8">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">If yes, explain:</label>
                                    <Field as="textarea" name="parentalCapacity" placeholder="e.g., assessed in 2020 by Dr. Smith..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none" disabled={!isEditing} />
                                    <ErrorMessage name="parentalCapacity" component="div" className="text-xs text-red-500 mt-1" />
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default ChildFamilyServicesPartition;
