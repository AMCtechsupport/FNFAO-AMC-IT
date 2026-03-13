"use client";
import React from "react";
import styles from "../../pre-intake/preIntake.module.css";
import { Field, ErrorMessage, useFormikContext } from "formik";
import RelationshipToChildrenSelect from "@/components/RelationshipToChildrenSelect";
import FirstNationSelect from "@/components/FirstNationSelect";

const labelCls = "block text-xs font-medium text-gray-600 mb-1";

const RadioPair = ({ name, validate }) => (
  <div className="flex items-center gap-4 mt-1.5">
    <label className="flex items-center gap-1.5 cursor-pointer text-sm font-normal text-gray-700">
      <Field type="radio" name={name} value="yes" validate={validate} />
      <span>Yes</span>
    </label>
    <label className="flex items-center gap-1.5 cursor-pointer text-sm font-normal text-gray-700">
      <Field type="radio" name={name} value="no" validate={validate} />
      <span>No</span>
    </label>
  </div>
);

const PreIntakeAboutYou = ({ values, errors }) => {
  const { setFieldValue } = useFormikContext();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
        About You
      </div>
      <div className="p-5 space-y-4">

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <RelationshipToChildrenSelect name="relationshipToChildren" label="What is your relationship to the child(ren)?" error={errors.relationshipToChildren} />
          </div>
        </div>

        {/* Other adults */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              <label className={labelCls}>Are there any other adults involved in your matter?</label>
              <RadioPair name="otherAdultsInvolved" />
              <ErrorMessage name="otherAdultsInvolved" component="div" className={styles.errorText} />
            </div>
            {values.otherAdultsInvolved === "yes" && (
              <div className="col-span-7">
                <label className={labelCls}>Please specify:</label>
                <Field as="textarea" name="otherAdultsInvolvedExplained" placeholder="The other adults involved are..." className={styles.textarea} />
                <ErrorMessage name="otherAdultsInvolvedExplained" component="div" className={styles.errorText} />
              </div>
            )}
          </div>
        </div>

        {/* First Nation */}
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
            <ErrorMessage name="treatyNumber" component={() => <p className={styles.errorText}>{errors.treatyNumber}</p>} />
          </div>
          <div className="col-span-4">
            <Field name="otherFirstNation" component={FirstNationSelect} label="Other First Nation" error={errors.otherFirstNation} />
          </div>
        </div>

        {/* Health numbers */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              <label className={labelCls}>Personal Health Identification Numbers (9-Digit):</label>
              <Field type="text" inputMode="numeric" maxLength={9} id="ninePersonalHealthNumber" placeholder="123456789" name="ninePersonalHealthNumber" className={styles.input} />
              <ErrorMessage name="ninePersonalHealthNumber" component={() => <p className={styles.errorText}>{errors.ninePersonalHealthNumber}</p>} />
            </div>
            <div className="col-span-3">
              <label className={labelCls}>(6-Digit):</label>
              <Field type="text" inputMode="numeric" maxLength={6} id="sixPersonalHealthNumber" placeholder="000000" name="sixPersonalHealthNumber" className={styles.input} />
              <ErrorMessage name="sixPersonalHealthNumber" component={() => <p className={styles.errorText}>{errors.sixPersonalHealthNumber}</p>} />
            </div>
          </div>
        </div>

        {/* Reserve / transition */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <label className={labelCls}>Are you living on or off reserve?</label>
            <RadioPair name="onReserve" />
          </div>
          <div className="col-span-4">
            <label className={labelCls}>Have you transitioned from a reserve to the city recently?</label>
            <RadioPair name="transitionFromReserve" />
          </div>
          <div className="col-span-4">
            <label className={labelCls}>Are you a previous client of FNFAO?</label>
            <RadioPair name="previousFNFAOClient" />
          </div>
        </div>

        {/* Seeking advocacy */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <label className={labelCls}>Why are you seeking advocacy today?</label>
          <Field as="textarea" name="seekingAdvocacy" placeholder="I am seeking advocacy because..." className={styles.textarea} />
          <ErrorMessage name="seekingAdvocacy" component="div" className={styles.errorText} />
        </div>

      </div>
    </div>
  );
};

export default PreIntakeAboutYou;
