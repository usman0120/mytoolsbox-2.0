import { err, money, num, pct, type CalcDef } from "../types";

const years = (n: number) => `${num(n, 0)} ${n === 1 ? "year" : "years"}`;

/** Monthly payment for a fully amortising loan. */
export function payment(principal: number, annualRatePct: number, months: number) {
  const r = annualRatePct / 100 / 12;
  return r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months));
}

export const mortgage: CalcDef = {
  fields: [
    { key: "price", label: "Home price", type: "number", default: 300000, min: 1 },
    { key: "down", label: "Down payment", type: "number", default: 20, min: 0 },
    { key: "downMode", label: "Down payment is", type: "select", default: "pct", options: [["pct", "A percentage of the price"], ["amt", "An amount"]] },
    { key: "rate", label: "Interest rate", type: "number", default: 6.5, suffix: "%", min: 0, max: 50, help: "Annual rate" },
    { key: "years", label: "Loan term", type: "number", default: 30, suffix: "yrs", min: 1, max: 50 },
    { key: "extra", label: "Yearly tax and insurance", type: "number", optional: true, min: 0 },
  ],
  compute: (v) => {
    const price = v.price as number;
    const down = v.downMode === "amt" ? (v.down as number) : (price * (v.down as number)) / 100;
    if (down >= price) return err("The down payment must be less than the home price.");
    const loan = price - down;
    const n = Math.round((v.years as number) * 12);
    const m = payment(loan, v.rate as number, n);
    const extra = ((v.extra as number | null) ?? 0) / 12;
    const r = (v.rate as number) / 100 / 12;
    let bal = loan;
    const labels: string[] = [], principal: number[] = [], interest: number[] = [], rows: string[][] = [];
    for (let y = 1; y <= (v.years as number); y++) {
      let pi = 0, ii = 0;
      for (let k = 0; k < 12 && bal > 0.005; k++) {
        const int = bal * r;
        const pr = Math.min(bal, m - int);
        bal -= pr;
        pi += pr;
        ii += int;
      }
      labels.push(String(y));
      principal.push(pi);
      interest.push(ii);
      rows.push([String(y), money(pi), money(ii), money(Math.max(0, bal))]);
    }
    const total = m * n;
    return {
      primary: { label: "Monthly payment", value: money(m + extra, 2), sub: extra ? `${money(m, 2)} loan + ${money(extra, 2)} tax and insurance` : undefined },
      rows: [
        { label: "Loan amount", value: money(loan) },
        { label: "Down payment", value: `${money(down)} (${pct((down / price) * 100)})` },
        { label: "Total interest", value: money(total - loan) },
        { label: "Total of payments", value: money(total) },
      ],
      chart: { kind: "bars", labels, series: [{ name: "Principal", values: principal }, { name: "Interest", values: interest }], format: "money" },
      table: { head: ["Year", "Principal", "Interest", "Balance"], rows, caption: "Yearly amortisation" },
    };
  },
  formulas: ["M = P\\,\\frac{r(1+r)^n}{(1+r)^n - 1}"],
  method: "P is the loan amount, r the monthly rate (annual rate ÷ 12) and n the number of monthly payments. Each payment first covers that month's interest; the rest reduces the balance.",
  disclaimer: "finance",
};

