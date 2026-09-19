// ---------------------------------------------------------------------------
// Farming Engine — all calculator logic for the Farmer AI platform
// ---------------------------------------------------------------------------

// ===========================================================================
// Types
// ===========================================================================

export interface CropResult {
  estimatedYield: number;        // kg or tons
  yieldPerUnit: number;         // kg per unit area
  totalRevenue: number;         // in currency
  harvestDate: string;          // estimated harvest date
  growingDays: number;
  recommendations: string[];
}

export interface FertilizerResult {
  nutrientNeeds: { n: number; p: number; k: number }; // kg per hectare
  fertilizerAmount: number;     // kg total
  costEstimate: number;
  applicationSchedule: string[];
  organicAlternatives: string[];
}

export interface LandAreaResult {
  areaInSqMeters: number;
  areaInHectares: number;
  areaInAcres: number;
  perimeter: number;            // meters
  plantableArea: number;        // accounting for paths/borders
  estimatedPlants: number;      // based on spacing
}

export interface YieldResult {
  expectedYield: number;        // total kg
  yieldPerHectare: number;      // kg/ha
  yieldPerAcre: number;         // kg/acre
  efficiency: number;           // percentage vs optimal
  improvementTips: string[];
}

export interface IrrigationResult {
  dailyWaterNeed: number;       // liters
  weeklyWaterNeed: number;      // liters
  flowRateRequired: number;     // liters/hour
  irrigationDuration: number;   // hours per session
  frequency: string;            // e.g. "Every 2 days"
  waterSourceAdvice: string[];
}

export interface PlantingPlan {
  sowingDate: string;
  transplantDate: string;
  firstHarvestDate: string;
  growingSeason: string;
  companionPlants: string[];
  avoidPlants: string[];
  careSchedule: { week: number; task: string }[];
}

export interface CostProfitResult {
  totalCost: number;
  totalRevenue: number;
  netProfit: number;
  profitPerUnit: number;
  roi: number;                  // percentage
  breakEvenYield: number;       // kg needed to break even
  costBreakdown: { category: string; amount: number; percentage: number }[];
  sensitivityAnalysis: { scenario: string; profit: number }[];
}

export interface WeatherAdvice {
  suitable: boolean;
  riskLevel: "low" | "medium" | "high";
  recommendations: string[];
  bestActivities: string[];
  avoidActivities: string[];
  soilMoistureAdvice: string;
}

// ===========================================================================
// Crop Data
// ===========================================================================

interface CropData {
  name: string;
  growingDays: number;
  yieldPerHectare: number;      // kg
  waterNeedMmPerDay: number;    // mm
  seedRateKgPerHa: number;
  fertilizerN: number;          // kg/ha
  fertilizerP: number;
  fertilizerK: number;
  spacingCm: number;            // plant spacing
  rowSpacingCm: number;
  pricePerKg: number;           // market price
  costPerHa: number;            // cultivation cost
  companionPlants: string[];
  avoidPlants: string[];
  season: "kharif" | "rabi" | "zaid" | "year-round";
}

