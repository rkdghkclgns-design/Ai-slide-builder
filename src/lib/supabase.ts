import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getApiKey(service: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("api_keys")
    .select("api_key")
    .eq("service", service)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data.api_key;
}
