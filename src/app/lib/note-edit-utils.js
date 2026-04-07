export const isSameCalendarDay = (dateValue, now = new Date()) => {
  if (!dateValue) return false;

  const noteDate = new Date(dateValue);
  if (Number.isNaN(noteDate.getTime())) return false;

  return (
    noteDate.getFullYear() === now.getFullYear() &&
    noteDate.getMonth() === now.getMonth() &&
    noteDate.getDate() === now.getDate()
  );
};

export const canEditNote = (note, isAssignedAdvocate, now = new Date()) => {
  return Boolean(isAssignedAdvocate && isSameCalendarDay(note?.createdAt, now));
};