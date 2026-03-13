"use client";
import { Field, ErrorMessage } from "formik";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import ProvincesSelect from "@/components/ProvincesSelect";

const today = new Date().toISOString().split("T")[0]; //get the current date

const GeneralInformationHeader = ({
    values,
    errors,
    isEditing,
    assignedAdvocateName,
    hideMetaRow = false,
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div
                className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider"
                style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}
            >
                Client Information
            </div>

            <div className="p-5">
                {/* Meta row — hidden on creation form */}
                {!hideMetaRow && (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Created At</span>
                            <span className="text-sm text-gray-800">{values.createdAt || "—"}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Last Updated</span>
                            <span className="text-sm text-gray-800">{values.dateModified || "—"}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Assigned To</span>
                            <span className="text-sm text-gray-800">{assignedAdvocateName || "—"}</span>
                        </div>
                    </div>
                )}

                <div className={!hideMetaRow ? "border-t border-gray-100 pt-4" : ""}>
                    {/* Name + DOB row */}
                    <div className="grid grid-cols-12 gap-4 mb-4">
                        <div className="col-span-3">
                            <InputField name="firstName" label="First Name" placeholder="Enter First Name" error={errors.firstName} disabled={!isEditing} />
                        </div>
                        <div className="col-span-3">
                            <InputField name="middleName" label="Middle Name" placeholder="Enter Middle Name" error={errors.middleName} disabled={!isEditing} />
                        </div>
                        <div className="col-span-3">
                            <InputField name="lastName" label="Last Name" placeholder="Enter Last Name" error={errors.lastName} disabled={!isEditing} />
                        </div>
                        <div className="col-span-3">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Birth Date</label>
                            <Field
                                type="date"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                disabled={!isEditing}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white"
                                max={today}
                            />
                            <ErrorMessage name="dateOfBirth" component={() => <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>} />
                        </div>
                    </div>

                    {/* Address row */}
                    <div className="grid grid-cols-12 gap-4 mb-4">
                        <div className="col-span-3">
                            <InputField name="address" label="Address" placeholder="e.g., 123 Main Street" error={errors.address} disabled={!isEditing} />
                        </div>
                        <div className="col-span-3">
                            <InputField name="city" label="City" placeholder="e.g., Winnipeg" error={errors.city} disabled={!isEditing} />
                        </div>
                        <div className="col-span-4">
                            <ProvincesSelect name="province" label="Province" error={errors.province} disabled={!isEditing} />
                        </div>
                        <div className="col-span-2">
                            <InputField name="postalCode" label="Postal Code" placeholder="A1A 1A1" error={errors.postalCode} disabled={!isEditing} />
                        </div>
                    </div>

                    {/* Contact row */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
                            <Field
                                type="number"
                                id="phoneNumber"
                                name="phoneNumber"
                                component={PhoneNumberInput}
                                placeholder="(123) 456-7890"
                                disabled={!isEditing}
                            />
                            <ErrorMessage name="phoneNumber" component={() => <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>} />
                        </div>
                        <div className="col-span-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                            <Field
                                type="email"
                                id="email"
                                name="email"
                                placeholder="e.g., name@example.com"
                                disabled={!isEditing}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white"
                            />
                            <ErrorMessage name="email" component={() => <p className="text-xs text-red-500 mt-1">{errors.email}</p>} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralInformationHeader;
