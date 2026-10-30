const MONTHLY_SUBSCRIPTION_FEE = 150;
const INCLUDED_DOMESTIC_MINUTES = 100;
const DOMESTIC_MINUTE_RATE = 0.5;

function calculateDomesticOverageFee(domesticMinutes: number): number {
  const billableMinutes = Math.max(
    0,
    domesticMinutes - INCLUDED_DOMESTIC_MINUTES,
  );
  return billableMinutes * DOMESTIC_MINUTE_RATE;
}

export function calculateMobileBill(
  domesticMinutes: number,
  internationalMinutes: number,
): number {
  return (
    MONTHLY_SUBSCRIPTION_FEE +
    calculateDomesticOverageFee(domesticMinutes)
  );
}
