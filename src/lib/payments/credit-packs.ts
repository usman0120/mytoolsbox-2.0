// ---------------------------------------------------------------------------
// Credit Packs — One-time AI credit purchases (no subscription required)
// ---------------------------------------------------------------------------
// Users can buy additional credits without committing to a subscription.
// This is the "pay-as-you-go" monetization path.
// ---------------------------------------------------------------------------

import type { PaymentProvider, CreditPackPurchase } from "./provider";
import { getDefaultProvider } from "./provider";

// ---------------------------------------------------------------------------
// Credit pack definitions
// ---------------------------------------------------------------------------

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceUSD: number;
  popular?: boolean;
  bestValue?: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "pack_small",
    name: "Small Pack",
    credits: 100,
    priceUSD: 1.00,
  },
  {
    id: "pack_medium",
    name: "Medium Pack",
    credits: 500,
    priceUSD: 3.00,
    popular: true,
  },
  {
    id: "pack_large",
    name: "Large Pack",
    credits: 1000,
    priceUSD: 5.00,
    bestValue: true,
  },
];

// ---------------------------------------------------------------------------
// Credit pack operations
// ---------------------------------------------------------------------------

/**
 * Get all available credit packs.
 */
export function getCreditPacks(): CreditPack[] {
  return CREDIT_PACKS;
}

/**
 * Get a specific credit pack by ID.
 */
export function getCreditPack(packId: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === packId);
}

/**
 * Purchase a credit pack for a user.
 * Uses the default payment provider to create a checkout session.
 */
export async function purchaseCreditPack(
  userId: string,
  packId: string,
  provider?: PaymentProvider,
  successUrl?: string,
  cancelUrl?: string
): Promise<{ sessionId: string; url: string; pack: CreditPack }> {
  const pack = getCreditPack(packId);
  if (!pack) {
    throw new Error(`Unknown credit pack: ${packId}`);
  }

  const paymentProvider = provider ?? getDefaultProvider();
  if (!paymentProvider) {
    throw new Error("No payment provider configured. Set up Stripe, Paddle, or Lemon Squeezy.");
  }

  const session = await paymentProvider.createCreditPackCheckout(
    userId,
    packId,
    successUrl,
    cancelUrl
  );

  return {
    sessionId: session.sessionId,
    url: session.url,
    pack,
  };
}

/**
 * Get the cost per credit for each pack (for display).
 */
export function getCreditPackValue(pack: CreditPack): number {
  return pack.priceUSD / pack.credits;
}

/**
 * Format a credit pack for display.
 */
export function formatCreditPack(pack: CreditPack): string {
  const costPerCredit = getCreditPackValue(pack);
  return `${pack.credits} credits — $${pack.priceUSD.toFixed(2)} (${(costPerCredit * 100).toFixed(1)}¢/credit)`;
}