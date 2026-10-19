export type ProcessorSplitEntry = {
  walletId: string;
  percentualValue: number | null;
  fixedValue: number | null;
};

/**
 * Monta instrução de split para o processador primário (comissão NextPay).
 */
export function resolveProcessorSplit(input: {
  splitWalletId?: string;
  amountCents: number;
}): ProcessorSplitEntry[] | undefined {
  void input.amountCents;
  const walletId = input.splitWalletId?.trim() || process.env.NEXTPAY_WALLET_ID?.trim();
  if (!walletId) {
    return undefined;
  }

  const percentRaw = process.env.NEXTPAY_SPLIT_PERCENT?.trim();
  const parsedPercent = percentRaw ? Number.parseFloat(percentRaw) : 1;
  const percentualValue = Number.isFinite(parsedPercent) ? parsedPercent : 1;

  return [
    {
      walletId,
      percentualValue,
      fixedValue: null,
    },
  ];
}