const CROP_DATABASE: Record<string, CropData> = {
  wheat: {
    name: "Wheat",
    growingDays: 120,
    yieldPerHectare: 4500,
    waterNeedMmPerDay: 4,
    seedRateKgPerHa: 100,
    fertilizerN: 120,
    fertilizerP: 60,
    fertilizerK: 40,
    spacingCm: 22,
    rowSpacingCm: 22,
    pricePerKg: 25,
    costPerHa: 35000,
    companionPlants: ["Mustard", "Chickpea", "Lentil"],
    avoidPlants: ["Maize", "Barley"],
    season: "rabi",
  },
  rice: {
    name: "Rice",
    growingDays: 150,
    yieldPerHectare: 6000,
    waterNeedMmPerDay: 8,
    seedRateKgPerHa: 60,
    fertilizerN: 100,
    fertilizerP: 50,
    fertilizerK: 50,
    spacingCm: 20,
    rowSpacingCm: 15,
    pricePerKg: 22,
    costPerHa: 40000,
    companionPlants: ["Soybean", "Mung Bean"],
    avoidPlants: ["Maize", "Sorghum"],
    season: "kharif",
  },
  maize: {
    name: "Maize (Corn)",
    growingDays: 100,
    yieldPerHectare: 5500,
    waterNeedMmPerDay: 5,
    seedRateKgPerHa: 20,
    fertilizerN: 150,
    fertilizerP: 60,
    fertilizerK: 40,
    spacingCm: 25,
    rowSpacingCm: 60,
    pricePerKg: 20,
    costPerHa: 30000,
    companionPlants: ["Beans", "Squash", "Pumpkin"],
    avoidPlants: ["Tomato", "Celery"],
    season: "kharif",
  },
  potato: {
    name: "Potato",
    growingDays: 90,
    yieldPerHectare: 25000,
    waterNeedMmPerDay: 3,
    seedRateKgPerHa: 2500,
    fertilizerN: 150,
    fertilizerP: 100,
    fertilizerK: 150,
    spacingCm: 30,
    rowSpacingCm: 60,
    pricePerKg: 15,
    costPerHa: 60000,
    companionPlants: ["Beans", "Corn", "Cabbage"],
    avoidPlants: ["Tomato", "Cucumber", "Pumpkin"],
    season: "rabi",
  },
  tomato: {
    name: "Tomato",
    growingDays: 80,
    yieldPerHectare: 30000,
    waterNeedMmPerDay: 5,
    seedRateKgPerHa: 0.4,
    fertilizerN: 120,
    fertilizerP: 80,
    fertilizerK: 100,
    spacingCm: 50,
    rowSpacingCm: 75,
    pricePerKg: 30,
    costPerHa: 80000,
    companionPlants: ["Basil", "Marigold", "Onion", "Carrot"],
    avoidPlants: ["Potato", "Fennel", "Corn"],
    season: "year-round",
  },
  cotton: {
    name: "Cotton",
    growingDays: 180,
    yieldPerHectare: 2000,
    waterNeedMmPerDay: 6,
    seedRateKgPerHa: 15,
    fertilizerN: 100,
    fertilizerP: 50,
    fertilizerK: 50,
    spacingCm: 60,
    rowSpacingCm: 90,
    pricePerKg: 65,
    costPerHa: 50000,
    companionPlants: ["Sunflower", "Soybean"],
    avoidPlants: ["Okra", "Sorghum"],
    season: "kharif",
  },
  sugarcane: {
    name: "Sugarcane",
    growingDays: 330,
    yieldPerHectare: 80000,
    waterNeedMmPerDay: 7,
    seedRateKgPerHa: 6000,
    fertilizerN: 250,
    fertilizerP: 100,
    fertilizerK: 150,
    spacingCm: 30,
    rowSpacingCm: 90,
    pricePerKg: 3.5,
    costPerHa: 120000,
    companionPlants: ["Potato", "Onion"],
    avoidPlants: ["Cotton", "Sunflower"],
    season: "year-round",
  },
  soybean: {
    name: "Soybean",
    growingDays: 100,
    yieldPerHectare: 2500,
    waterNeedMmPerDay: 4,
    seedRateKgPerHa: 70,
    fertilizerN: 20,
    fertilizerP: 60,
    fertilizerK: 40,
    spacingCm: 5,
    rowSpacingCm: 45,
    pricePerKg: 45,
    costPerHa: 25000,
    companionPlants: ["Corn", "Sorghum"],
    avoidPlants: ["Sunflower"],
    season: "kharif",
  },
  onion: {
    name: "Onion",
    growingDays: 120,
    yieldPerHectare: 20000,
    waterNeedMmPerDay: 4,
    seedRateKgPerHa: 8,
    fertilizerN: 100,
    fertilizerP: 50,
    fertilizerK: 50,
    spacingCm: 15,
    rowSpacingCm: 15,
    pricePerKg: 25,
    costPerHa: 55000,
    companionPlants: ["Carrot", "Beetroot", "Chamomile"],
    avoidPlants: ["Beans", "Peas"],
    season: "rabi",
  },
};

const CROP_LIST = Object.keys(CROP_DATABASE);

// ===========================================================================
// 1. Crop Calculator
// ===========================================================================

