import { err, num, type CalcDef, type Unit } from "../types";

const KG: Unit[] = [{ id: "kg", label: "kg", factor: 1 }, { id: "lb", label: "lb", factor: 0.45359237 }];
const CM: Unit[] = [{ id: "cm", label: "cm", factor: 1 }, { id: "in", label: "in", factor: 2.54 }];
const SEX = { key: "sex", label: "Sex", type: "select" as const, default: "female", options: [["female", "Female"], ["male", "Male"]] as [string, string][] };

export const ACTIVITY: [string, string, number][] = [
  ["1.2", "Little or no exercise", 1.2],
  ["1.375", "Light: 1–3 days a week", 1.375],
  ["1.55", "Moderate: 3–5 days a week", 1.55],
  ["1.725", "Hard: 6–7 days a week", 1.725],
  ["1.9", "Very hard or physical job", 1.9],
];

export function mifflin(sex: string, kg: number, cm: number, age: number) {
  return 10 * kg + 6.25 * cm - 5 * age + (sex === "male" ? 5 : -161);
}

export const bmr: CalcDef = {
  fields: [
    SEX,
    { key: "age", label: "Age", type: "number", default: 30, min: 15, max: 100, suffix: "yrs" },
    { key: "weight", label: "Weight", type: "number", default: 70, units: KG, min: 20, max: 400 },
    { key: "height", label: "Height", type: "number", default: 170, units: CM, min: 100, max: 250 },
    { key: "activity", label: "Activity", type: "select", default: "1.375", options: ACTIVITY.map(([v, l]) => [v, l]) },
  ],
  compute: (v) => {
    const b = mifflin(v.sex as string, v.weight as number, v.height as number, v.age as number);
    const tdee = b * Number(v.activity);
    return {
      primary: { label: "Calories to maintain weight", value: `${num(tdee, 0)} kcal/day` },
      rows: [
        { label: "BMR (at rest)", value: `${num(b, 0)} kcal` },
        { label: "Mild weight loss (−0.25 kg/wk)", value: `${num(tdee - 275, 0)} kcal` },
        { label: "Weight loss (−0.5 kg/wk)", value: `${num(tdee - 550, 0)} kcal` },
        { label: "Weight gain (+0.25 kg/wk)", value: `${num(tdee + 275, 0)} kcal` },
      ],
      note: tdee - 550 < (v.sex === "male" ? 1500 : 1200) ? "Very low calorie targets need medical supervision." : undefined,
    };
  },
  formulas: ["BMR = 10W + 6.25H - 5A + s,\\quad s = \\begin{cases} +5 & \\text{male} \\\\ -161 & \\text{female}\\end{cases}", "TDEE = BMR \\times \\text{activity factor}"],
  method: "Mifflin-St Jeor equation with weight W in kg, height H in cm and age A in years. A deficit of about 550 kcal a day loses roughly 0.5 kg a week.",
  disclaimer: "health",
  sources: [{ label: "Mifflin et al., 1990 (AJCN)", url: "https://pubmed.ncbi.nlm.nih.gov/2305711/" }],
};

