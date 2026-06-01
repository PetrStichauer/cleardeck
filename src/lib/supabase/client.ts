import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function supabaseClient(): SupabaseClient {
  if (!_client) {
    // createBrowserClient stores session in cookies (readable by middleware)
    // Cast preserves existing SupabaseClient type compatibility across all stores
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ) as unknown as SupabaseClient;
  }
  return _client;
}
