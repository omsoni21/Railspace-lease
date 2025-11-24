import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public (browser-safe) client using anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client using service role key (bypasses RLS). Never expose to client.
// This will be null if the env var is not set; routes can fall back to the anon client.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || undefined;
export const supabaseAdmin = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;