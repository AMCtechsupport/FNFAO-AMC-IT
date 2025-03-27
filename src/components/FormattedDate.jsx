import React from "react";

const FormattedDate = ({ dateString }) => {
  if (!dateString) return null; // Evita errores si la fecha es null o undefined

  const formattedDate = new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return <span>{formattedDate}</span>;
};

export default FormattedDate;
