/**
 * Supabase client singleton.
 *
 * The VITE_ env vars are injected at build time from .env.local.
 * For local dev: http://127.0.0.1:54321  +  the publishable key from `supabase start`.
 * For staging/prod: replace with the hosted project URL + publishable key via CI secrets.
 *
 * NEVER import or use SUPABASE_SERVICE_ROLE_KEY here — that stays in Edge Functions only.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. " +
      "Add them to .env.local (see docs/BACKEND_CONNECTION.md).",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    // Store session in localStorage so it survives page refresh.
    persistSession: true,
    // Automatically refresh the JWT before it expires.
    autoRefreshToken: true,
    // Detect the session from the URL hash on deep-link redirects
    // (password-reset emails, magic links).
    detectSessionInUrl: true,
  },
});

/**
 * Convenience: get the currently signed-in user's ID, or null.
 * Prefer this over calling supabase.auth.getUser() in components.
 */
export function currentUserId(): string | null {
  // Auth user lookup is asynchronous; use the auth hook for the current ID.
  return null;
}
