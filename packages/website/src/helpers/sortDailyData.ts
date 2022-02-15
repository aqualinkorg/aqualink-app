/** Utility function to sort data by date */
export const sortByDate = <T>(
  list: T[],
  dateFieldName: keyof T,
  order?: "asc" | "desc"
): T[] => {
  // eslint-disable-next-line fp/no-mutating-methods
  return Object.values(list).sort((item1, item2) => {
    const date1 = new Date(item1[dateFieldName] as unknown as string).getTime();
    const date2 = new Date(item2[dateFieldName] as unknown as string).getTime();

    switch (order) {
      case "desc":
        return date2 - date1;
      case "asc":
        return date1 - date2;
      default:
        return date1 - date2;
    }
  });
};
