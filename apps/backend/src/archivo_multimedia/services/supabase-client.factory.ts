import { createClient } from '@supabase/supabase-js';

const DEFAULT_TIMEOUT_MS = 15_000;

export function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan variables de entorno de Supabase');
  }

  if (!esSupabaseUrlValida(supabaseUrl)) {
    throw new Error(
      'SUPABASE_URL debe tener formato https://TU-PROYECTO.supabase.co',
    );
  }

  if (!esApiKeyValida(supabaseKey)) {
    throw new Error(
      'SUPABASE_SECRET_KEY debe ser una API key de Supabase: sb_secret_... o service_role/anon JWT. No uses la secret S3.',
    );
  }

  const timeoutMs = obtenerTimeout();

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: crearFetchConTimeout(timeoutMs),
    },
  });
}

function esSupabaseUrlValida(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname !== 'supabase.co' &&
      url.hostname.endsWith('.supabase.co') &&
      !url.username &&
      !url.password &&
      !url.port
    );
  } catch {
    return false;
  }
}

function obtenerTimeout(): number {
  const value = Number(process.env.SUPABASE_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  if (!Number.isInteger(value) || value < 1_000 || value > 120_000) {
    throw new Error(
      'SUPABASE_TIMEOUT_MS debe ser un entero entre 1000 y 120000',
    );
  }
  return value;
}

function crearFetchConTimeout(timeoutMs: number) {
  return async (
    input: string | URL | Request,
    init?: RequestInit,
  ): Promise<Response> => {
    const controller = new AbortController();
    const originalSignal = init?.signal;
    const abortFromOriginal = () => controller.abort(originalSignal?.reason);

    if (originalSignal?.aborted) {
      abortFromOriginal();
    } else {
      originalSignal?.addEventListener('abort', abortFromOriginal, {
        once: true,
      });
    }

    const timeout = setTimeout(
      () => controller.abort(new Error('Tiempo de espera de Supabase agotado')),
      timeoutMs,
    );

    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
      originalSignal?.removeEventListener('abort', abortFromOriginal);
    }
  };
}

function esApiKeyValida(key: string): boolean {
  const pareceJwt = key.split('.').length === 3;
  const pareceSecretKeyNueva = key.startsWith('sb_secret_');

  return pareceJwt || pareceSecretKeyNueva;
}