export function calculateCrop(
  cropName: string,
  areaInHectares: number,
  soilQuality: "poor" | "average" | "good" | "excellent" = "average"
): CropResult {
  const crop = CROP_DATABASE[cropName.toLowerCase()];
  if (!crop) {
    return {
      estimatedYield: 0,
      yieldPerUnit: 0,
      totalRevenue: 0,
      harvestDate: "Unknown crop",
      growingDays: 0,
      recommendations: [`Crop "${cropName}" not found. Available: ${CROP_LIST.join(", ")}`],
    };
  }

  const qualityMultiplier = { poor: 0.6, average: 0.85, good: 1.0, excellent: 1.2 };
  const multiplier = qualityMultiplier[soilQuality];

  const estimatedYield = crop.yieldPerHectare * areaInHectares * multiplier;
  const totalRevenue = estimatedYield * crop.pricePerKg;

  const today = new Date();
  const harvestDate = new Date(today);
  harvestDate.setDate(harvestDate.getDate() + crop.growingDays);

  const recommendations: string[] = [];
  if (soilQuality === "poor") {
    recommendations.push("Apply organic compost (10 tons/ha) to improve soil structure");
    recommendations.push("Consider green manuring before planting");
  }
  if (soilQuality === "average") {
    recommendations.push("Apply recommended NPK fertilizer for optimal yield");
    recommendations.push("Use mulch to retain soil moisture");
  }
  if (crop.waterNeedMmPerDay > 6) {
    recommendations.push("Install drip irrigation to manage high water requirements");
  }
  recommendations.push(`Plant spacing: ${crop.spacingCm}cm × ${crop.rowSpacingCm}cm`);

  return {
    estimatedYield: Math.round(estimatedYield),
    yieldPerUnit: Math.round(crop.yieldPerHectare * multiplier),
    totalRevenue: Math.round(totalRevenue),
    harvestDate: harvestDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    growingDays: crop.growingDays,
    recommendations,
  };
}

// ===========================================================================
// 2. Fertilizer Calculator
// ===========================================================================

export function calculateFertilizer(
  cropName: string,
  areaInHectares: number,
  soilTestN?: number,
  soilTestP?: number,
  soilTestK?: number
): FertilizerResult {
  const crop = CROP_DATABASE[cropName.toLowerCase()];
  if (!crop) {
    return {
      nutrientNeeds: { n: 0, p: 0, k: 0 },
      fertilizerAmount: 0,
      costEstimate: 0,
      applicationSchedule: [`Crop "${cropName}" not found.`],
      organicAlternatives: [],
    };
  }

  // Adjust based on soil test (if provided)
  const soilFactor = soilTestN !== undefined ? Math.max(0, 1 - soilTestN / crop.fertilizerN) : 1;
  const n = Math.round(crop.fertilizerN * areaInHectares * soilFactor);
  const p = Math.round(crop.fertilizerP * areaInHectares * (soilTestP !== undefined ? Math.max(0, 1 - soilTestP / crop.fertilizerP) : 1));
  const k = Math.round(crop.fertilizerK * areaInHectares * (soilTestK !== undefined ? Math.max(0, 1 - soilTestK / crop.fertilizerK) : 1));

  const totalNutrients = n + p + k;
  const fertilizerAmount = Math.round(totalNutrients * 2.5); // Convert to commercial fertilizer
  const costEstimate = Math.round(fertilizerAmount * 30); // ~30 currency per kg

  const schedule: string[] = [];
  if (crop.growingDays > 120) {
    schedule.push(`Basal dose at sowing: ${Math.round(n * 0.5)}kg N, ${p}kg P, ${Math.round(k * 0.5)}kg K`);
    schedule.push(`Top dressing at 30 days: ${Math.round(n * 0.3)}kg N`);
    schedule.push(`Top dressing at 60 days: ${Math.round(n * 0.2)}kg N, ${Math.round(k * 0.5)}kg K`);
  } else {
    schedule.push(`Basal dose at sowing: ${Math.round(n * 0.6)}kg N, ${p}kg P, ${Math.round(k * 0.6)}kg K`);
    schedule.push(`Top dressing at 25-30 days: ${Math.round(n * 0.4)}kg N, ${Math.round(k * 0.4)}kg K`);
  }

  const organicAlternatives = [
    `Farmyard manure: ${Math.round(totalNutrients * 20)}kg (composted cow dung)`,
    `Vermicompost: ${Math.round(totalNutrients * 8)}kg`,
    `Neem cake: ${Math.round(totalNutrients * 5)}kg (also acts as natural pesticide)`,
    `Bone meal for phosphorus: ${Math.round(p * 4)}kg`,
    `Wood ash for potassium: ${Math.round(k * 3)}kg`,
  ];

  return {
    nutrientNeeds: { n, p, k },
    fertilizerAmount,
    costEstimate,
    applicationSchedule: schedule,
    organicAlternatives,
  };
}

