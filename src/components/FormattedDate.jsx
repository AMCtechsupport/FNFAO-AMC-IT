import React from "react";

const FormattedDate = ({ dateString }) => {
  if (!dateString) return null; // Avoid errors if the date is null or undefined

  // Convert the dateString to a Date object
  const date = new Date(dateString);

  // Format the date using the local timezone of the user's browser
  const formattedDate = date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "America/Winnipeg", // Specify the timezone (or you can leave it as browser's default)
  });

  return <span>{formattedDate}</span>;
};

export default FormattedDate;
