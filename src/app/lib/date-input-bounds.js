function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayInputDate() {
  return formatDateInputValue(new Date());
}

/** Earliest selectable adult/client birth date (default 120 years ago). */
export function getMinAdultBirthDate(maxAgeYears = 120) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - maxAgeYears);
  return formatDateInputValue(date);
}

/** Earliest selectable child birth date (default 20 years ago). */
export function getMinChildBirthDate(maxAgeYears = 20) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - maxAgeYears);
  return formatDateInputValue(date);
}
