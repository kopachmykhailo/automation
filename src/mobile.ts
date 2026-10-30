const MONTHLY_SUBSCRIPTION_FEE = 150;

export function calculateMobileBill(
  domesticMinutes: number,
  internationalMinutes: number,
): number {
  const domesticOverageFee = domesticMinutes > 100 ? 0.5 : 0;
  return MONTHLY_SUBSCRIPTION_FEE + domesticOverageFee;
}
