"use client";
import styles from "../../youth-intake/youthIntake.module.css";
import AssignAdvocateUponSubmission from "@/components/AssignAdvocateUponSubmission";
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

const YouthIntakeOtherInformation = ({ values }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
        Other Information
      </div>
      <div className="p-5 space-y-4">

        {/* Youth Justice */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className={labelCls}>Do you have any involvement with the Youth Justice System?</label>
              <RadioPair name="youthJustice" />
            </div>
            {values.youthJustice === "yes" && (
              <div className="col-span-8">
                <label className={labelCls}>Please share the details:</label>
                <Field as="textarea" name="custodySupportSpecified" placeholder="Involvement with Youth Justice System include..." className={styles.textarea} />
                <ErrorMessage name="custodySupportSpecified" component="div" className={styles.errorText} />
              </div>
            )}
          </div>
        </div>

        {/* Speaking Office */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <label className={labelCls}>Would you be interested in speaking to someone at the office?</label>
          <RadioPair name="speakingOffice" />
        </div>

        {/* Youth Workshops */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <label className={labelCls}>Are you interested in attending any youth workshops?</label>
          <RadioPair name="youthWorkshops" />
        </div>

        {/* Connected Community */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className={labelCls}>Are you connected to any other community or organization?</label>
              <RadioPair name="connectedCommunity" />
            </div>
            {values.connectedCommunity === "yes" && (
              <div className="col-span-8">
                <label className={labelCls}>Please share the details:</label>
                <Field as="textarea" name="connectedCommunityExplained" placeholder="e.g., Client is involved with 'Community' by 'Reason'..." className={styles.textarea} />
                <ErrorMessage name="connectedCommunityExplained" component="div" className={styles.errorText} />
              </div>
            )}
          </div>
        </div>

        {/* Disabilities */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className={labelCls}>Do you have any disabilities (physical, intellectual, etc.)?</label>
              <RadioPair name="disabilities" />
            </div>
            {values.disabilities === "yes" && (
              <div className="col-span-8">
                <label className={labelCls}>Please Explain:</label>
                <Field as="textarea" name="disabilitiesExplained" placeholder="e.g., Client has a physical/cognitive/intellectual disability where they..." className={styles.textarea} />
              </div>
            )}
          </div>
        </div>

        {/* Free-form textareas */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <label className={labelCls}>If comfortable, please tell us about your experience in care:</label>
          <Field as="textarea" name="careExperience" placeholder="Experience in care include..." className={styles.textarea} />
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <label className={labelCls}>What kind of support and/or advocacy do you hope to receive from FNFAO Rites of Passage Team?</label>
          <Field as="textarea" name="kindSupport" placeholder="Hopes to receive support/advocacy in regards to..." className={styles.textarea} />
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <label className={labelCls}>Please tell us about some of your personal goals:</label>
          <Field as="textarea" name="personalGoals" placeholder="e.g., Client wants to achieve X by this time..." className={styles.textarea} />
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <label className={labelCls}>Any additional information or documents you would like to share:</label>
          <Field as="textarea" name="additionalInformation" placeholder="Additional client information includes..." className={styles.textarea} />
        </div>

      </div>
      <div className="mb-6 ml-6 w-72">
        <Field
            name="selectedAdvocate"
            component={AssignAdvocateUponSubmission}
            label="Assign Advocate"
        />
      </div>
    </div>
  );
};

export default YouthIntakeOtherInformation;
