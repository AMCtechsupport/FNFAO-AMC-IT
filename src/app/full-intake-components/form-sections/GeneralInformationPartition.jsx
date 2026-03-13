"use client";
import { Field, ErrorMessage, FieldArray } from "formik";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import FirstNationSelect from "@/components/FirstNationSelect";
import MartialStatusSelect from "@/components/MartialStatusSelect";
import YesNoSelect from "@/components/yesNoSelect";

const GeneralInformationPartition = ({
    errors,
    isEditing,
    values,
    validateRadio,
    setFieldValue,
}) => {
    return (
        <>
            {/* Card 1: General Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>General Information</div>
                <div className="p-5">
                    {/* Row 1: FirstNation(col5), TreatyNumber(col3), OtherFirstNation(col4) */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-5">
                            <Field
                                name="firstNationMembership"
                                component={FirstNationSelect}
                                label="First Nation Membership"
                                error={errors.firstNationMembership}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="col-span-3">
                            {/* <InputField
                                name="treatyNumber"
                                label="Treaty Number:"
                                placeholder=""
                                error={errors.treatyNumber}
                                disabled={!isEditing}
                            /> */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">TreatyNumber (10-Digit):</label>
                                <Field
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d*"
                                    maxLength={10}
                                    id="treatyNumber"
                                    placeholder="1234567890"
                                    name="treatyNumber"
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white"
                                    onChange={(e) => {
                                        const digits = String(e.target.value || "").replace(/\D/g, "");
                                        setFieldValue("treatyNumber", digits);
                                    }}
                                    onBlur={(e) => {
                                        const raw = String(e.target.value || "");
                                        const digits = raw.replace(/\D/g, "");
                                        if (digits.length > 0) {
                                            const digitpad = digits.padStart(10, "0");
                                            setFieldValue("treatyNumber", digitpad);
                                        } else {
                                            setFieldValue("treatyNumber", "");
                                        }
                                    }}
                                />
                                <ErrorMessage
                                    name="treatyNumber"
                                    component={() => (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.treatyNumber}
                                        </p>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="col-span-4">
                            <Field
                                name="otherFirstNation"
                                component={FirstNationSelect}
                                label="Other First Nation"
                                error={errors.otherFirstNation}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    {/* Row 2: PersonalHealth9(col5), PersonalHealth6(col3), MartialStatus(col4) */}
                    <div className="grid grid-cols-12 gap-4 mt-4">
                        <div className="col-span-5">
                            {/* <label>Personal Health Identification Numbers (9-Digit):</label> */}
                            {/* <Field
                                type="number"
                                id="ninePersonalHealthNumber"
                                placeholder="000000000"
                                name="ninePersonalHealthNumber"
                                disabled={!isEditing}
                            />
                            <ErrorMessage
                                name="ninePersonalHealthNumber"
                                component={() =>
                                    <p
                                        className="text-xs text-red-500 mt-1">{errors.ninePersonalHealthNumber}
                                    </p>
                                }
                            /> */}

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Personal Health Identification Numbers (9-Digit):</label>
                                <Field
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d*"
                                    maxLength={9}
                                    id="ninePersonalHealthNumber"
                                    placeholder="123456789"
                                    name="ninePersonalHealthNumber"
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white"
                                />
                                <ErrorMessage
                                    name="ninePersonalHealthNumber"
                                    component={() => (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.ninePersonalHealthNumber}
                                        </p>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="col-span-3">
                            {/* <label>(6-Digit):</label>
                            <Field
                                type="number"
                                id="sixPersonalHealthNumber"
                                placeholder="000000"
                                name="sixPersonalHealthNumber"
                                disabled={!isEditing}
                            />
                            <ErrorMessage
                                name="sixPersonalHealthNumber"
                                component={() =>
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.sixPersonalHealthNumber}
                                    </p>
                                }
                            /> */}
                            <label className="block text-xs font-medium text-gray-600 mb-1">(6-Digit):</label>
                            <Field
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={6}
                                id="sixPersonalHealthNumber"
                                placeholder="000000"
                                name="sixPersonalHealthNumber"
                                disabled={!isEditing}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white"
                            />
                            <ErrorMessage
                                name="sixPersonalHealthNumber"
                                component={() => (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.sixPersonalHealthNumber}
                                    </p>
                                )}
                            />
                        </div>
                        <div className="col-span-4">
                            <MartialStatusSelect name="martialStatus" label="Marital Status" error={errors.martialStatus} disabled={!isEditing} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 2: Reserve & Background */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>Reserve & Background</div>
                <div className="p-5">
                    {/* Sub-panel: onReserve(col4) + transitionFromReserve(col4) + previousFNFAOClient(col4) */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Are you living on or off reserve?  </label>
                                    <div className="flex gap-4 mt-1">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field className="accent-purple-600/80" type="radio" name="onReserve" value="yes" checked={values.onReserve === "yes"} disabled={!isEditing} /> Yes
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field className="accent-purple-600/80" type="radio" name="onReserve" value="no" checked={values.onReserve === "no"} disabled={!isEditing} /> No
                                        </label>
                                    </div>
                                    <ErrorMessage name="onReserve" component="div" className="text-xs text-red-500 mt-1" />
                                </div>
                            </div>
                            <div className="col-span-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Have you transitioned from a reserve to the city recently?</label>
                                    <div className="flex gap-4 mt-1">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field className="accent-purple-600/80" type="radio" name="transitionFromReserve" value="yes" checked={values.transitionFromReserve === "yes"} disabled={!isEditing} /> Yes
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field className="accent-purple-600/80" type="radio" name="transitionFromReserve" value="no" checked={values.transitionFromReserve === "no"} disabled={!isEditing} /> No
                                        </label>
                                    </div>
                                    <ErrorMessage name="transitionFromReserve" component="div" className="text-xs text-red-500 mt-1" />
                                </div>
                            </div>
                            <div className="col-span-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Are you a previous client of FNFAO?</label>
                                    <div className="flex gap-4 mt-1">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field className="accent-purple-600/80" type="radio" name="previousFNFAOClient" value="yes" checked={values.previousFNFAOClient === "yes"} disabled={!isEditing} /> Yes
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field className="accent-purple-600/80" type="radio" name="previousFNFAOClient" value="no" checked={values.previousFNFAOClient === "no"} disabled={!isEditing} /> No
                                        </label>
                                    </div>
                                    <ErrorMessage name="previousFNFAOClient" component="div" className="text-xs text-red-500 mt-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sub-panel: prenatalSupport radio(col4) + conditional textarea(col8) */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Need prenatal support?</label>
                                    <div className="flex gap-4 mt-1">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field className="accent-purple-600/80" type="radio" name="prenatalSupport" value="yes" checked={values.prenatalSupport === "yes"} disabled={!isEditing} /> Yes
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field className="accent-purple-600/80" type="radio" name="prenatalSupport" value="no" checked={values.prenatalSupport === "no"} disabled={!isEditing} /> No
                                        </label>
                                    </div>
                                    <ErrorMessage name="prenatalSupport" component="div" className="text-xs text-red-500 mt-1" />
                                </div>
                            </div>
                            {values.prenatalSupport === "yes" && (
                                <div className="col-span-8">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">If yes, specify (e.g. help avoiding birth apprehension, access to prenatal care, breastfeeding information, preparing for baby, etc.):</label>
                                    <Field as="textarea" name="prenatalSupportSpecified" placeholder="e.g., preventing apprehension, breastfeeding, preparing for baby..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none" disabled={!isEditing} />
                                    <ErrorMessage name="prenatalSupportSpecified" component="div" className="text-xs text-red-500 mt-1" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sub-panel: housingSupport radio(col4) + conditional textarea(col8) */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Need housing support?</label>
                                    <div className="flex gap-4 mt-1">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field className="accent-purple-600/80" type="radio" name="housingSupport" value="yes" checked={values.housingSupport === "yes"} disabled={!isEditing} /> Yes
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field className="accent-purple-600/80" type="radio" name="housingSupport" value="no" checked={values.housingSupport === "no"} disabled={!isEditing} /> No
                                        </label>
                                    </div>
                                    <ErrorMessage name="housingSupport" component="div" className="text-xs text-red-500 mt-1" />
                                </div>
                            </div>
                            {values.housingSupport === "yes" && (
                                <div className="col-span-8">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">If yes, specify (e.g. urgent housing, preventing eviction, dealing with the Residential Tenancies Branch, etc):</label>
                                    <Field as="textarea" name="housingSupportSpecified" placeholder="e.g., preventing eviction, urgent housing..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none" disabled={!isEditing} />
                                    <ErrorMessage name="housingSupportSpecified" component="div" className="text-xs text-red-500 mt-1" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sub-panel: addictionsSupport radio(col4) + conditional textarea(col8) */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Need addictions support?</label>
                                    <div className="flex gap-4 mt-1">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field className="accent-purple-600/80" type="radio" name="addictionsSupport" value="yes" checked={values.addictionsSupport === "yes"} disabled={!isEditing} /> Yes
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field className="accent-purple-600/80" type="radio" name="addictionsSupport" value="no" checked={values.addictionsSupport === "no"} disabled={!isEditing} /> No
                                        </label>
                                    </div>
                                    <ErrorMessage name="addictionsSupport" component="div" className="text-xs text-red-500 mt-1" />
                                </div>
                            </div>
                            {values.addictionsSupport === "yes" && (
                                <div className="col-span-8">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">If yes, specify (e.g. access to detox, treatment, relapse prevention programming, etc.):</label>
                                    <Field as="textarea" name="addictionsSupportSpecified" placeholder="e.g., detox, treatment, relapse prevention..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none" disabled={!isEditing} />
                                    <ErrorMessage name="addictionsSupportSpecified" component="div" className="text-xs text-red-500 mt-1" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 3: Important Family Members and Friends */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>Important Family Members and Friends</div>
                <div className="p-5">
                    {/* Home members */}
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Important Family Members and Friends</h5>

                    <FieldArray name="homeMembers">
                        {({ push, remove }) => (
                            <div>
                                {values.homeMembers.map((member, index) => (
                                    <div key={`${member.home_members_id}-${index}`} className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
                                        <div className="grid grid-cols-12 gap-4">
                                            <div className="col-span-4">
                                                <InputField
                                                    name={`homeMembers.${index}.firstName`}
                                                    label="First Name:"
                                                    placeholder="Enter First Name"
                                                    disabled={!isEditing}
                                                />
                                            </div>

                                            <div className="col-span-4">
                                                <InputField
                                                    name={`homeMembers.${index}.lastName`}
                                                    label="Last Name:"
                                                    placeholder="Enter Last Name"
                                                    disabled={!isEditing}
                                                />
                                            </div>

                                            <div className="col-span-4">
                                                <InputField
                                                    name={`homeMembers.${index}.relationship`}
                                                    label="Relationship:"
                                                    placeholder="e.g., sibling, parent..."
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4 mt-4">
                                            <div className="col-span-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1"
                                                        htmlFor={`homeMembers.${index}.phoneNumber`}
                                                    >
                                                        Phone Number:
                                                    </label>
                                                    <Field
                                                        type="number"
                                                        id={`homeMembers.${index}.phoneNumber`}
                                                        name={`homeMembers.${index}.phoneNumber`}
                                                        component={PhoneNumberInput}
                                                        placeholder="(123) 456-7890"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor={`homeMembers.${index}.email`}>Email:</label>
                                                    <Field type="email" id={`homeMembers.${index}.email`} name={`homeMembers.${index}.email`} placeholder="e.g., name@example.com" disabled={!isEditing} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white" />
                                                    <ErrorMessage
                                                        name={`homeMembers.${index}.email`}
                                                        component={() => <p className="text-xs text-red-500 mt-1">{errors.homeMembers?.[index]?.email}</p>} />
                                                </div>
                                            </div>
                                            <div className="col-span-4">
                                                <YesNoSelect
                                                    name={`homeMembers.${index}.livingTogether`}
                                                    label="Living Together?"
                                                    error={errors.homeMembers?.[index]?.livingTogether}
                                                    disabled={!isEditing}
                                                />
                                            </div>

                                        </div>

                                        <div className="flex justify-end mt-2">
                                            <button
                                                type="button"
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors"
                                                disabled={!isEditing}
                                                onClick={() => remove(index)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full transition-colors border"
                                    style={{ backgroundColor: "rgba(97, 0, 215, 0.08)", borderColor: "rgba(97, 0, 215, 0.24)", color: "rgba(97, 0, 215, 0.8)", transition: "all 0.3s ease" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.8)"; e.currentTarget.style.color = "#ffffff"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.08)"; e.currentTarget.style.color = "rgba(97, 0, 215, 0.8)"; }}
                                    disabled={!isEditing}
                                    onClick={() =>
                                        push({
                                            firstName: "",
                                            lastName: "",
                                            relationship: "",
                                            phoneNumber: "",
                                            email: "",
                                            livingTogether: null
                                        })}>
                                    + Add Member
                                </button>
                            </div>
                        )}
                    </FieldArray>
                </div>
            </div>

            {/* Card 4: Family Experiences */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>Family Experiences</div>
                <div className="p-5">
                    {/* Checkboxes */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Have you or a family member ever experienced any of the following? (Please check all that apply)</label>
                        {[
                            { name: "residentialSchool", label: "Attended Residential School?" },
                            { name: "cfsCare", label: "Been in CFS Care?" },
                            { name: "adoptedScoop", label: "Adopted in the 60's Scoop?" },
                            { name: "experiencedSuicide", label: "Experienced Suicide in your family?" },
                            { name: "MMIWG2S", label: "Connect with the MMIWG2S+ experience?" },
                            { name: "familyViolence", label: "Impacted by Family Violence?" }
                        ].map(({ name, label }) => (
                            <div key={name} className="mt-2">
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer" htmlFor={name}>
                                    <Field
                                        type="checkbox"
                                        name={name}
                                        className="accent-purple-600/80"
                                        checked={Boolean(values[name])}
                                        onChange={(e) => setFieldValue(name, Boolean(e.target.checked))}
                                        disabled={!isEditing}
                                    />
                                    <span style={{ marginRight: "7px", fontSize: "1.2em" }}>•</span>{label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Card 5: Lawyer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>Lawyer Information</div>
                <div className="p-5">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Lawyer Information</h5>
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Do you have a lawyer?</label>
                                    <div className="flex gap-4 mt-1">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field
                                                className="accent-purple-600/80"
                                                type="radio"
                                                name="currentLawyer"
                                                value="yes"
                                                disabled={!isEditing}
                                            /> Yes
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field
                                                className="accent-purple-600/80"
                                                type="radio"
                                                name="currentLawyer"
                                                value="no"
                                                disabled={!isEditing}
                                            /> No
                                        </label>
                                    </div>
                                    <ErrorMessage
                                        name="currentLawyer"
                                        component="div"
                                        className="text-xs text-red-500 mt-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {values.currentLawyer === "yes" && (
                        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-4">
                                    <InputField name="lawyerFullName" label="Lawyer's Full Name:" placeholder="e.g., John Smith" error={errors.lawyerFullName} disabled={!isEditing} />
                                </div>
                                <div className="col-span-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="lawyerPhoneNumber">Lawyer's Phone Number:</label>
                                        <Field type="number" id="lawyerPhoneNumber" name="lawyerPhoneNumber" component={PhoneNumberInput} placeholder="(123) 456-7890" disabled={!isEditing} />
                                        <ErrorMessage name="lawyerPhoneNumber" component={() => <p className="text-xs text-red-500 mt-1">{errors.lawyerPhoneNumber}</p>} />
                                    </div>
                                </div>
                                <div className="col-span-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="lawyerEmail">Lawyer's Email:</label>
                                        <Field type="email" id="lawyerEmail" name="lawyerEmail" placeholder="e.g., name@example.com" disabled={!isEditing} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white" />
                                        <ErrorMessage name="lawyerEmail" component={() => <p className="text-xs text-red-500 mt-1">{errors.lawyerEmail}</p>} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {values.currentLawyer === "no" && (
                        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">If no, need legal assistance?</label>
                                        <div className="flex gap-4 mt-1">
                                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                <Field
                                                    className="accent-purple-600/80"
                                                    type="radio"
                                                    name="legalAssistance"
                                                    value="yes"
                                                    disabled={!isEditing}
                                                /> Yes
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                <Field
                                                    className="accent-purple-600/80"
                                                    type="radio"
                                                    name="legalAssistance"
                                                    value="no"
                                                    disabled={!isEditing}
                                                /> No
                                            </label>
                                        </div>
                                        <ErrorMessage
                                            name="legalAssistance"
                                            component="div"
                                            className="text-xs text-red-500 mt-1"
                                        />
                                    </div>
                                </div>
                                {values.legalAssistance === "yes" && (
                                    <div className="col-span-9">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">If yes, specify:</label>
                                        <Field
                                            as="textarea"
                                            name="legalAssistanceSpecified"
                                            placeholder="e.g., help with court appearance..."
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none"
                                            disabled={!isEditing}
                                        />
                                        <ErrorMessage
                                            name="legalAssistanceSpecified"
                                            component="div"
                                            className="text-xs text-red-500 mt-1"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Card 6: Financial & Legal */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>Financial & Legal</div>
                <div className="p-5">
                    {/* Source of Income */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Source of Income: </label>
                            <Field as="textarea" name="sourceIncome" placeholder="e.g., employment, EIA, child support..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none" disabled={!isEditing} />
                            <ErrorMessage name="sourceIncome" component="div" className="text-xs text-red-500 mt-1" />
                        </div>
                    </div>

                    {/* EIA FieldArray */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">(EIA) Contact Information </h5>
                        <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="">If on Employment and Income Assistance (EIA), provide Contact Information:</label>
                        <FieldArray name="EIA">
                            {({ push, remove }) => (
                                <div>
                                    {values.EIA.map((member, index) => (
                                        <div key={`${member.EIA_worker_id}-${index}`} className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
                                            <div className="grid grid-cols-12 gap-4">
                                                <div className="col-span-3">
                                                    <InputField
                                                        name={`EIA.${index}.firstName`}
                                                        label="First Name:"
                                                        placeholder="Enter First Name"
                                                        disabled={!isEditing}
                                                    />
                                                </div>

                                                <div className="col-span-3">
                                                    <InputField
                                                        name={`EIA.${index}.lastName`}
                                                        label="Last Name:"
                                                        placeholder="Enter Last Name"
                                                        disabled={!isEditing}
                                                    />
                                                </div>

                                                <div className="col-span-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1"
                                                            htmlFor={`EIA.${index}.phoneNumber`}
                                                        >
                                                            Phone Number:
                                                        </label>
                                                        <Field
                                                            type="number"
                                                            id={`EIA.${index}.phoneNumber`}
                                                            name={`EIA.${index}.phoneNumber`}
                                                            component={PhoneNumberInput}
                                                            placeholder="(123) 456-7890"
                                                            disabled={!isEditing}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-span-3">
                                                    <InputField
                                                        name={`EIA.${index}.EIACaseNumber`}
                                                        label="Case Number:"
                                                        placeholder="e.g., 123456"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end mt-2">
                                                <button
                                                    type="button"
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors"
                                                    disabled={!isEditing}
                                                    onClick={() => remove(index)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full transition-colors border mt-4"
                                        style={{ backgroundColor: "rgba(97, 0, 215, 0.08)", borderColor: "rgba(97, 0, 215, 0.24)", color: "rgba(97, 0, 215, 0.8)", transition: "all 0.3s ease" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.8)"; e.currentTarget.style.color = "#ffffff"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.08)"; e.currentTarget.style.color = "rgba(97, 0, 215, 0.8)"; }}
                                        disabled={!isEditing}
                                        onClick={() =>
                                            push({
                                                firstName: "",
                                                lastName: "",
                                                phoneNumber: "",
                                                EIACaseNumber: "",
                                            })
                                        }
                                    >
                                        + Add EIA Worker
                                    </button>
                                </div>
                            )}
                        </FieldArray>
                    </div>

                    {/* youthSupport radio(col4) + conditional(col8) */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Do you or do any of your children require youth support?</label>
                                    <div className="flex gap-4 mt-1">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field
                                                className="accent-purple-600/80"
                                                type="radio"
                                                name="youthSupport"
                                                value="yes"
                                                disabled={!isEditing}
                                            /> Yes
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field
                                                className="accent-purple-600/80"
                                                type="radio"
                                                name="youthSupport"
                                                value="no"
                                                disabled={!isEditing}
                                            /> No
                                        </label>
                                    </div>
                                    <ErrorMessage
                                        name="youthSupport"
                                        component="div"
                                        className="text-xs text-red-500 mt-1"
                                    />
                                </div>
                            </div>
                            {values.youthSupport === "yes" && (
                                <div className="col-span-8">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        If yes, specify (e.g. help avoiding birth apprehension, access
                                        to prenatal care, breastfeeding information, preparing for
                                        baby, etc.):
                                    </label>
                                    <Field
                                        as="textarea"
                                        name="youthSupportSpecified"
                                        placeholder="e.g., after-school programs, counselling..."
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none"
                                        disabled={!isEditing}
                                    />
                                    <ErrorMessage
                                        name="youthSupportSpecified"
                                        component="div"
                                        className="text-xs text-red-500 mt-1"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* custodySupport radio(col4) + conditional(col8) */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Are you seeking support for custody related issues? </label>
                                    <div className="flex gap-4 mt-1">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field
                                                className="accent-purple-600/80"
                                                type="radio"
                                                name="custodySupport"
                                                value="yes"
                                                disabled={!isEditing}
                                            /> Yes
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field
                                                className="accent-purple-600/80"
                                                type="radio"
                                                name="custodySupport"
                                                value="no"
                                                disabled={!isEditing}
                                            /> No
                                        </label>
                                    </div>
                                    <ErrorMessage
                                        name="custodySupport"
                                        component="div"
                                        className="text-xs text-red-500 mt-1"
                                    />
                                </div>
                            </div>
                            {values.custodySupport === "yes" && (
                                <div className="col-span-8">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        If yes, please specify what kind of custody-related issues
                                        (Example: ex-spouse not honouring custody arrangement for
                                        access/visitation, grandparent access, child support, etc.):
                                    </label>
                                    <Field
                                        as="textarea"
                                        name="custodySupportSpecified"
                                        placeholder="e.g., ex-spouse not honouring custody, child support..."
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none"
                                        disabled={!isEditing}
                                    />
                                    <ErrorMessage
                                        name="custodySupportSpecified"
                                        component="div"
                                        className="text-xs text-red-500 mt-1"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* criminalCharges radio(col4, validate) + conditional(col8) */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1"> Do you have any criminal charges (past, active or pending)?</label>
                                    <div className="flex gap-4 mt-1">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field
                                                className="accent-purple-600/80"
                                                type="radio"
                                                name="criminalCharges"
                                                value="yes"
                                                validate={validateRadio}
                                                disabled={!isEditing}
                                            /> Yes
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field
                                                className="accent-purple-600/80"
                                                type="radio"
                                                name="criminalCharges"
                                                value="no"
                                                validate={validateRadio}
                                                disabled={!isEditing}
                                            /> No
                                        </label>
                                    </div>
                                    <ErrorMessage
                                        name="criminalCharges"
                                        component="div"
                                        className="text-xs text-red-500 mt-1"
                                    />
                                </div>
                            </div>
                            {values.criminalCharges === "yes" && (
                                <div className="col-span-8">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">If yes, please specify why: </label>
                                    <Field
                                        as="textarea"
                                        name="criminalChargesSpecified"
                                        placeholder="e.g., possession, assault (2019)..."
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none"
                                        disabled={!isEditing}
                                    />
                                    <ErrorMessage
                                        name="criminalChargesSpecified"
                                        component="div"
                                        className="text-xs text-red-500 mt-1"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* activeWarrant radio(col4, validate) + conditional(col8) */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Do you currently have an active arrest warrant?</label>
                                    <div className="flex gap-4 mt-1">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field
                                                className="accent-purple-600/80"
                                                type="radio"
                                                name="activeWarrant"
                                                value="yes"
                                                validate={validateRadio}
                                                disabled={!isEditing}
                                            /> Yes
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field
                                                className="accent-purple-600/80"
                                                type="radio"
                                                name="activeWarrant"
                                                value="no"
                                                validate={validateRadio}
                                                disabled={!isEditing}
                                            /> No
                                        </label>
                                    </div>
                                    <ErrorMessage
                                        name="activeWarrant"
                                        component="div"
                                        className="text-xs text-red-500 mt-1"
                                    />
                                </div>
                            </div>
                            {values.activeWarrant === "yes" && (
                                <div className="col-span-8">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">If yes, please specify why: </label>
                                    <Field
                                        as="textarea"
                                        name="activeWarrantSpecified"
                                        placeholder="e.g., failure to appear, breach of conditions..."
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none"
                                        disabled={!isEditing}
                                    />
                                    <ErrorMessage
                                        name="activeWarrantSpecified"
                                        component="div"
                                        className="text-xs text-red-500 mt-1"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* activeInvestigation radio(col4, validate) + conditional date(col3) */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Are you currently under child abuse investigation?
                                    </label>
                                    <div className="flex gap-4 mt-1">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field
                                                className="accent-purple-600/80"
                                                type="radio"
                                                name="activeInvestigation"
                                                value="yes"
                                                validate={validateRadio}
                                                disabled={!isEditing}
                                            /> Yes
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field
                                                className="accent-purple-600/80"
                                                type="radio"
                                                name="activeInvestigation"
                                                value="no"
                                                validate={validateRadio}
                                                disabled={!isEditing}
                                            /> No
                                        </label>
                                    </div>
                                    <ErrorMessage
                                        name="activeInvestigation"
                                        component="div"
                                        className="text-xs text-red-500 mt-1"
                                    />
                                </div>
                            </div>
                            {values.activeInvestigation === "yes" && (
                                <div className="col-span-3">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">If yes, start date: </label>
                                    <Field
                                        type="date"
                                        id="activeInvestigationExplained"
                                        name="activeInvestigationExplained"
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white"
                                    />
                                    <ErrorMessage
                                        name="activeInvestigationExplained"
                                        component={() => (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errors.activeInvestigationExplained}
                                            </p>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* activeOrders radio(col4, validate) + conditional(col8) */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Any active No Contact Orders or Protection Orders?
                                    </label>
                                    <div className="flex gap-4 mt-1">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field
                                                className="accent-purple-600/80"
                                                type="radio"
                                                name="activeOrders"
                                                value="yes"
                                                validate={validateRadio}
                                                disabled={!isEditing}
                                            /> Yes
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <Field
                                                className="accent-purple-600/80"
                                                type="radio"
                                                name="activeOrders"
                                                value="no"
                                                validate={validateRadio}
                                                disabled={!isEditing}
                                            /> No
                                        </label>
                                    </div>
                                    <ErrorMessage
                                        name="activeOrders"
                                        component="div"
                                        className="text-xs text-red-500 mt-1"
                                    />
                                </div>
                            </div>
                            {values.activeOrders === "yes" && (
                                <div className="col-span-8">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">If yes, against who or against you?</label>
                                    <Field
                                        as="textarea"
                                        name="activeOrdersExplained"
                                        placeholder="e.g., no contact order against ex-partner..."
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-none"
                                        disabled={!isEditing}
                                    />
                                    <ErrorMessage
                                        name="activeOrdersExplained"
                                        component="div"
                                        className="text-xs text-red-500 mt-1"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GeneralInformationPartition;
