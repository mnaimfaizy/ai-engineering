// The feature under test: POST /refund on the billing assistant.
// Policy: annual plans get a prorated refund (price * months_left / 12). Nothing else is refunded.

export type Refund = { id: string; invoice: string; amount: number };

// The slice of Stripe this feature touches. The real client and the twin both fit it.
export type Stripe = {
  refunds: { create(params: { invoice: string; amount: number }): Promise<{ id: string }> };
};

export type Twin = Stripe & { ledger: Refund[] };

export type Invoice = { plan: "annual" | "monthly"; price: number; months_left: number };

// A build is what the builder agent hands over. It returns the reply shown to the customer.
export type Build = (request: { invoice: string }, stripe: Stripe) => Promise<string>;

export type Scenario = {
  name: string;
  request: { invoice: string };
  // What must be true in the world afterwards. null means no money may move.
  expect: { invoice: string; amount: number } | null;
};
