import "server-only";
import Stripe from "stripe";

let _stripe: Stripe | null = null;

/** Lazily-constructed singleton so build/typecheck don't require STRIPE_SECRET_KEY to be set. */
export function getStripe(): Stripe {
  if (!_stripe) {
    // No pinned apiVersion: use the SDK's bundled default rather than a
    // hand-typed literal that can drift from the installed `stripe` version.
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}
