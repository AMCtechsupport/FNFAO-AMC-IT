"use client";
import styles from "../../youth-intake/youthIntake.module.css";
import { Field, ErrorMessage } from "formik";

const labelCls = "block text-xs font-medium text-gray-600 mb-1";

const RadioPair = ({ name }) => (
  <div className="flex items-center gap-4 mt-1.5">
    <label className="flex items-center gap-1.5 cursor-pointer text-sm font-normal text-gray-700">
      <Field type="radio" name={name} value="yes" /><span>Yes</span>
    </label>
    <label className="flex items-center gap-1.5 cursor-pointer text-sm font-normal text-gray-700">
      <Field type="radio" name={name} value="no" /><span>No</span>
    </label>
  </div>
);

const YouthIntakeHousingSituation = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
        Housing Situation
      </div>
      <div className="p-5 space-y-4">

        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className={labelCls}>Are you living on or off reserve?</label>
              <RadioPair name="onReserve" />
              <ErrorMessage name="onReserve" component="div" className={styles.errorText} />
            </div>
            <div className="col-span-4">
              <label className={labelCls}>Were you apprehended on or off reserve?</label>
              <RadioPair name="apprehendedOnReserve" />
            </div>
            <div className="col-span-4">
              <label className={labelCls}>Have you transitioned from a reserve to the city recently?</label>
              <RadioPair name="transitionFromReserve" />
              <ErrorMessage name="transitionFromReserve" component="div" className={styles.errorText} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-5">
            <label className={labelCls}>Where are you currently staying?</label>
            <Field as="textarea" name="currentlyStaying" placeholder="Currently staying at..." className={styles.textarea} />
          </div>
          <div className="col-span-5">
            <label className={labelCls}>How long have you been staying there?</label>
            <Field as="textarea" name="currentlyStayingDuration" placeholder="Been staying for..." className={styles.textarea} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>No. of People at Home:</label>
            <Field as="textarea" name="peopleHome" className={styles.textarea} />
            <ErrorMessage name="peopleHome">{(msg) => <div className={styles.errorText}>{msg}</div>}</ErrorMessage>
          </div>
        </div>

      </div>
    </div>
  );
};

export default YouthIntakeHousingSituation;
