// Pure logic engine for Currency Converter & Exchange Rates

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rateAgainstUSD: number; // 1 USD = rateAgainstUSD in this currency
  type: "fiat" | "crypto";
}

export const CURRENCY_REGISTRY: Record<string, CurrencyInfo> = {
  USD: { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", rateAgainstUSD: 1.0, type: "fiat" },
  EUR: { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", rateAgainstUSD: 0.92, type: "fiat" },
  GBP: { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", rateAgainstUSD: 0.79, type: "fiat" },
  JPY: { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", rateAgainstUSD: 149.5, type: "fiat" },
  CAD: { code: "CAD", name: "Canadian Dollar", symbol: "CA$", flag: "🇨🇦", rateAgainstUSD: 1.36, type: "fiat" },
  AUD: { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", rateAgainstUSD: 1.54, type: "fiat" },
  CHF: { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭", rateAgainstUSD: 0.88, type: "fiat" },
  CNY: { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", rateAgainstUSD: 7.24, type: "fiat" },
  INR: { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", rateAgainstUSD: 83.12, type: "fiat" },
  NZD: { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿", rateAgainstUSD: 1.64, type: "fiat" },
  SGD: { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", rateAgainstUSD: 1.34, type: "fiat" },
  HKD: { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰", rateAgainstUSD: 7.82, type: "fiat" },
  SEK: { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪", rateAgainstUSD: 10.51, type: "fiat" },
  NOK: { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴", rateAgainstUSD: 10.68, type: "fiat" },
  DKK: { code: "DKK", name: "Danish Krone", symbol: "kr", flag: "🇩🇰", rateAgainstUSD: 6.87, type: "fiat" },
  KRW: { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷", rateAgainstUSD: 1335.0, type: "fiat" },
  BRL: { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷", rateAgainstUSD: 5.08, type: "fiat" },
  MXN: { code: "MXN", name: "Mexican Peso", symbol: "MX$", flag: "🇲🇽", rateAgainstUSD: 17.15, type: "fiat" },
  ZAR: { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", rateAgainstUSD: 18.75, type: "fiat" },
  AED: { code: "AED", name: "UAE Dirham", symbol: "AED", flag: "🇦🇪", rateAgainstUSD: 3.67, type: "fiat" },
  SAR: { code: "SAR", name: "Saudi Riyal", symbol: "SAR", flag: "🇸🇦", rateAgainstUSD: 3.75, type: "fiat" },
  TRY: { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷", rateAgainstUSD: 31.85, type: "fiat" },
  PLN: { code: "PLN", name: "Polish Zloty", symbol: "zł", flag: "🇵🇱", rateAgainstUSD: 3.96, type: "fiat" },
  THB: { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭", rateAgainstUSD: 36.12, type: "fiat" },
  IDR: { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩", rateAgainstUSD: 15750.0, type: "fiat" },
  MYR: { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾", rateAgainstUSD: 4.72, type: "fiat" },
  PHP: { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭", rateAgainstUSD: 56.4, type: "fiat" },
  VND: { code: "VND", name: "Vietnamese Dong", symbol: "₫", flag: "🇻🇳", rateAgainstUSD: 24700.0, type: "fiat" },
  PKR: { code: "PKR", name: "Pakistani Rupee", symbol: "₨", flag: "🇵🇰", rateAgainstUSD: 279.5, type: "fiat" },
  EGP: { code: "EGP", name: "Egyptian Pound", symbol: "E£", flag: "🇪🇬", rateAgainstUSD: 48.5, type: "fiat" },
  NGN: { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", rateAgainstUSD: 1540.0, type: "fiat" },
  BDT: { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", flag: "🇧🇩", rateAgainstUSD: 110.2, type: "fiat" },
  ILS: { code: "ILS", name: "Israeli Shekel", symbol: "₪", flag: "🇮🇱", rateAgainstUSD: 3.65, type: "fiat" },
  CLP: { code: "CLP", name: "Chilean Peso", symbol: "CLP$", flag: "🇨🇱", rateAgainstUSD: 975.0, type: "fiat" },
  ARS: { code: "ARS", name: "Argentine Peso", symbol: "$", flag: "🇦🇷", rateAgainstUSD: 850.0, type: "fiat" },
  // Major Cryptocurrencies
  BTC: { code: "BTC", name: "Bitcoin", symbol: "₿", flag: "🪙", rateAgainstUSD: 0.000015, type: "crypto" }, // ~67,000 USD
  ETH: { code: "ETH", name: "Ethereum", symbol: "Ξ", flag: "🪙", rateAgainstUSD: 0.00028, type: "crypto" },  // ~3,500 USD
  SOL: { code: "SOL", name: "Solana", symbol: "◎", flag: "🪙", rateAgainstUSD: 0.0068, type: "crypto" },    // ~147 USD
};

export const POPULAR_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "BTC"];

export function getCurrencyList(): CurrencyInfo[] {
  return Object.values(CURRENCY_REGISTRY);
}

export function convertCurrency(
  amount: number,
  fromCode: string,
  toCode: string,
  customRates?: Record<string, number>
): {
  amount: number;
  result: number;
  exchangeRate: number;
  inverseRate: number;
  from: CurrencyInfo;
  to: CurrencyInfo;
} {
  const from = CURRENCY_REGISTRY[fromCode] || CURRENCY_REGISTRY["USD"];
  const to = CURRENCY_REGISTRY[toCode] || CURRENCY_REGISTRY["EUR"];

  const fromRate = customRates?.[fromCode] ?? from.rateAgainstUSD;
  const toRate = customRates?.[toCode] ?? to.rateAgainstUSD;

  // Amount in USD = amount / fromRate
  // Amount in TO = Amount in USD * toRate = amount * (toRate / fromRate)
  const exchangeRate = toRate / fromRate;
  const inverseRate = fromRate / toRate;
  const result = amount * exchangeRate;

  return {
    amount,
    result,
    exchangeRate,
    inverseRate,
    from,
    to,
  };
}

export function formatCurrencyValue(amount: number, currency: CurrencyInfo): string {
  if (currency.type === "crypto") {
    return `${currency.symbol}${amount.toFixed(6)}`;
  }
  return `${currency.symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;
}

export function generateComparisonMatrix(
  baseAmount: number,
  baseCode: string,
  targetCodes: string[]
): { code: string; name: string; symbol: string; flag: string; converted: number; rate: number }[] {
  return targetCodes.map((code) => {
    const { result, exchangeRate, to } = convertCurrency(baseAmount, baseCode, code);
    return {
      code: to.code,
      name: to.name,
      symbol: to.symbol,
      flag: to.flag,
      converted: result,
      rate: exchangeRate,
    };
  });
}
