// ---------------------------------------------------------------------------
// Team / Business / Education Tiers
// ---------------------------------------------------------------------------
// Scaffolding for future multi-user plans. Only activate once there is
// actual demand. These are NOT available for purchase yet.
// ---------------------------------------------------------------------------

import type { SubscriptionTier } from "@/lib/ai/credits";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OrganizationTier = "team" | "business" | "education";

export interface OrganizationPlan {
  tier: OrganizationTier;
  name: string;
  description: string;
  minSeats: number;
  maxSeats: number;
  pricePerSeatMonthly: number;
  pricePerSeatYearly: number;
  monthlyCreditsPerSeat: number;
  features: string[];
  limits: {
    maxFileSizeMB: number;
    batchOperations: boolean;
    cloudProcessing: boolean;
    ads: boolean;
    adminDashboard: boolean;
    sso: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
  };
  status: "coming_soon" | "available" | "enterprise_only";
}

// ---------------------------------------------------------------------------
// Organization Plans (NOT YET ACTIVE)
// ---------------------------------------------------------------------------

export const ORGANIZATION_PLANS: Record<OrganizationTier, OrganizationPlan> = {
  team: {
    tier: "team",
    name: "Team",
    description: "For small teams collaborating on projects. Centralized billing and admin controls.",
    minSeats: 3,
    maxSeats: 25,
    pricePerSeatMonthly: 2.49,
    pricePerSeatYearly: 24,
    monthlyCreditsPerSeat: 5000,
    features: [
      "Everything in Pro",
      "Centralized billing",
      "Team admin dashboard",
      "Shared templates",
      "Team usage analytics",
      "Priority email support",
    ],
    limits: {
      maxFileSizeMB: 250,
      batchOperations: true,
      cloudProcessing: true,
      ads: false,
      adminDashboard: true,
      sso: false,
      prioritySupport: false,
      customBranding: false,
    },
    status: "coming_soon",
  },
  business: {
    tier: "business",
    name: "Business",
    description: "For organizations needing SSO, custom branding, and dedicated support.",
    minSeats: 10,
    maxSeats: 500,
    pricePerSeatMonthly: 4.99,
    pricePerSeatYearly: 49,
    monthlyCreditsPerSeat: 20000,
    features: [
      "Everything in Team",
      "SSO (SAML/OIDC)",
      "Custom branding",
      "Dedicated account manager",
      "API access",
      "Audit logs",
      "Custom integrations",
      "SLA guarantee",
    ],
    limits: {
      maxFileSizeMB: 1000,
      batchOperations: true,
      cloudProcessing: true,
      ads: false,
      adminDashboard: true,
      sso: true,
      prioritySupport: true,
      customBranding: true,
    },
    status: "coming_soon",
  },
  education: {
    tier: "education",
    name: "Education",
    description: "Discounted plans for schools, universities, and educational institutions.",
    minSeats: 20,
    maxSeats: 1000,
    pricePerSeatMonthly: 0.99,
    pricePerSeatYearly: 9,
    monthlyCreditsPerSeat: 3000,
    features: [
      "Everything in Team",
      "Educational discount",
      "Classroom management",
      "Assignment templates",
      "Student progress tracking",
      "LMS integration ready",
      "Bulk import/export",
    ],
    limits: {
      maxFileSizeMB: 250,
      batchOperations: true,
      cloudProcessing: true,
      ads: false,
      adminDashboard: true,
      sso: true,
      prioritySupport: false,
      customBranding: false,
    },
    status: "coming_soon",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check if an organization plan is available for purchase.
 */
export function isOrganizationPlanAvailable(tier: OrganizationTier): boolean {
  return ORGANIZATION_PLANS[tier].status === "available";
}

/**
 * Get an organization plan by tier.
 */
export function getOrganizationPlan(tier: OrganizationTier): OrganizationPlan {
  return ORGANIZATION_PLANS[tier];
}

/**
 * Calculate the monthly cost for an organization plan.
 */
export function calculateOrgCost(tier: OrganizationTier, seats: number): number {
  const plan = ORGANIZATION_PLANS[tier];
  const actualSeats = Math.max(plan.minSeats, Math.min(plan.maxSeats, seats));
  return actualSeats * plan.pricePerSeatMonthly;
}

/**
 * Get all organization plans that are available or coming soon.
 */
export function getOrganizationPlans(): OrganizationPlan[] {
  return Object.values(ORGANIZATION_PLANS);
}

/**
 * Check if a user's tier is an organization tier.
 */
export function isOrganizationTier(tier: string): tier is OrganizationTier {
  return tier === "team" || tier === "business" || tier === "education";
}