// Utility to format numbers as INR currency
export function convertToInr(val) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(val);
}
