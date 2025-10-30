import 'https://deno.land/std@0.223.0/dotenv/load.ts';

export const getEnv = (key: string): string => {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export const getSupabaseSecrets = () => ({
  url: getEnv('SUPABASE_URL'),
  serviceRoleKey: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
});

export const getExpoAccessToken = () => getEnv('EXPO_PUSH_ACCESS_TOKEN');
