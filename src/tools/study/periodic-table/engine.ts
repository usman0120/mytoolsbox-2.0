// Periodic table data. Positions, blocks and electron configurations are derived from the atomic number.
import { ATOMIC } from "@/lib/calc/defs/science";

const NAMES =
  "H Hydrogen,He Helium,Li Lithium,Be Beryllium,B Boron,C Carbon,N Nitrogen,O Oxygen,F Fluorine,Ne Neon,Na Sodium,Mg Magnesium,Al Aluminium,Si Silicon,P Phosphorus,S Sulfur,Cl Chlorine,Ar Argon,K Potassium,Ca Calcium,Sc Scandium,Ti Titanium,V Vanadium,Cr Chromium,Mn Manganese,Fe Iron,Co Cobalt,Ni Nickel,Cu Copper,Zn Zinc,Ga Gallium,Ge Germanium,As Arsenic,Se Selenium,Br Bromine,Kr Krypton,Rb Rubidium,Sr Strontium,Y Yttrium,Zr Zirconium,Nb Niobium,Mo Molybdenum,Tc Technetium,Ru Ruthenium,Rh Rhodium,Pd Palladium,Ag Silver,Cd Cadmium,In Indium,Sn Tin,Sb Antimony,Te Tellurium,I Iodine,Xe Xenon,Cs Caesium,Ba Barium,La Lanthanum,Ce Cerium,Pr Praseodymium,Nd Neodymium,Pm Promethium,Sm Samarium,Eu Europium,Gd Gadolinium,Tb Terbium,Dy Dysprosium,Ho Holmium,Er Erbium,Tm Thulium,Yb Ytterbium,Lu Lutetium,Hf Hafnium,Ta Tantalum,W Tungsten,Re Rhenium,Os Osmium,Ir Iridium,Pt Platinum,Au Gold,Hg Mercury,Tl Thallium,Pb Lead,Bi Bismuth,Po Polonium,At Astatine,Rn Radon,Fr Francium,Ra Radium,Ac Actinium,Th Thorium,Pa Protactinium,U Uranium,Np Neptunium,Pu Plutonium,Am Americium,Cm Curium,Bk Berkelium,Cf Californium,Es Einsteinium,Fm Fermium,Md Mendelevium,No Nobelium,Lr Lawrencium,Rf Rutherfordium,Db Dubnium,Sg Seaborgium,Bh Bohrium,Hs Hassium,Mt Meitnerium,Ds Darmstadtium,Rg Roentgenium,Cn Copernicium,Nh Nihonium,Fl Flerovium,Mc Moscovium,Lv Livermorium,Ts Tennessine,Og Oganesson";
const HEAVY: Record<string, number> = { Md: 258, No: 259, Lr: 266, Rf: 267, Db: 268, Sg: 269, Bh: 270, Hs: 277, Mt: 278, Ds: 281, Rg: 282, Cn: 285, Nh: 286, Fl: 289, Mc: 290, Lv: 293, Ts: 294, Og: 294 };

export type Category =
  | "alkali" | "alkaline-earth" | "transition" | "post-transition" | "metalloid" | "nonmetal" | "halogen" | "noble-gas" | "lanthanide" | "actinide";

export const CATEGORY_LABEL: Record<Category, string> = {
  alkali: "Alkali metal", "alkaline-earth": "Alkaline earth metal", transition: "Transition metal", "post-transition": "Post-transition metal",
  metalloid: "Metalloid", nonmetal: "Reactive nonmetal", halogen: "Halogen", "noble-gas": "Noble gas", lanthanide: "Lanthanide", actinide: "Actinide",
};

export interface Element {
  z: number;
  symbol: string;
  name: string;
  mass: number;
  period: number;
  /** 1–18, or null for the f-block rows. */
  group: number | null;
  block: "s" | "p" | "d" | "f";
  category: Category;
  config: string;
  /** Grid position for the table layout (1-based). Lanthanides/actinides sit in rows 9–10. */
  row: number;
  col: number;
}

