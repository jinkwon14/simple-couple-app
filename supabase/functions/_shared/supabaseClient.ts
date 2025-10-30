import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { getSupabaseSecrets } from './env.ts';

export type Database = Record<string, unknown>;

let cachedClient: SupabaseClient<Database> | null = null;

export const getServiceClient = () => {
  if (!cachedClient) {
    const { url, serviceRoleKey } = getSupabaseSecrets();
    cachedClient = createClient<Database>(url, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return cachedClient;
};
