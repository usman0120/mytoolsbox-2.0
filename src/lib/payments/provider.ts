// ---------------------------------------------------------------------------
// PaymentProvider — Abstract payment provider interface
// ---------------------------------------------------------------------------
// Design your billing architecture around this abstraction so switching
// providers (Stripe → Paddle → Lemon Squeezy → PayPal) isn't a rewrite.
//
// Supported providers:
// - Stripe (global, developer-friendly)
// - Paddle (merchant-of-record, handles global tax)
// - Lemon Squeezy (merchant-of-record, simple)
// - PayPal (regional, familiar to many users)
// ---------------------------------------------------------------------------

import type { SubscriptionTier } from "@/lib/ai/credits";

// ---------------------------------------------------------------------------
// Provider types
// ---------------------------------------------------------------------------

export type PaymentProviderName = "stripe" | "paddle" | "lemonsqueezy" | "paypal";

export interface PaymentProviderConfig {
  name: PaymentProviderName;
  displayName: string;
  isMerchantOfRecord: boolean;  // Handles global sales tax/VAT
  supportedRegions: string[];   // ISO country codes, empty = global
  supportedCurrencies: string[];
  minPayoutAmount: number;      // USD
  features: {
    subscriptions: boolean;
    oneTimePayments: boolean;
    creditPacks: boolean;
    invoicing: boolean;
    dunning: boolean;           // Failed payment recovery
  };
}

// ---------------------------------------------------------------------------
// Common interfaces (all providers implement these)
// ---------------------------------------------------------------------------

export interface CheckoutSession {
  sessionId: string;
  url: string;
  providerName: PaymentProviderName;
}

export interface CreditPackPurchase {
  packId: string;
  credits: number;
  priceUSD: number;
  currency: string;
}

export interface PaymentStatus {
  tier: SubscriptionTier;
  isPro: boolean;
  providerName: PaymentProviderName;
  subscriptionId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "open" | "void";
  date: string;
  url?: string;
}

// ---------------------------------------------------------------------------
// Abstract provider interface
// ---------------------------------------------------------------------------

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  readonly config: PaymentProviderConfig;

  /** Check if this provider is configured and available */
  isAvailable(): boolean;

  // --- Subscriptions ---
  createSubscriptionCheckout(userId: string, tier: SubscriptionTier, successUrl?: string, cancelUrl?: string): Promise<CheckoutSession>;
  getSubscriptionStatus(userId: string): Promise<PaymentStatus>;
  cancelSubscription(userId: string): Promise<void>;
  resumeSubscription(userId: string): Promise<void>;

  // --- Credit packs ---
  getCreditPacks(): CreditPackPurchase[];
  createCreditPackCheckout(userId: string, packId: string, successUrl?: string, cancelUrl?: string): Promise<CheckoutSession>;

  // --- Invoices ---
  getInvoices(userId: string): Promise<Invoice[]>;

  // --- Webhooks ---
  verifyWebhookSignature(payload: string, signature: string): Promise<boolean>;
  handleWebhook(event: Record<string, unknown>): Promise<void>;
}

// ---------------------------------------------------------------------------
// Provider registry
// ---------------------------------------------------------------------------

const providerRegistry = new Map<PaymentProviderName, PaymentProvider>();

export function registerPaymentProvider(provider: PaymentProvider): void {
  providerRegistry.set(provider.name, provider);
}

export function getPaymentProvider(name: PaymentProviderName): PaymentProvider | undefined {
  return providerRegistry.get(name);
}

export function getAvailableProviders(): PaymentProvider[] {
  return Array.from(providerRegistry.values()).filter((p) => p.isAvailable());
}

export function getDefaultProvider(): PaymentProvider | undefined {
  // Prefer merchant-of-record providers first (less tax liability)
  const available = getAvailableProviders();
  const mor = available.find((p) => p.config.isMerchantOfRecord);
  return mor ?? available[0];
}

// ---------------------------------------------------------------------------
// Provider configurations
// ---------------------------------------------------------------------------

export const PROVIDER_CONFIGS: Record<PaymentProviderName, PaymentProviderConfig> = {
  stripe: {
    name: "stripe",
    displayName: "Stripe",
    isMerchantOfRecord: false,
    supportedRegions: [], // Global (135+ countries)
    supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD", "PKR"],
    minPayoutAmount: 1,
    features: {
      subscriptions: true,
      oneTimePayments: true,
      creditPacks: true,
      invoicing: true,
      dunning: true,
    },
  },
  paddle: {
    name: "paddle",
    displayName: "Paddle",
    isMerchantOfRecord: true,
    supportedRegions: [], // Global
    supportedCurrencies: ["USD", "EUR", "GBP"],
    minPayoutAmount: 1,
    features: {
      subscriptions: true,
      oneTimePayments: true,
      creditPacks: true,
      invoicing: true,
      dunning: true,
    },
  },
  lemonsqueezy: {
    name: "lemonsqueezy",
    displayName: "Lemon Squeezy",
    isMerchantOfRecord: true,
    supportedRegions: [], // Global
    supportedCurrencies: ["USD"],
    minPayoutAmount: 1,
    features: {
      subscriptions: true,
      oneTimePayments: true,
      creditPacks: true,
      invoicing: true,
      dunning: true,
    },
  },
  paypal: {
    name: "paypal",
    displayName: "PayPal",
    isMerchantOfRecord: false,
    supportedRegions: [], // Global (200+ markets)
    supportedCurrencies: ["USD", "EUR", "GBP", "PKR"],
    minPayoutAmount: 1,
    features: {
      subscriptions: true,
      oneTimePayments: true,
      creditPacks: true,
      invoicing: false,
      dunning: false,
    },
  },
};