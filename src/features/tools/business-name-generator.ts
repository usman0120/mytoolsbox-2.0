export const BUSINESS_PREFIXES = [
  "Nova", "Apex", "Zenith", "Vertex", "Prism", "Quantum", "Fusion", "Catalyst",
  "Momentum", "Horizon", "Pinnacle", "Beacon", "Atlas", "Titan", "Oracle",
  "Vanguard", "Synergy", "Paragon", "Meridian", "Echelon",
];

export const BUSINESS_SUFFIXES = [
  "Solutions", "Ventures", "Group", "Partners", "Labs", "Innovations",
  "Consulting", "Enterprises", "Holdings", "Capital", "Dynamics", "Systems",
  "Strategies", "Collective", "Alliance", "Network", "Hub", "Works",
];

export const BUSINESS_INDUSTRIES: Record<string, string[]> = {
  "Tech": ["Cloud", "Data", "Cyber", "Digital", "Code", "Dev", "AI", "Stack", "Byte", "Pixel"],
  "Finance": ["Wealth", "Capital", "Trust", "Equity", "Ledger", "Vault", "Coin", "Asset"],
  "Health": ["Vital", "Care", "Med", "Wellness", "Cure", "Life", "Pulse", "Heal"],
  "Creative": ["Studio", "Craft", "Design", "Canvas", "Forge", "Spark", "Flare", "Vision"],
  "Food": ["Fresh", "Taste", "Harvest", "Grain", "Feast", "Bloom", "Root", "Sprout"],
  "Real Estate": ["Nest", "Haven", "Dwell", "Abode", "Estate", "Shelter", "Cornerstone", "Landmark"],
};

export function generateBusinessName(industry?: string, count: number = 10): string[] {
  const names: string[] = [];
  const words = industry && BUSINESS_INDUSTRIES[industry]
    ? BUSINESS_INDUSTRIES[industry]
    : Object.values(BUSINESS_INDUSTRIES).flat();

  for (let i = 0; i < count; i++) {
    const prefix = BUSINESS_PREFIXES[Math.floor(Math.random() * BUSINESS_PREFIXES.length)];
    const word = words[Math.floor(Math.random() * words.length)];
    const suffix = BUSINESS_SUFFIXES[Math.floor(Math.random() * BUSINESS_SUFFIXES.length)];
    const patterns = [
      `${prefix} ${suffix}`,
      `${word} ${suffix}`,
      `${prefix} ${word}`,
      `${prefix}${word}`,
      `${word}${suffix}`,
    ];
    names.push(patterns[Math.floor(Math.random() * patterns.length)]);
  }

  return [...new Set(names)];
}