const PERIOD_END = [2, 10, 18, 36, 54, 86, 118];
const NOBLE: [number, string][] = [[2, "He"], [10, "Ne"], [18, "Ar"], [36, "Kr"], [54, "Xe"], [86, "Rn"]];
const ORDER = ["1s", "2s", "2p", "3s", "3p", "4s", "3d", "4p", "5s", "4d", "5p", "6s", "4f", "5d", "6p", "7s", "5f", "6d", "7p"];
const CAP: Record<string, number> = { s: 2, p: 6, d: 10, f: 14 };
// Ground-state exceptions to the aufbau order (valence part after the noble-gas core).
const EXCEPTIONS: Record<number, string> = {
  24: "3d5 4s1", 29: "3d10 4s1", 41: "4d4 5s1", 42: "4d5 5s1", 44: "4d7 5s1", 45: "4d8 5s1", 46: "4d10", 47: "4d10 5s1",
  57: "5d1 6s2", 58: "4f1 5d1 6s2", 64: "4f7 5d1 6s2", 78: "4f14 5d9 6s1", 79: "4f14 5d10 6s1",
  89: "6d1 7s2", 90: "6d2 7s2", 91: "5f2 6d1 7s2", 92: "5f3 6d1 7s2", 93: "5f4 6d1 7s2", 96: "5f7 6d1 7s2", 103: "5f14 7s2 7p1",
};
const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const sup = (s: string) => s.replace(/(\d[spdf])(\d+)/g, (_, o, n: string) => o + [...n].map((d) => SUP[+d]).join(""));

export function electronConfig(z: number): string {
  const core = [...NOBLE].reverse().find(([n]) => n < z);
  let valence = EXCEPTIONS[z];
  if (!valence) {
    let left = z;
    const parts: string[] = [];
    for (const orb of ORDER) {
      if (left <= 0) break;
      const n = Math.min(left, CAP[orb[1]]);
      parts.push(`${orb}${n}`);
      left -= n;
    }
    const coreCount = core?.[0] ?? 0;
    let skip = coreCount;
    const rest: string[] = [];
    for (const p of parts) {
      const n = Number(p.slice(2));
      if (skip >= n) skip -= n;
      else rest.push(p);
    }
    // Conventional order: by shell, then s, p, d, f.
    valence = rest.sort((a, b) => Number(a[0]) - Number(b[0]) || "spdf".indexOf(a[1]) - "spdf".indexOf(b[1])).join(" ");
  }
  return sup(core ? `[${core[1]}] ${valence}` : valence);
}

function position(z: number) {
  const period = PERIOD_END.findIndex((e) => z <= e) + 1;
  const start = period === 1 ? 1 : PERIOD_END[period - 2] + 1;
  const i = z - start;
  if (period === 1) return { period, group: z === 1 ? 1 : 18, f: null };
  if (period <= 3) return { period, group: i < 2 ? i + 1 : i + 11, f: null };
  if (period <= 5) return { period, group: i + 1, f: null };
  if (i < 2) return { period, group: i + 1, f: null };
  if (i <= 16) return { period, group: null, f: i - 2 }; // La–Lu, Ac–Lr
  return { period, group: i - 13, f: null };
}

const METALLOIDS = new Set([5, 14, 32, 33, 51, 52]);
const NONMETALS = new Set([1, 6, 7, 8, 15, 16, 34]);

function category(z: number, group: number | null, period: number): Category {
  if (group === null) return period === 6 ? "lanthanide" : "actinide";
  if (METALLOIDS.has(z)) return "metalloid";
  if (NONMETALS.has(z)) return "nonmetal";
  if (group === 1) return "alkali";
  if (group === 2) return "alkaline-earth";
  if (group === 17) return "halogen";
  if (group === 18) return "noble-gas";
  if (group >= 3 && group <= 12) return "transition";
  return "post-transition";
}

export const ELEMENTS: Element[] = NAMES.split(",").map((entry, k) => {
  const [symbol, name] = entry.split(" ");
  const z = k + 1;
  const { period, group, f } = position(z);
  const block: Element["block"] = f !== null ? "f" : group! <= 2 || z === 2 ? "s" : group! >= 13 ? "p" : "d";
  return {
    z, symbol, name, mass: ATOMIC[symbol] ?? HEAVY[symbol], period, group, block,
    category: category(z, group, period),
    config: electronConfig(z),
    row: f !== null ? period + 3 : period,
    col: f !== null ? f + 3 : group!,
  };
});

export function findElement(q: string): Element[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return ELEMENTS.filter((e) => e.symbol.toLowerCase() === s || e.name.toLowerCase().startsWith(s) || String(e.z) === s);
}
