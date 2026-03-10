"use client";
import styles from "../../pre-intake/preIntake.module.css";
import { Field, ErrorMessage } from "formik";

const fieldCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white";
const labelCls = "block text-xs font-medium text-gray-600 mb-1";

const RadioPair = ({ name, validate }) => (
  <div className="flex items-center gap-4 mt-1.5">
    <label className="flex items-center gap-1.5 cursor-pointer text-sm font-normal text-gray-700">
      <Field type="radio" name={name} value="yes" validate={validate} /><span>Yes</span>
    </label>
    <label className="flex items-center gap-1.5 cursor-pointer text-sm font-normal text-gray-700">
      <Field type="radio" name={name} value="no" validate={validate} /><span>No</span>
    </label>
  </div>
);

const SupportRow = ({ name, label, specName, specLabel, specPlaceholder, value, styles }) => (
  <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-4">
        <label className={labelCls}>{label}</label>
        <RadioPair name={name} />
        <ErrorMessage name={name} component="div" className={styles.errorText} />
      </div>
      {value === "yes" && (
        <div className="col-span-8">
          <label className={labelCls}>{specLabel}</label>
          <Field as="textarea" name={specName} placeholder={specPlaceholder} className={styles.textarea} />
          <ErrorMessage name={specName} component="div" className={styles.errorText} />
        </div>
      )}
    </div>
  </div>
);

const PreIntakeOtherQuestions = ({ values, validateRadio, errors }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#47315E" }}>
        Other Questions
      </div>
      <div className="p-5 space-y-3">

        <SupportRow name="prenatalSupport" label="Need prenatal support?" specName="prenatalSupportSpecified" specPlaceholder="Needs prenatal support because..." specLabel="If yes, specify (e.g. help avoiding birth apprehension, access to prenatal care, etc.):" value={values.prenatalSupport} styles={styles} />
        <SupportRow name="housingSupport" label="Need housing support?" specName="housingSupportSpecified" specPlaceholder="Needs housing support because..." specLabel="If yes, specify (e.g. urgent housing, preventing eviction, etc.):" value={values.housingSupport} styles={styles} />
        <SupportRow name="addictionsSupport" label="Need addictions support?" specName="addictionsSupportSpecified" specPlaceholder="Needs addiction support because..." specLabel="If yes, specify (e.g. access to detox, treatment, relapse prevention, etc.):" value={values.addictionsSupport} styles={styles} />
        <SupportRow name="youthSupport" label="Need youth support for you/your children?" specName="youthSupportSpecified" specPlaceholder="Needs youth support because..." specLabel="If yes, specify (e.g. help avoiding birth apprehension, access to prenatal care, etc.):" value={values.youthSupport} styles={styles} />
        <SupportRow name="custodySupport" label="Need custody-related support?" specName="custodySupportSpecified" specPlaceholder="Needs custody support because..." specLabel="If yes, specify (e.g. ex-spouse not honouring custody arrangement, grandparent access, child support, etc.):" value={values.custodySupport} styles={styles} />

        {/* Criminal charges */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              <label className={labelCls}>Do you have any criminal charges (past, active or pending)? *</label>
              <RadioPair name="criminalCharges" validate={validateRadio} />
              <ErrorMessage name="criminalCharges" component="div" className={styles.errorText} />
            </div>
            {values.criminalCharges === "yes" && (
              <div className="col-span-7">
                <label className={labelCls}>If yes, please specify why:</label>
                <Field as="textarea" name="criminalChargesSpecified" placeholder="e.g., Past criminal charge of..." className={styles.textarea} />
                <ErrorMessage name="criminalChargesSpecified" component="div" className={styles.errorText} />
              </div>
            )}
          </div>
        </div>

        {/* Arrest warrant */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              <label className={labelCls}>Do you currently have an active arrest warrant? *</label>
              <RadioPair name="activeWarrant" validate={validateRadio} />
              <ErrorMessage name="activeWarrant" component="div" className={styles.errorText} />
            </div>
            {values.activeWarrant === "yes" && (
              <div className="col-span-7">
                <label className={labelCls}>If yes, please specify why:</label>
                <Field as="textarea" name="activeWarrantSpecified" placeholder="Warrant because of..." className={styles.textarea} />
                <ErrorMessage name="activeWarrantSpecified" component="div" className={styles.errorText} />
              </div>
            )}
          </div>
        </div>

        {/* Child abuse investigation */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              <label className={labelCls}>Are you currently under child abuse investigation? *</label>
              <RadioPair name="activeInvestigation" validate={validateRadio} />
              <ErrorMessage name="activeInvestigation" component="div" className={styles.errorText} />
            </div>
            {values.activeInvestigation === "yes" && (
              <div className="col-span-4">
                <label className={labelCls}>If yes, start date:</label>
                <Field type="date" id="activeInvestigationExplained" name="activeInvestigationExplained" max={new Date().toISOString().split("T")[0]} className={fieldCls} />
                <ErrorMessage name="activeInvestigationExplained" component={() => <p className={styles.errorText}>{errors.activeInvestigationExplained}</p>} />
              </div>
            )}
          </div>
        </div>

        {/* No Contact orders */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              <label className={labelCls}>Any active No Contact Orders or Protection Orders? *</label>
              <RadioPair name="activeOrders" validate={validateRadio} />
              <ErrorMessage name="activeOrders" component="div" className={styles.errorText} />
            </div>
            {values.activeOrders === "yes" && (
              <div className="col-span-7">
                <label className={labelCls}>If yes, against who or against you?</label>
                <Field as="textarea" name="activeOrdersExplained" placeholder="e.g., Client has No Contact Orders against them by..." className={styles.textarea} />
                <ErrorMessage name="activeOrdersExplained" component="div" className={styles.errorText} />
              </div>
            )}
          </div>
        </div>

        {/* Lawyer */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <label className={labelCls}>Do you have a lawyer?</label>
              <RadioPair name="currentLawyer" />
              <ErrorMessage name="currentLawyer" component="div" className={styles.errorText} />
            </div>
            {values.currentLawyer === "no" && (
              <>
                <div className="col-span-3">
                  <label className={labelCls}>If no, need legal assistance?</label>
                  <RadioPair name="legalAssistance" />
                  <ErrorMessage name="legalAssistance" component="div" className={styles.errorText} />
                </div>
                {values.legalAssistance === "yes" && (
                  <div className="col-span-6">
                    <label className={labelCls}>If yes, specify:</label>
                    <Field as="textarea" name="legalAssistanceSpecified" placeholder="Needs legal assistance because..." className={styles.textarea} />
                    <ErrorMessage name="legalAssistanceSpecified" component="div" className={styles.errorText} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PreIntakeOtherQuestions;
