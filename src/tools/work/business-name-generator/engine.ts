export const BUSINESS_PREFIXES = [
  "Nova", "Apex", "Zenith", "Vertex", "Prism", "Quantum", "Fusion", "Catalyst",
  "Momentum", "Horizon", "Pinnacle", "Beacon", "Atlas", "Titan", "Oracle",
  "Vanguard", "Synergy", "Paragon", "Meridian", "Echelon", "Nexus", "Aether",
  "Crest", "Sol", "Vortex", "Pulse", "Lumina", "Terra", "Aura", "Stellar",
];

export const BUSINESS_SUFFIXES = [
  "Solutions", "Ventures", "Group", "Partners", "Labs", "Innovations",
  "Consulting", "Enterprises", "Holdings", "Capital", "Dynamics", "Systems",
  "Strategies", "Collective", "Alliance", "Network", "Hub", "Works", "HQ",
  "Flow", "Stack", "Sync", "Forge", "Craft", "Scale",
];

export const BUSINESS_INDUSTRIES: Record<string, string[]> = {
  "Tech & AI": ["Cloud", "Data", "Cyber", "Digital", "Code", "Dev", "AI", "Stack", "Byte", "Pixel", "Neural", "Algo", "Compute", "Matrix"],
  "Finance & Crypto": ["Wealth", "Capital", "Trust", "Equity", "Ledger", "Vault", "Coin", "Asset", "Yield", "Mint", "Fiscal", "Trade"],
  "Health & Wellness": ["Vital", "Care", "Med", "Wellness", "Cure", "Life", "Pulse", "Heal", "Bio", "Remedy", "Active", "Zen"],
  "Creative & Design": ["Studio", "Craft", "Design", "Canvas", "Forge", "Spark", "Flare", "Vision", "Pixel", "Form", "Palette", "Muse"],
  "Food & Beverage": ["Fresh", "Taste", "Harvest", "Grain", "Feast", "Bloom", "Root", "Sprout", "Bite", "Brew", "Artisan", "Crafter"],
  "Real Estate": ["Nest", "Haven", "Dwell", "Abode", "Estate", "Shelter", "Cornerstone", "Landmark", "Realty", "Proper", "Acre"],
  "Consulting & Agency": ["Advisory", "Strategix", "Counsel", "Guide", "Insight", "Clarity", "Venture", "Apex", "Omni", "Core"],
  "Sustainability & Eco": ["Eco", "Green", "Earth", "Leaf", "Solar", "Flora", "Bio", "Renew", "Sustain", "Pure", "Clean"],
  "E-commerce & Retail": ["Cart", "Market", "Store", "Shop", "Basket", "Trade", "Merchant", "Parcel", "Boutique", "Depot"],
};

export type NamingStyle = "all" | "compound" | "corporate" | "minimal" | "blended";

export function generateBusinessName(
  industry?: string,
  count: number = 16,
  keyword?: string,
  style: NamingStyle = "all"
): string[] {
  const names = new Set<string>();
  const industryWords =
    industry && BUSINESS_INDUSTRIES[industry]
      ? BUSINESS_INDUSTRIES[industry]
      : Object.values(BUSINESS_INDUSTRIES).flat();

  const userWord = keyword ? keyword.trim().replace(/[^a-zA-Z0-9]/g, "") : "";
  const cleanedKeyword = userWord
    ? userWord.charAt(0).toUpperCase() + userWord.slice(1).toLowerCase()
    : "";

  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  let attempts = 0;
  const maxAttempts = count * 10;

  while (names.size < count && attempts < maxAttempts) {
    attempts++;
    const prefix = pick(BUSINESS_PREFIXES);
    const word = cleanedKeyword || pick(industryWords);
    const suffix = pick(BUSINESS_SUFFIXES);

    let generated = "";

    const activeStyle = style === "all" ? pick(["compound", "corporate", "minimal", "blended"] as NamingStyle[]) : style;

    switch (activeStyle) {
      case "compound":
        // e.g. CloudPulse, NovaTech
        generated = `${prefix}${word}`;
        break;

      case "corporate":
        // e.g. Nova Solutions, Cloud Capital
        generated = `${word} ${suffix}`;
        break;

      case "minimal": {
        // e.g. Noviq, Pulsera, Zenitex
        const roots = [prefix, word];
        const root = pick(roots).toLowerCase();
        const endings = ["iq", "ex", "a", "ify", "ly", "ora", "ix", "o", "is"];
        generated = root.charAt(0).toUpperCase() + root.slice(1) + pick(endings);
        break;
      }

      case "blended": {
        // e.g. NovaFlow, PulseWorks
        generated = `${prefix} ${word}`;
        break;
      }

      default:
        generated = `${prefix} ${suffix}`;
    }

    if (generated && generated.length > 3) {
      names.add(generated);
    }
  }

  return Array.from(names);
}