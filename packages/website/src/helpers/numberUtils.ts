export function formatNumber(n?: number, decimal = 0) {
  return n && n.toFixed(decimal);
}
