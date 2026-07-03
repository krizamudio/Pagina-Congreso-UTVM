import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function SupabaseService(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan variables de entorno de Supabase');
  }

  if (!supabaseUrl.includes('.supabase.co')) {
    throw new Error('SUPABASE_URL debe tener formato https://TU-PROYECTO.supabase.co');
  }

  if (!esApiKeyValida(supabaseKey)) {
    throw new Error(
      'SUPABASE_SECRET_KEY debe ser una API key de Supabase: sb_secret_... o service_role/anon JWT. No uses la secret S3.',
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function esApiKeyValida(key: string): boolean {
  const pareceJwt = key.split('.').length === 3;
  const pareceSecretKeyNueva = key.startsWith('sb_secret_');

  return pareceJwt || pareceSecretKeyNueva;
}