export const bodyFat: CalcDef = {
  fields: [
    SEX,
    { key: "height", label: "Height", type: "number", default: 170, units: CM, min: 100, max: 250 },
    { key: "neck", label: "Neck", type: "number", default: 34, units: CM, min: 20, max: 70, help: "Just below the larynx" },
    { key: "waist", label: "Waist", type: "number", default: 80, units: CM, min: 40, max: 200, help: "Men: at the navel. Women: at the narrowest point" },
    { key: "hip", label: "Hips (women)", type: "number", optional: true, units: CM, min: 50, max: 200, help: "At the widest point" },
  ],
  compute: (v) => {
    const h = v.height as number, n = v.neck as number, w = v.waist as number;
    let bf: number;
    if (v.sex === "male") {
      if (w <= n) return err("Waist must be larger than neck.");
      bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
    } else {
      const hip = v.hip as number | null;
      if (!hip) return err("Enter hips (needed for women).");
      if (w + hip <= n) return err("Check the measurements.");
      bf = 495 / (1.29579 - 0.35004 * Math.log10(w + hip - n) + 0.221 * Math.log10(h)) - 450;
    }
    const bands = v.sex === "male" ? [[6, "Essential fat"], [14, "Athletes"], [18, "Fitness"], [25, "Average"], [Infinity, "Above average"]] : [[14, "Essential fat"], [21, "Athletes"], [25, "Fitness"], [32, "Average"], [Infinity, "Above average"]];
    const band = bands.find(([max]) => bf < (max as number))![1] as string;
    return {
      primary: { label: "Body fat", value: `${num(bf, 1)}%`, sub: band },
      note: "The U.S. Navy tape method is usually within 3–4 percentage points of lab methods. Measure on bare skin, relaxed, and average three readings.",
    };
  },
  formulas: [
    "\\%BF_{\\text{men}} = \\frac{495}{1.0324 - 0.19077\\log_{10}(w-n) + 0.15456\\log_{10}h} - 450",
    "\\%BF_{\\text{women}} = \\frac{495}{1.29579 - 0.35004\\log_{10}(w+p-n) + 0.221\\log_{10}h} - 450",
  ],
  method: "Measurements in centimetres: h height, n neck, w waist, p hips. Category bands follow the American Council on Exercise.",
  disclaimer: "health",
  sources: [{ label: "Hodgdon & Beckett, Naval Health Research Center", url: "https://apps.dtic.mil/sti/citations/ADA143890" }],
};

export const idealWeight: CalcDef = {
  fields: [SEX, { key: "height", label: "Height", type: "number", default: 170, units: CM, min: 120, max: 230 }],
  compute: (v) => {
    const cm = v.height as number;
    const over = cm / 2.54 - 60;
    const male = v.sex === "male";
    const f = (m: [number, number], w: [number, number]) => (male ? m[0] + m[1] * over : w[0] + w[1] * over);
    const devine = f([50, 2.3], [45.5, 2.3]);
    const m = cm / 100;
    return {
      primary: { label: "Healthy weight range", value: `${num(18.5 * m * m, 1)} – ${num(24.9 * m * m, 1)} kg`, sub: `${num((18.5 * m * m) / 0.45359237, 0)} – ${num((24.9 * m * m) / 0.45359237, 0)} lb (BMI 18.5–24.9)` },
      rows: [
        { label: "Devine", value: `${num(devine, 1)} kg` },
        { label: "Robinson", value: `${num(f([52, 1.9], [49, 1.7]), 1)} kg` },
        { label: "Miller", value: `${num(f([56.2, 1.41], [53.1, 1.36]), 1)} kg` },
        { label: "Hamwi", value: `${num(f([48, 2.7], [45.5, 2.2]), 1)} kg` },
      ],
      note: over < 0 ? "The classic formulas were designed for people at least 152 cm (5 ft) tall; use the BMI range instead." : "Formulas give one number; the BMI range is a better guide because healthy weight varies with build and muscle.",
    };
  },
  formulas: ["\\text{Devine (men)} = 50 + 2.3\\,(h_{in} - 60)", "\\text{Healthy range} = 18.5h^2 \\text{ to } 24.9h^2 \\;(h \\text{ in m})"],
  disclaimer: "health",
  sources: [{ label: "WHO BMI classification", url: "https://www.who.int/data/gho/data/themes/topics/topic-details/GHO/body-mass-index" }],
};