// ===========================================================================
// 3. Land Area Calculator
// ===========================================================================

export function calculateLandArea(
  shape: "rectangle" | "square" | "triangle" | "circle" | "trapezoid",
  dimensions: number[],
  pathWidth: number = 0.5,
  cropName?: string
): LandAreaResult {
  let areaSqM = 0;
  let perimeter = 0;

  switch (shape) {
    case "rectangle":
      areaSqM = dimensions[0] * dimensions[1];
      perimeter = 2 * (dimensions[0] + dimensions[1]);
      break;
    case "square":
      areaSqM = dimensions[0] * dimensions[0];
      perimeter = 4 * dimensions[0];
      break;
    case "triangle":
      areaSqM = 0.5 * dimensions[0] * dimensions[1]; // base * height / 2
      perimeter = dimensions[0] + dimensions[1] + Math.sqrt(dimensions[0] ** 2 + dimensions[1] ** 2);
      break;
    case "circle":
      areaSqM = Math.PI * dimensions[0] * dimensions[0];
      perimeter = 2 * Math.PI * dimensions[0];
      break;
    case "trapezoid":
      areaSqM = 0.5 * (dimensions[0] + dimensions[1]) * dimensions[2]; // (a+b)/2 * h
      perimeter = dimensions[0] + dimensions[1] + dimensions[2] * 2; // approximate
      break;
  }

  // Account for paths (reduce plantable area by ~8% for paths)
  const pathFactor = pathWidth > 0 ? 0.92 : 1;
  const plantableArea = areaSqM * pathFactor;

  // Estimate number of plants
  let estimatedPlants = 0;
  if (cropName) {
    const crop = CROP_DATABASE[cropName.toLowerCase()];
    if (crop) {
      const plantsPerSqM = 1 / ((crop.spacingCm / 100) * (crop.rowSpacingCm / 100));
      estimatedPlants = Math.round(plantableArea * plantsPerSqM);
    }
  }

  return {
    areaInSqMeters: Math.round(areaSqM * 100) / 100,
    areaInHectares: Math.round(areaSqM / 10000 * 1000) / 1000,
    areaInAcres: Math.round(areaSqM / 4046.86 * 1000) / 1000,
    perimeter: Math.round(perimeter * 100) / 100,
    plantableArea: Math.round(plantableArea * 100) / 100,
    estimatedPlants,
  };
}

// ===========================================================================
// 4. Yield Calculator
// ===========================================================================

export function calculateYield(
  cropName: string,
  areaInHectares: number,
  actualHarvestKg: number,
  irrigation: "rainfed" | "partial" | "full" = "full",
  pestDamage: "none" | "minor" | "moderate" | "severe" = "none"
): YieldResult {
  const crop = CROP_DATABASE[cropName.toLowerCase()];
  if (!crop) {
    return {
      expectedYield: 0,
      yieldPerHectare: 0,
      yieldPerAcre: 0,
      efficiency: 0,
      improvementTips: [`Crop "${cropName}" not found.`],
    };
  }

  const irrigationFactor = { rainfed: 0.5, partial: 0.75, full: 1.0 };
  const pestFactor = { none: 1.0, minor: 0.85, moderate: 0.65, severe: 0.4 };

  const optimalYield = crop.yieldPerHectare * areaInHectares * irrigationFactor[irrigation] * pestFactor[pestDamage];
  const yieldPerHa = actualHarvestKg / areaInHectares;
  const efficiency = (actualHarvestKg / optimalYield) * 100;

  const tips: string[] = [];
  if (irrigation === "rainfed") {
    tips.push("Consider installing drip or sprinkler irrigation for 50-100% yield improvement");
  }
  if (pestDamage !== "none") {
    tips.push("Implement Integrated Pest Management (IPM) with regular scouting");
    tips.push("Use pest-resistant varieties and crop rotation");
  }
  if (efficiency < 70) {
    tips.push("Soil testing recommended — possible nutrient deficiency");
    tips.push("Check for soil-borne diseases and nematodes");
  }
  if (efficiency > 95) {
    tips.push("Excellent yield! Consider expanding area or trying higher-value varieties");
  }

  return {
    expectedYield: Math.round(optimalYield),
    yieldPerHectare: Math.round(yieldPerHa),
    yieldPerAcre: Math.round(yieldPerHa * 0.404686),
    efficiency: Math.round(efficiency * 10) / 10,
    improvementTips: tips,
  };
}

