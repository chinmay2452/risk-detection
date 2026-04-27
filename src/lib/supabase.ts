import { createClient } from "@supabase/supabase-js";

// Uses environment variables with a fallback to placeholder strings to prevent crashes
// during local development if variables aren't set yet.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
