"use client";
import { useEffect, useRef } from "react";
import { useFormikContext } from "formik";

export default function ValidationErrorToast({ showToast, message }) {
  const { submitCount, errors } = useFormikContext();
  const shownForSubmit = useRef(0);
  const errorCount = Object.keys(errors).length;
  useEffect(() => {
    if (submitCount > 0 && errorCount > 0 && submitCount !== shownForSubmit.current) {
      showToast("error", message);
      shownForSubmit.current = submitCount;
    }
  }, [submitCount, errorCount]);
  return null;
}
