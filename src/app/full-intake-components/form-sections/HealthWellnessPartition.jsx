"use client";
import { Field, ErrorMessage } from "formik";

const HealthWellnessPartition = ({ values, isEditing, setFieldValue }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#47315E" }}>
                Health &amp; Wellness
            </div>
            <div className="p-5">

                {/* Diagnoses checkboxes */}
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                    <label className="block text-xs font-medium text-gray-600 mb-3">
                        Have you ever been diagnosed with any of the following? (Please check all that apply)
                    </label>
                    <div className="flex flex-wrap gap-4">
                        {[
                            { name: "FASD", label: "FASD" },
                            { name: "ADHD", label: "ADHD" },
                            { name: "PTSD", label: "PTSD" },
                            { name: "depression", label: "Depression" },
                            { name: "cancerAutoimmuneCondition", label: "Cancer Autoimmune Condition" },
                            { name: "otherMentalCondition", label: "Other Mental Health Condition" }
                        ].map(({ name, label }) => (
                            <label key={name} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <Field
                                    type="checkbox"
                                    name={name}
                                    checked={Boolean(values[name])}
                                    onChange={(e) => setFieldValue(name, Boolean(e.target.checked))}
                                    disabled={!isEditing}
                                    className="accent-purple-600"
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Other Mental Health Condition explanation */}
                {values.otherMentalCondition && (
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Explain Other Mental Health Condition:</label>
                        <Field
                            as="textarea"
                            name="otherMentalConditionExplained"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white resize-none"
                            disabled={!isEditing}
                        />
                        <ErrorMessage name="otherMentalConditionExplained" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                )}

                {/* Supports received */}
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                    <label htmlFor="diagnosedFollowingExplain" className="block text-xs font-medium text-gray-600 mb-1">
                        If you have checked any of the above, please describe the supports you have received to address their effects.
                    </label>
                    <Field
                        as="textarea"
                        name="diagnosedFollowingExplain"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white resize-none"
                        disabled={!isEditing}
                    />
                    <ErrorMessage name="diagnosedFollowingExplain" component="div" className="text-xs text-red-500 mt-1" />
                </div>

                {/* Negative coping skills */}
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Do you feel that you may struggle with using negative coping skills from to time?
                            </label>
                            <div className="flex gap-4 mt-1">
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <Field type="radio" name="negativeCopingSkills" value="yes" disabled={!isEditing} className="accent-purple-600" /> Yes
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <Field type="radio" name="negativeCopingSkills" value="no" disabled={!isEditing} className="accent-purple-600" /> No
                                </label>
                            </div>
                            <ErrorMessage name="negativeCopingSkills" component="div" className="text-xs text-red-500 mt-1" />
                        </div>
                        {values.negativeCopingSkills === "yes" && (
                            <div className="col-span-8">
                                <label className="block text-xs font-medium text-gray-600 mb-1">If yes, please explain:</label>
                                <Field
                                    as="textarea"
                                    name="negativeCopingSkillsExplain"
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white resize-none"
                                    disabled={!isEditing}
                                />
                                <ErrorMessage name="negativeCopingSkillsExplain" component="div" className="text-xs text-red-500 mt-1" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Drugs/Alcohol impact */}
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">How has Drugs and/or Alcohol impacted your life?</label>
                    <Field
                        as="textarea"
                        name="drugsImpact"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white resize-none"
                        disabled={!isEditing}
                    />
                    <ErrorMessage name="drugsImpact" component="div" className="text-xs text-red-500 mt-1" />
                </div>

                {/* Last time used */}
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">When was the last time you used Drugs and/or Alcohol?</label>
                    <Field
                        as="textarea"
                        name="lastTimeUsed"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white resize-none"
                        disabled={!isEditing}
                    />
                    <ErrorMessage name="lastTimeUsed" component="div" className="text-xs text-red-500 mt-1" />
                </div>

                {/* Educational goals */}
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Do you have any educational goals we can support you to achieve?
                            </label>
                            <div className="flex gap-4 mt-1">
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <Field type="radio" name="educationalGoals" value="yes" disabled={!isEditing} className="accent-purple-600" /> Yes
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <Field type="radio" name="educationalGoals" value="no" disabled={!isEditing} className="accent-purple-600" /> No
                                </label>
                            </div>
                            <ErrorMessage name="educationalGoals" component="div" className="text-xs text-red-500 mt-1" />
                        </div>
                        {values.educationalGoals === "yes" && (
                            <div className="col-span-8">
                                <label className="block text-xs font-medium text-gray-600 mb-1">If yes, please explain:</label>
                                <Field
                                    as="textarea"
                                    name="educationalGoalsExplained"
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white resize-none"
                                    disabled={!isEditing}
                                />
                                <ErrorMessage name="educationalGoalsExplained" component="div" className="text-xs text-red-500 mt-1" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Access Elder */}
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Do you have access to an Elder or counsellor?
                            </label>
                            <div className="flex gap-4 mt-1">
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <Field type="radio" name="accessElder" value="yes" disabled={!isEditing} className="accent-purple-600" /> Yes
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <Field type="radio" name="accessElder" value="no" disabled={!isEditing} className="accent-purple-600" /> No
                                </label>
                            </div>
                            <ErrorMessage name="accessElder" component="div" className="text-xs text-red-500 mt-1" />
                        </div>
                        {values.accessElder === "yes" && (
                            <div className="col-span-8">
                                <label className="block text-xs font-medium text-gray-600 mb-1">If yes, please describe:</label>
                                <Field
                                    as="textarea"
                                    name="accessElderExplained"
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white resize-none"
                                    disabled={!isEditing}
                                />
                                <ErrorMessage name="accessElderExplained" component="div" className="text-xs text-red-500 mt-1" />
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HealthWellnessPartition;
