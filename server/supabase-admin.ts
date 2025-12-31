// server/supabase-admin.ts
import { createClient } from "@supabase/supabase-js";

type SupabaseClient = ReturnType<typeof createClient> | null;

let _adminClient: SupabaseClient = null;

function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables for server supabase client"
    );
  }
  _adminClient = createClient(url, key, {
    auth: { persistSession: false },
    global: {
      headers: { "x-verified-by": "photo-verifier-service" },
    },
  });
  return _adminClient;
}

export function getSupabaseAdmin() {
  if (_adminClient) return _adminClient;
  return createAdminClient();
}

// Keep a default proxy export for backward compat
const handler: ProxyHandler<any> = {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    const val = (client as any)[prop];
    return typeof val === "function" ? val.bind(client) : val;
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