// ===========================================================================
// 5. Irrigation Calculator
// ===========================================================================

export function calculateIrrigation(
  cropName: string,
  areaInHectares: number,
  soilType: "sandy" | "loamy" | "clay" = "loamy",
  season: "summer" | "winter" | "monsoon" = "summer"
): IrrigationResult {
  const crop = CROP_DATABASE[cropName.toLowerCase()];
  if (!crop) {
    return {
      dailyWaterNeed: 0,
      weeklyWaterNeed: 0,
      flowRateRequired: 0,
      irrigationDuration: 0,
      frequency: "Unknown",
      waterSourceAdvice: [`Crop "${cropName}" not found.`],
    };
  }

  const seasonFactor = { summer: 1.3, winter: 0.7, monsoon: 0.5 };
  const soilFactor = { sandy: 1.2, loamy: 1.0, clay: 0.8 };

  const adjustedWaterNeed = crop.waterNeedMmPerDay * seasonFactor[season] * soilFactor[soilType];
  const dailyWaterNeed = Math.round(adjustedWaterNeed * areaInHectares * 10000); // mm to liters
  const weeklyWaterNeed = dailyWaterNeed * 7;

  // Assume 6 hours of irrigation per session
  const flowRateRequired = Math.round(dailyWaterNeed / 6);
  const irrigationDuration = 6;

  let frequency: string;
  if (soilType === "sandy") frequency = "Every day";
  else if (soilType === "loamy") frequency = "Every 2 days";
  else frequency = "Every 3 days";

  const waterSourceAdvice: string[] = [];
  if (dailyWaterNeed > 50000) {
    waterSourceAdvice.push("Consider borewell or canal irrigation for large water needs");
    waterSourceAdvice.push("Rainwater harvesting can supplement irrigation");
  } else {
    waterSourceAdvice.push("Dug well or tube well should be sufficient");
  }
  if (soilType === "sandy") {
    waterSourceAdvice.push("Sandy soil drains quickly — use frequent light irrigation");
  }
  waterSourceAdvice.push("Mulching can reduce water evaporation by 30-40%");

  return {
    dailyWaterNeed,
    weeklyWaterNeed,
    flowRateRequired,
    irrigationDuration,
    frequency,
    waterSourceAdvice,
  };
}

// ===========================================================================
// 6. Planting Planner
// ===========================================================================

export function planPlanting(
  cropName: string,
  plantingDate?: string
): PlantingPlan {
  const crop = CROP_DATABASE[cropName.toLowerCase()];
  if (!crop) {
    return {
      sowingDate: "Unknown",
      transplantDate: "Unknown",
      firstHarvestDate: "Unknown",
      growingSeason: "Unknown",
      companionPlants: [],
      avoidPlants: [],
      careSchedule: [],
    };
  }

  const startDate = plantingDate ? new Date(plantingDate) : new Date();
  const transplantDate = new Date(startDate);
  transplantDate.setDate(transplantDate.getDate() + 25); // ~25 days for seedlings

  const harvestDate = new Date(startDate);
  harvestDate.setDate(harvestDate.getDate() + crop.growingDays);

  // Generate care schedule
  const careSchedule: { week: number; task: string }[] = [];
  const totalWeeks = Math.ceil(crop.growingDays / 7);

  careSchedule.push({ week: 1, task: "Prepare soil: plow, level, add basal fertilizer" });
  careSchedule.push({ week: 1, task: `Sow seeds at ${crop.spacingCm}cm × ${crop.rowSpacingCm}cm spacing` });
  careSchedule.push({ week: 2, task: "First irrigation after sowing" });
  careSchedule.push({ week: 3, task: "Weeding and thinning if needed" });

  if (totalWeeks > 4) {
    careSchedule.push({ week: 4, task: "Apply first top dressing of nitrogen fertilizer" });
  }
  if (totalWeeks > 6) {
    careSchedule.push({ week: 6, task: "Monitor for pests: aphids, caterpillars, fungal spots" });
  }
  if (totalWeeks > 8) {
    careSchedule.push({ week: 8, task: "Second top dressing + earthing up if applicable" });
  }
  if (totalWeeks > 10) {
    careSchedule.push({ week: 10, task: "Continue pest monitoring; apply neem oil if needed" });
  }
  if (totalWeeks > 12) {
    careSchedule.push({ week: 12, task: "Reduce irrigation as crop approaches maturity" });
  }

  const lastWeek = totalWeeks;
  careSchedule.push({ week: lastWeek, task: "Harvest when crop reaches maturity" });

  return {
    sowingDate: startDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    transplantDate: transplantDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    firstHarvestDate: harvestDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    growingSeason: crop.season.charAt(0).toUpperCase() + crop.season.slice(1),
    companionPlants: crop.companionPlants,
    avoidPlants: crop.avoidPlants,
    careSchedule,
  };
}

