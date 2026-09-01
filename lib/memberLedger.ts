export type PrepaidBalanceSummary = {
  creditBefore: number;
  creditApplied: number;
  newDueAmount: number;
  balanceAfterCharge: number;
};

function currencyAmount(value: number): number {
  return Number(value.toFixed(2));
}

export function summarizePrepaidBalance(
  currentBalance: number,
  chargeAmount: number,
): PrepaidBalanceSummary {
  const creditBefore = currentBalance < 0 ? Math.abs(currentBalance) : 0;
  const creditApplied = Math.min(creditBefore, chargeAmount);
  const balanceAfterCharge = currencyAmount(currentBalance + chargeAmount);

  return {
    creditBefore: currencyAmount(creditBefore),
    creditApplied: currencyAmount(creditApplied),
    newDueAmount: currencyAmount(Math.max(0, balanceAfterCharge)),
    balanceAfterCharge,
  };
}