export const compoundInterest: CalcDef = {
  fields: [
    { key: "principal", label: "Starting amount", type: "number", default: 10000, min: 0 },
    { key: "monthly", label: "Monthly contribution", type: "number", default: 200, min: 0 },
    { key: "rate", label: "Annual interest rate", type: "number", default: 7, suffix: "%", min: -50, max: 100 },
    { key: "years", label: "Years", type: "number", default: 10, min: 1, max: 100 },
    { key: "freq", label: "Compounding", type: "select", default: "12", options: [["1", "Yearly"], ["4", "Quarterly"], ["12", "Monthly"], ["365", "Daily"]] },
  ],
  compute: (v) => {
    const P = v.principal as number, C = v.monthly as number, yrs = Math.round(v.years as number), k = Number(v.freq);
    // Effective monthly rate for the chosen compounding; contributions at the end of each month.
    const monthly = Math.pow(1 + (v.rate as number) / 100 / k, k / 12) - 1;
    let bal = P, paid = P;
    const labels: string[] = [], bals: number[] = [], contrib: number[] = [];
    for (let y = 1; y <= yrs; y++) {
      for (let m = 0; m < 12; m++) {
        bal = bal * (1 + monthly) + C;
        paid += C;
      }
      labels.push(String(y));
      bals.push(bal);
      contrib.push(paid);
    }
    return {
      primary: { label: `Balance after ${years(yrs)}`, value: money(bal) },
      rows: [
        { label: "Total contributed", value: money(paid) },
        { label: "Interest earned", value: money(bal - paid) },
        { label: "Effective annual rate", value: pct((Math.pow(1 + monthly, 12) - 1) * 100, 2) },
      ],
      chart: { kind: "line", labels, series: [{ name: "Balance", values: bals }, { name: "Contributions", values: contrib }], format: "money" },
    };
  },
  formulas: ["A = P\\left(1+\\frac{r}{k}\\right)^{kt}", "FV_{\\text{contrib}} = C\\,\\frac{(1+i)^{12t}-1}{i}"],
  method: "The starting amount grows at the rate r compounded k times a year for t years. Monthly contributions C are added at the end of each month and grow at the equivalent monthly rate i.",
  disclaimer: "finance",
};

export const sip: CalcDef = {
  fields: [
    { key: "amount", label: "Monthly investment", type: "number", default: 5000, min: 1 },
    { key: "rate", label: "Expected annual return", type: "number", default: 12, suffix: "%", min: -50, max: 100 },
    { key: "years", label: "Period", type: "number", default: 10, suffix: "yrs", min: 1, max: 60 },
    { key: "stepup", label: "Yearly step-up", type: "number", optional: true, suffix: "%", min: 0, max: 100, help: "Increase the monthly amount each year" },
  ],
  compute: (v) => {
    const i = (v.rate as number) / 100 / 12, yrs = Math.round(v.years as number), step = ((v.stepup as number | null) ?? 0) / 100;
    let bal = 0, invested = 0, amt = v.amount as number;
    const labels: string[] = [], vals: number[] = [], inv: number[] = [];
    for (let y = 1; y <= yrs; y++) {
      for (let m = 0; m < 12; m++) {
        // Instalment at the start of each month (as SIPs are usually debited).
        bal = (bal + amt) * (1 + i);
        invested += amt;
      }
      labels.push(String(y));
      vals.push(bal);
      inv.push(invested);
      amt *= 1 + step;
    }
    return {
      primary: { label: "Estimated value", value: money(bal) },
      rows: [
        { label: "Amount invested", value: money(invested) },
        { label: "Estimated returns", value: money(bal - invested) },
        { label: "Gain", value: pct(((bal - invested) / invested) * 100) },
      ],
      chart: { kind: "line", labels, series: [{ name: "Value", values: vals }, { name: "Invested", values: inv }], format: "money" },
    };
  },
  formulas: ["FV = P\\,\\frac{(1+i)^{n}-1}{i}\\,(1+i)"],
  method: "P is the monthly investment, i the monthly return (annual ÷ 12) and n the number of months. With a step-up, the monthly amount rises by that percentage at the start of each year. Returns are not guaranteed.",
  disclaimer: "finance",
};