// ===========================================================================
// 7. Cost & Profit Calculator
// ===========================================================================

export function calculateCostProfit(
  cropName: string,
  areaInHectares: number,
  actualYieldKg: number,
  marketPricePerKg?: number,
  additionalCosts?: { category: string; amount: number }[]
): CostProfitResult {
  const crop = CROP_DATABASE[cropName.toLowerCase()];
  if (!crop) {
    return {
      totalCost: 0,
      totalRevenue: 0,
      netProfit: 0,
      profitPerUnit: 0,
      roi: 0,
      breakEvenYield: 0,
      costBreakdown: [],
      sensitivityAnalysis: [],
    };
  }

  const price = marketPricePerKg ?? crop.pricePerKg;
  const baseCost = crop.costPerHa * areaInHectares;

  // Cost breakdown
  const breakdown = [
    { category: "Seeds/Planting Material", amount: Math.round(crop.seedRateKgPerHa * areaInHectares * price * 0.3), percentage: 0 },
    { category: "Fertilizers", amount: Math.round((crop.fertilizerN + crop.fertilizerP + crop.fertilizerK) * areaInHectares * 30), percentage: 0 },
    { category: "Irrigation", amount: Math.round(crop.waterNeedMmPerDay * crop.growingDays * areaInHectares * 5), percentage: 0 },
    { category: "Labor", amount: Math.round(baseCost * 0.35), percentage: 0 },
    { category: "Pesticides", amount: Math.round(baseCost * 0.1), percentage: 0 },
    { category: "Land Preparation", amount: Math.round(baseCost * 0.15), percentage: 0 },
  ];

  if (additionalCosts) {
    breakdown.push(...additionalCosts.map(c => ({ ...c, percentage: 0 })));
  }

  const totalCost = breakdown.reduce((sum, c) => sum + c.amount, 0);
  breakdown.forEach(c => { c.percentage = Math.round((c.amount / totalCost) * 100); });

  const totalRevenue = actualYieldKg * price;
  const netProfit = totalRevenue - totalCost;
  const roi = (netProfit / totalCost) * 100;
  const breakEvenYield = Math.round(totalCost / price);

  // Sensitivity analysis
  const sensitivityAnalysis = [
    { scenario: "Best case (+20% price, +10% yield)", profit: Math.round(actualYieldKg * 1.1 * price * 1.2 - totalCost) },
    { scenario: "Expected (current)", profit: Math.round(netProfit) },
    { scenario: "Worst case (-20% price, -30% yield)", profit: Math.round(actualYieldKg * 0.7 * price * 0.8 - totalCost) },
    { scenario: "Price drop 15%", profit: Math.round(actualYieldKg * price * 0.85 - totalCost) },
    { scenario: "Yield loss 25% (pest/disease)", profit: Math.round(actualYieldKg * 0.75 * price - totalCost) },
  ];

  return {
    totalCost: Math.round(totalCost),
    totalRevenue: Math.round(totalRevenue),
    netProfit: Math.round(netProfit),
    profitPerUnit: Math.round((netProfit / actualYieldKg) * 100) / 100,
    roi: Math.round(roi * 10) / 10,
    breakEvenYield,
    costBreakdown: breakdown,
    sensitivityAnalysis,
  };
}

