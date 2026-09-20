// ---------------------------------------------------------------------------
// Stripe Payment Provider
// ---------------------------------------------------------------------------
// Implements the PaymentProvider interface for Stripe.
// Requires `stripe` npm package and STRIPE_SECRET_KEY env var in production.
// ---------------------------------------------------------------------------

import type { SubscriptionTier } from "@/lib/ai/credits";
import { SUBSCRIPTION_PLANS } from "@/lib/ai/credits";
import type {
  PaymentProvider,
  CheckoutSession,
  CreditPackPurchase,
  PaymentStatus,
  Invoice,
} from "./provider";
import { PROVIDER_CONFIGS, registerPaymentProvider } from "./provider";
import { CREDIT_PACKS, getCreditPack } from "./credit-packs";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Stripe Provider Implementation
// ---------------------------------------------------------------------------

function createStripeProvider(): PaymentProvider {
  return {
    name: "stripe",
    config: PROVIDER_CONFIGS.stripe,

    isAvailable(): boolean {
      return !!STRIPE_SECRET_KEY;
    },

    // --- Subscriptions ---

    async createSubscriptionCheckout(
      userId: string,
      tier: SubscriptionTier,
      successUrl?: string,
      cancelUrl?: string
    ): Promise<CheckoutSession> {
      if (!STRIPE_SECRET_KEY) {
        throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY in .env.local");
      }

      const plan = SUBSCRIPTION_PLANS[tier];
      if (plan.priceMonthly === null) {
        throw new Error(`Tier "${tier}" is free and cannot be purchased.`);
      }

      // In production:
      // const stripe = new Stripe(STRIPE_SECRET_KEY);
      // const session = await stripe.checkout.sessions.create({
      //   mode: "subscription",
      //   client_reference_id: userId,
      //   success_url: successUrl ?? `${APP_URL}/account?checkout=success`,
      //   cancel_url: cancelUrl ?? `${APP_URL}/account?checkout=cancelled`,
      //   line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      // });

      return {
        sessionId: `cs_placeholder_${userId}_${tier}`,
        url: successUrl ?? `${APP_URL}/account?checkout=success`,
        providerName: "stripe",
      };
    },

    async getSubscriptionStatus(_userId: string): Promise<PaymentStatus> {
      return {
        tier: "free_account",
        isPro: false,
        providerName: "stripe",
      };
    },

    async cancelSubscription(_userId: string): Promise<void> {
      if (!STRIPE_SECRET_KEY) throw new Error("Stripe is not configured.");
    },

    async resumeSubscription(_userId: string): Promise<void> {
      if (!STRIPE_SECRET_KEY) throw new Error("Stripe is not configured.");
    },

    // --- Credit packs ---

    getCreditPacks(): CreditPackPurchase[] {
      return CREDIT_PACKS.map((pack) => ({
        packId: pack.id,
        credits: pack.credits,
        priceUSD: pack.priceUSD,
        currency: "USD",
      }));
    },

    async createCreditPackCheckout(
      userId: string,
      packId: string,
      successUrl?: string,
      cancelUrl?: string
    ): Promise<CheckoutSession> {
      if (!STRIPE_SECRET_KEY) {
        throw new Error("Stripe is not configured.");
      }

      const pack = getCreditPack(packId);
      if (!pack) throw new Error(`Unknown credit pack: ${packId}`);

      // In production: create a Stripe Checkout Session for one-time payment
      return {
        sessionId: `cs_credits_${userId}_${packId}`,
        url: successUrl ?? `${APP_URL}/account?credits=success`,
        providerName: "stripe",
      };
    },

    // --- Invoices ---

    async getInvoices(_userId: string): Promise<Invoice[]> {
      return [];
    },

    // --- Webhooks ---

    async verifyWebhookSignature(_payload: string, _signature: string): Promise<boolean> {
      // In production: stripe.webhooks.constructEvent(payload, signature, webhookSecret)
      return true;
    },

    async handleWebhook(_event: Record<string, unknown>): Promise<void> {
      // In production: handle checkout.session.completed, customer.subscription.updated, etc.
    },
  };
}

// ---------------------------------------------------------------------------
// Register the provider
// ---------------------------------------------------------------------------

const stripeProvider = createStripeProvider();
registerPaymentProvider(stripeProvider);

// ---------------------------------------------------------------------------
// Re-export convenience functions (backward compatible)
// ---------------------------------------------------------------------------

export { stripeProvider };

/** @deprecated Use PaymentProvider interface instead */
export async function createCheckoutSession(
  userId: string,
  tier: SubscriptionTier,
  successUrl?: string,
  cancelUrl?: string
): Promise<CheckoutSession> {
  return stripeProvider.createSubscriptionCheckout(userId, tier, successUrl, cancelUrl);
}

/** @deprecated Use PaymentProvider interface instead */
export async function getPaymentStatus(userId: string): Promise<PaymentStatus> {
  return stripeProvider.getSubscriptionStatus(userId);
}

/** @deprecated Use PaymentProvider interface instead */
export async function cancelSubscription(userId: string): Promise<void> {
  return stripeProvider.cancelSubscription(userId);
}

/** @deprecated Use PaymentProvider interface instead */
export async function resumeSubscription(userId: string): Promise<void> {
  return stripeProvider.resumeSubscription(userId);
}

/** Get the Pro price display string. */
export function getProPriceDisplay(): { monthly: string; yearly: string } {
  const pro = SUBSCRIPTION_PLANS.pro;
  const proPlus = SUBSCRIPTION_PLANS.pro_plus;
  return {
    monthly: `$${pro.priceMonthly?.toFixed(2)}/mo`,
    yearly: `$${proPlus.priceMonthly?.toFixed(2)}/mo`,
  };
}