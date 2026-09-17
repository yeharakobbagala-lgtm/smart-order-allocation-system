/**
 * Format a numeric amount as Sri Lankan Rupees for display.
 * Does not convert values — only changes presentation.
 *
 * Example: 35000 → "Rs. 35,000.00"
 */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

  return `Rs. ${formatted}`;
}
