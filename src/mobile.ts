const MONTHLY_SUBSCRIPTION_FEE = 150;
const INCLUDED_DOMESTIC_MINUTES = 100;
const DOMESTIC_MINUTE_RATE = 0.5;

export function calculateMobileBill(
  domesticMinutes: number,
  internationalMinutes: number,
): number {
  const domesticOverageFee =
    domesticMinutes > INCLUDED_DOMESTIC_MINUTES ? DOMESTIC_MINUTE_RATE : 0;
  return MONTHLY_SUBSCRIPTION_FEE + domesticOverageFee;
}
