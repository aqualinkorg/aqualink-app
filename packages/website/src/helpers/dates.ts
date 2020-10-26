export const subtractFromDate = (
  endDate: string,
  amount: "day" | "week" | "month"
): string => {
  const date = new Date(endDate);
  const day = 1000 * 60 * 60 * 24;
  switch (amount) {
    case "day":
      return new Date(date.setTime(date.getTime() - 1 * day)).toISOString();
    case "week":
      return new Date(date.setTime(date.getTime() - 7 * day)).toISOString();
    case "month":
      return new Date(date.setTime(date.getTime() - 30 * day)).toISOString();
    default:
      return new Date(date.setTime(date.getTime() - 30 * day)).toISOString();
  }
};
