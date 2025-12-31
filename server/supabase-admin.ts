// server/supabase-admin.ts
import { createClient } from "@supabase/supabase-js";

type SupabaseClient = ReturnType<typeof createClient> | null;

let _adminClient: SupabaseClient = null;

function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    // Throw only at runtime when someone actually tries to use the admin client.
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables for server supabase client"
    );
  }

  _adminClient = createClient(url, key, {
    auth: { persistSession: false },
    global: {
      headers: {
        // helpful for identifying server-side calls in logs
        "x-verified-by": "photo-verifier-service",
      },
    },
  });

  return _adminClient;
}

export function getSupabaseAdmin() {
  if (_adminClient) return _adminClient;
  return createAdminClient();
}

/**
 * Proxy default export so existing `import supabaseAdmin from ".../supabase-admin"`
 * call sites continue to work without changes.
 *
 * Accessing any property triggers creation of the real client.
 */
const handler: ProxyHandler<any> = {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    const value = (client as any)[prop];
    if (typeof value === "function") return value.bind(client);
    return value;
  },
  apply(_target, thisArg, args) {
    const client = getSupabaseAdmin();
    if (typeof (client as any) === "function") {
      return (client as any).apply(thisArg, args);
    }
    return undefined;
  },
};

const supabaseAdminProxy = new Proxy({}, handler) as any;

export default supabaseAdminProxy;
