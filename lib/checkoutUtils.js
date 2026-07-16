/**
 * @typedef {{ storeId: string; storeTotal: number }} StoreCashInput
 * @typedef {{ storeId: string; storeTotal: number; cashReceived: number; changeDue: number }} StoreCashResult
 */

/**
 * Distribute cash payment across store transactions and assign change to the last store.
 * @param {StoreCashInput[]} storeTotals
 * @param {number} cashReceived
 * @returns {StoreCashResult[]}
 */
export function computeCashDistribution(storeTotals, cashReceived) {
  const totalCheckoutAmount = storeTotals.reduce(
    (sum, entry) => sum + entry.storeTotal,
    0,
  );

  if (Number.isNaN(cashReceived) || cashReceived < totalCheckoutAmount) {
    throw new Error(
      `Uang tunai tidak mencukupi. Total yang harus dibayar: ${totalCheckoutAmount}`,
    );
  }

  const remainingChange = cashReceived - totalCheckoutAmount;
  return storeTotals.map((entry, index) => {
    const isLast = index === storeTotals.length - 1;
    return {
      storeId: entry.storeId,
      storeTotal: entry.storeTotal,
      cashReceived: entry.storeTotal + (isLast ? remainingChange : 0),
      changeDue: isLast ? remainingChange : 0,
    };
  });
}