const DAY = 86400000;
const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
const parseDay = (s: string) => {
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const dueDate: CalcDef = {
  fields: [
    { key: "method", label: "Based on", type: "select", default: "lmp", options: [["lmp", "First day of last period"], ["conception", "Conception date"], ["ivf", "IVF 5-day embryo transfer"]] },
    { key: "date", label: "Date", type: "date", default: "today" },
    { key: "cycle", label: "Cycle length", type: "number", default: 28, min: 20, max: 45, suffix: "days", help: "Only used with last period" },
    { key: "today", label: "Today", type: "date", default: "today" },
  ],
  compute: (v) => {
    const d = parseDay(v.date as string), t = parseDay(v.today as string);
    if (!d || !t) return err("Enter a valid date.");
    const offset = v.method === "lmp" ? 280 + ((v.cycle as number) - 28) : v.method === "conception" ? 266 : 261;
    const due = new Date(d.getTime() + offset * DAY);
    const lmp = new Date(due.getTime() - 280 * DAY);
    const days = Math.floor((t.getTime() - lmp.getTime()) / DAY);
    if (days < 0) return err("The date is in the future.");
    if (days > 300) return err("That date is more than 42 weeks ago.");
    const tri = days < 14 * 7 ? "First trimester" : days < 28 * 7 ? "Second trimester" : "Third trimester";
    return {
      primary: { label: "Estimated due date", value: fmtDate(due) },
      rows: [
        { label: "Pregnancy today", value: `${Math.floor(days / 7)} weeks ${days % 7} days` },
        { label: "Trimester", value: tri },
        { label: "Days to go", value: num(Math.max(0, Math.round((due.getTime() - t.getTime()) / DAY)), 0) },
        { label: "Second trimester starts", value: fmtDate(new Date(lmp.getTime() + 98 * DAY)) },
      ],
      note: "Only about 4% of babies arrive on the due date; most come within two weeks either side. An early ultrasound gives a more accurate date.",
    };
  },
  formulas: ["\\text{Due date} = \\text{LMP} + 280 \\text{ days} + (\\text{cycle} - 28)"],
  method: "Naegele's rule, adjusted for cycle length. From conception add 266 days; from a 5-day embryo transfer add 261 days.",
  disclaimer: "health",
  sources: [{ label: "ACOG Committee Opinion 700", url: "https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date" }],
};

export function egfrCkdEpi2021(scrMgDl: number, age: number, female: boolean) {
  const k = female ? 0.7 : 0.9, a = female ? -0.241 : -0.302;
  return 142 * Math.pow(Math.min(scrMgDl / k, 1), a) * Math.pow(Math.max(scrMgDl / k, 1), -1.2) * Math.pow(0.9938, age) * (female ? 1.012 : 1);
}

export const egfr: CalcDef = {
  fields: [
    { key: "scr", label: "Serum creatinine", type: "number", default: 0.9, units: [{ id: "mg", label: "mg/dL", factor: 1 }, { id: "umol", label: "µmol/L", factor: 1 / 88.42 }], min: 0.1, max: 30 },
    { key: "age", label: "Age", type: "number", default: 50, min: 18, max: 110, suffix: "yrs" },
    SEX,
  ],
  compute: (v) => {
    const e = egfrCkdEpi2021(v.scr as number, v.age as number, v.sex === "female");
    const stage = e >= 90 ? ["G1", "Normal or high"] : e >= 60 ? ["G2", "Mildly decreased"] : e >= 45 ? ["G3a", "Mildly to moderately decreased"] : e >= 30 ? ["G3b", "Moderately to severely decreased"] : e >= 15 ? ["G4", "Severely decreased"] : ["G5", "Kidney failure"];
    return {
      primary: { label: "eGFR", value: `${num(e, 0)} mL/min/1.73 m²`, sub: `Stage ${stage[0]}: ${stage[1]}` },
      note: "Chronic kidney disease is diagnosed from results over at least 3 months together with urine tests, not from one eGFR value. Discuss your results with your doctor.",
    };
  },
  formulas: ["eGFR = 142 \\cdot \\min(S_{cr}/\\kappa,1)^{\\alpha} \\cdot \\max(S_{cr}/\\kappa,1)^{-1.200} \\cdot 0.9938^{\\text{age}} \\cdot 1.012_{[\\text{female}]}"],
  method: "CKD-EPI 2021 creatinine equation (without race). κ is 0.7 for women and 0.9 for men; α is −0.241 for women and −0.302 for men. Creatinine in mg/dL (µmol/L ÷ 88.42).",
  disclaimer: "health",
  sources: [
    { label: "Inker et al., NEJM 2021", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2102953" },
    { label: "KDIGO stages", url: "https://kdigo.org/guidelines/ckd-evaluation-and-management/" },
  ],
};
