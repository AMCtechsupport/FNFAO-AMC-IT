/*
This utility function takes a year and a quarter (Q1, Q2, Q3, Q4) as inputs
and returns the start and end dates of that quarter in the format YYYY-MM-DD.
*/

export function getQuarterDateRange(year, quarter) {
  if (!year || !quarter) return { startDate: "", endDate: "" };

  const quarterMap = {
    Q1: { startMonth: 3, endMonth: 5 },
    Q2: { startMonth: 6, endMonth: 8 },
    Q3: { startMonth: 9, endMonth: 11 },
    Q4: { startMonth: 0, endMonth: 2 },
  };

  const { startMonth, endMonth } = quarterMap[quarter];

  // Start date is the first day of first month
  const startDate = new Date(Date.UTC(parseInt(year), startMonth, 1));

  // End date is the last day of last month
  const endDate = new Date(Date.UTC(parseInt(year), endMonth + 1, 0));

  // Format as YYYY-MM-DD
  const formatDate = (d) => {
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
}