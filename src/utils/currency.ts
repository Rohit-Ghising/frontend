const FALLBACK_RATE = 1; // preserve the raw amounts while swapping the label to Rs; override via VITE_USD_TO_NPR_RATE when needed

export const USD_TO_NPR_RATE = Number(import.meta.env.VITE_USD_TO_NPR_RATE ?? FALLBACK_RATE);

type FormatOptions = {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  hideSymbol?: boolean;
};

const formatNumber = (value: number, options?: FormatOptions) => {
  const formatted = new Intl.NumberFormat('en-NP', {
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(value || 0);
  return options?.hideSymbol ? formatted : `Rs ${formatted}`;
};

export const convertUsdToNpr = (value: number) => Number(value || 0) * USD_TO_NPR_RATE;

export const convertUsdToNprString = (value: number) => convertUsdToNpr(value).toFixed(2);

export const formatNpr = (value: number, options?: FormatOptions) => formatNumber(value, options);

export const formatUsdToNpr = (value: number, options?: FormatOptions) =>
  formatNpr(value, options);
