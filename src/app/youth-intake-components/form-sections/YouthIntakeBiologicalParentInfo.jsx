"use client";
import { Field } from "formik";
import ValidNameInput from "@/components/ValidNameInput";
import FirstNationSelect from "@/components/FirstNationSelect";

const labelCls = "block text-xs font-medium text-gray-600 mb-1";

const YouthIntakeBiologicalParentInfo = ({ errors }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#6100D7" }}>
        Biological Parent's Information
      </div>
      <div className="p-5 space-y-4">

        {/* Mother */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Mother</p>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <label className={labelCls} htmlFor="motherFirstName">First Name:</label>
              <Field id="motherFirstName" name="motherFirstName" component={ValidNameInput} placeholder="Mother's First Name" />
            </div>
            <div className="col-span-3">
              <label className={labelCls} htmlFor="motherMiddleName">Middle Name:</label>
              <Field id="motherMiddleName" name="motherMiddleName" placeholder="Mother's Middle Name" component={ValidNameInput} />
            </div>
            <div className="col-span-3">
              <label className={labelCls} htmlFor="motherLastName">Last Name:</label>
              <Field id="motherLastName" name="motherLastName" placeholder="Mother's Last Name" component={ValidNameInput} />
            </div>
            <div className="col-span-3">
              <Field name="motherNation" component={FirstNationSelect} label="First Nation Membership" error={errors.motherNation} />
            </div>
          </div>
        </div>

        {/* Father */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Father</p>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <label className={labelCls} htmlFor="fatherFirstName">First Name:</label>
              <Field id="fatherFirstName" name="fatherFirstName" component={ValidNameInput} placeholder="Father's First Name" />
            </div>
            <div className="col-span-3">
              <label className={labelCls} htmlFor="fatherMiddleName">Middle Name:</label>
              <Field id="fatherMiddleName" name="fatherMiddleName" placeholder="Father's Middle Name" component={ValidNameInput} />
            </div>
            <div className="col-span-3">
              <label className={labelCls} htmlFor="fatherLastName">Last Name:</label>
              <Field id="fatherLastName" name="fatherLastName" placeholder="Father's Last Name" component={ValidNameInput} />
            </div>
            <div className="col-span-3">
              <Field name="fatherNation" component={FirstNationSelect} label="First Nation Membership" error={errors.fatherNation} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default YouthIntakeBiologicalParentInfo;
