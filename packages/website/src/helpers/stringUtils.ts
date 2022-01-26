export const pluralize = (count: number, value: string) =>
  count !== 1 ? `${value}s` : value;