// ===========================================================================
// 8. Weather Planning
// ===========================================================================

export function analyzeWeather(
  cropName: string,
  temperature: number,       // Celsius
  humidity: number,          // percentage
  rainfallMm: number,        // mm in last 24h
  windSpeedKmph: number,
  forecast: "sunny" | "cloudy" | "rainy" | "stormy" = "sunny"
): WeatherAdvice {
  const crop = CROP_DATABASE[cropName.toLowerCase()];

  let riskLevel: WeatherAdvice["riskLevel"] = "low";
  const recommendations: string[] = [];
  const bestActivities: string[] = [];
  const avoidActivities: string[] = [];

  // Temperature analysis
  if (temperature > 40) {
    riskLevel = "high";
    recommendations.push("Extreme heat stress risk — increase irrigation frequency");
    avoidActivities.push("Fertilizer application (may burn crops)");
    avoidActivities.push("Pesticide spraying (may evaporate quickly)");
  } else if (temperature > 35) {
    riskLevel = "medium";
    recommendations.push("High temperature — ensure adequate soil moisture");
    bestActivities.push("Early morning or evening irrigation");
  } else if (temperature < 5) {
    riskLevel = "high";
    recommendations.push("Frost risk — cover sensitive crops or use sprinkler irrigation");
    avoidActivities.push("Pruning or transplanting");
  } else {
    bestActivities.push("Field operations: plowing, weeding, harvesting");
  }

  // Humidity analysis
  if (humidity > 85) {
    if (riskLevel !== "high") riskLevel = "medium";
    recommendations.push("High humidity increases fungal disease risk — ensure good air circulation");
    recommendations.push("Monitor for powdery mildew, blight, and rust");
  } else if (humidity < 30) {
    recommendations.push("Low humidity — increase irrigation and consider mulching");
  }

  // Rainfall analysis
  if (rainfallMm > 50) {
    riskLevel = "high";
    recommendations.push("Heavy rainfall — ensure proper drainage to prevent waterlogging");
    avoidActivities.push("Irrigation (soil already saturated)");
    avoidActivities.push("Harvesting (wet conditions damage produce)");
  } else if (rainfallMm > 20) {
    recommendations.push("Moderate rain — good for rainfed crops, delay irrigation by 2-3 days");
  } else if (rainfallMm === 0 && forecast === "sunny") {
    recommendations.push("No rainfall — check soil moisture and irrigate if needed");
  }

  // Wind analysis
  if (windSpeedKmph > 30) {
    riskLevel = "high";
    recommendations.push("Strong winds — provide support to tall crops");
    avoidActivities.push("Pesticide spraying (drift risk)");
    avoidActivities.push("Irrigation with sprinklers (uneven distribution)");
  }

  // Forecast-based
  if (forecast === "stormy") {
    riskLevel = "high";
    recommendations.push("Storm approaching — secure equipment and harvest mature crops if possible");
    avoidActivities.push("All field operations");
  } else if (forecast === "rainy") {
    bestActivities.push("Indoor activities: equipment maintenance, planning");
    avoidActivities.push("Harvesting and drying operations");
  }

  // Soil moisture advice
  let soilMoistureAdvice: string;
  if (rainfallMm > 30) {
    soilMoistureAdvice = "Soil is well-saturated. No irrigation needed for 3-5 days.";
  } else if (rainfallMm > 10) {
    soilMoistureAdvice = "Soil has adequate moisture. Check again in 2 days.";
  } else if (temperature > 35) {
    soilMoistureAdvice = "Soil drying quickly due to heat. Irrigate today if possible.";
  } else {
    soilMoistureAdvice = "Soil moisture is moderate. Follow regular irrigation schedule.";
  }

  return {
    suitable: riskLevel !== "high",
    riskLevel,
    recommendations,
    bestActivities,
    avoidActivities,
    soilMoistureAdvice,
  };
}

// ===========================================================================
// Utility: Get all crop names
// ===========================================================================

export function getCropList(): string[] {
  return CROP_LIST;
}

export function getCropData(cropName: string): CropData | undefined {
  return CROP_DATABASE[cropName.toLowerCase()];
}