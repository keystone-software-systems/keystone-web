import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@keystone/db";

// This client uses the service-role key and bypasses RLS entirely. It must
// only ever run on the server — Route Handlers, Server Actions, webhooks —
// never inside a Client Component bundle.
//
// Note: this repo doesn't currently depend on the `server-only` package, so
// this guard is a runtime check rather than a build-time one. `SUPABASE_SECRET_KEY`
// is not `NEXT_PUBLIC_`-prefixed, so Next.js won't inline it into a client
// bundle in the first place — if this module is ever pulled into one, the
// call below will throw with a clear "missing SUPABASE_SECRET_KEY" error
// instead of silently leaking a working client.
if (typeof window !== "undefined") {
  throw new Error(
    "lib/supabase/admin.ts must never be imported into client-side code.",
  );
}

let client: ReturnType<typeof createSupabaseClient<Database>> | undefined;

/** Service-role Supabase client. RLS-bypassing — re-check the caller's role in code before using. */
export function createAdminClient() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;

    if (!url || !key) {
      throw new Error(
        "createAdminClient requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.",
      );
    }

    client = createSupabaseClient<Database>(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return client;
}
