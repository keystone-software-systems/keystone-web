/** Formats integer minor units (cents) as currency, matching Stripe's convention. */
export function formatMoney(amountMinorUnits: number, currency: string = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountMinorUnits / 100);
}

export function Money({ amount, currency = "usd" }: { amount: number; currency?: string }) {
  return <>{formatMoney(amount, currency)}</>;
}
