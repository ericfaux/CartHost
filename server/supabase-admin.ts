import { createClient } from "@supabase/supabase-js";

// Ensure callers set these env vars in the deployment environment (Vercel)
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  // Throwing early helps catch misconfigured deployments immediately
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables for server supabase client"
  );
}

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
    global: {
      headers: {
        // helpful for identifying server-side calls in logs
        "x-verified-by": "photo-verifier-service",
      },
    },
  }
);

export default supabaseAdmin;
