import "server-only";

// Payment provider interface (blueprint section 18). Disabled in year 1.
export interface PaymentProvider {
  createCheckout(input: { uid: string; offerId: string }): Promise<{ url: string }>;
  handleWebhook(request: Request): Promise<void>;
  getCustomerPortal(uid: string): Promise<{ url: string }>;
}

const disabled = (): never => {
  throw new Error("Payments are disabled.");
};

export const payments: PaymentProvider = {
  createCheckout: async () => disabled(),
  handleWebhook: async () => disabled(),
  getCustomerPortal: async () => disabled(),
};