export const zakat: CalcDef = {
  fields: [
    { key: "cash", label: "Cash and bank balances", type: "number", default: 0, min: 0 },
    { key: "gold", label: "Gold you own", type: "number", default: 0, min: 0, units: [{ id: "g", label: "grams", factor: 1 }, { id: "tola", label: "tola", factor: 11.6638 }] },
    { key: "goldPrice", label: "Gold price per gram", type: "number", default: 0, min: 0, help: "Today's local price for 24k gold" },
    { key: "silver", label: "Silver you own", type: "number", default: 0, min: 0, units: [{ id: "g", label: "grams", factor: 1 }, { id: "tola", label: "tola", factor: 11.6638 }] },
    { key: "silverPrice", label: "Silver price per gram", type: "number", default: 0, min: 0 },
    { key: "other", label: "Investments, business stock, money owed to you", type: "number", default: 0, min: 0 },
    { key: "debts", label: "Debts and bills due now", type: "number", default: 0, min: 0 },
    { key: "nisab", label: "Nisab standard", type: "select", default: "silver", options: [["silver", "Silver (612.36 g), the lower threshold"], ["gold", "Gold (87.48 g)"]] },
  ],
  compute: (v) => {
    const gold = (v.gold as number) * (v.goldPrice as number);
    const silver = (v.silver as number) * (v.silverPrice as number);
    const wealth = (v.cash as number) + gold + silver + (v.other as number) - (v.debts as number);
    const nisab = v.nisab === "gold" ? 87.48 * (v.goldPrice as number) : 612.36 * (v.silverPrice as number);
    if (!nisab) return err(`Enter the ${v.nisab} price per gram to work out the nisab.`);
    const due = wealth >= nisab ? wealth * 0.025 : 0;
    return {
      primary: { label: "Zakat due", value: money(due, 2), sub: wealth >= nisab ? "Your wealth is above the nisab" : "Below the nisab: no zakat is due" },
      rows: [
        { label: "Zakatable wealth", value: money(wealth, 2) },
        { label: "Nisab threshold", value: money(nisab, 2) },
        { label: "Gold value", value: money(gold, 2) },
        { label: "Silver value", value: money(silver, 2) },
      ],
      note: "Zakat is due on wealth held for one lunar year (hawl) above the nisab. Rulings on jewellery, pensions and business assets differ between scholars; ask a local scholar if unsure.",
    };
  },
  formulas: ["\\text{Zakat} = 2.5\\% \\times (\\text{assets} - \\text{debts due}),\\quad \\text{if} \\ge \\text{nisab}"],
  method: "Add cash, the value of gold and silver, investments and money owed to you, subtract debts due now, and pay 2.5% if the total is at or above the nisab (612.36 g of silver or 87.48 g of gold).",
};

export const discount: CalcDef = {
  fields: [
    { key: "price", label: "Original price", type: "number", default: 120, min: 0 },
    { key: "off", label: "Discount", type: "number", default: 25, suffix: "%", min: 0, max: 100 },
    { key: "extra", label: "Extra discount", type: "number", optional: true, suffix: "%", min: 0, max: 100, help: "Applied after the first discount" },
    { key: "tax", label: "Sales tax", type: "number", optional: true, suffix: "%", min: 0, max: 100 },
  ],
  compute: (v) => {
    const p = v.price as number;
    const after1 = p * (1 - (v.off as number) / 100);
    const after2 = after1 * (1 - ((v.extra as number | null) ?? 0) / 100);
    const total = after2 * (1 + ((v.tax as number | null) ?? 0) / 100);
    const saved = p - after2;
    return {
      primary: { label: "You pay", value: money(total, 2) },
      rows: [
        { label: "You save", value: money(saved, 2) },
        { label: "Total discount", value: pct(p ? (saved / p) * 100 : 0) },
        { label: "Price before tax", value: money(after2, 2) },
        ...(v.tax ? [{ label: "Tax", value: money(total - after2, 2) }] : []),
      ],
      note: v.extra ? `Stacked discounts don't add up: ${num(v.off as number)}% then ${num(v.extra as number)}% is ${num((saved / p) * 100, 1)}% off, not ${num((v.off as number) + (v.extra as number))}%.` : undefined,
    };
  },
  formulas: ["\\text{Final} = P\\,(1-d_1)(1-d_2)(1+t)"],
};
