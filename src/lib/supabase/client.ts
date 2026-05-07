import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database.types';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error(
    `Missing Supabase environment variables:
    - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ?? 'undefined'}
    - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'set' : 'undefined'}
    - SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceRoleKey ? 'set' : 'undefined'}

    Make sure they are correctly set in your environment variables.`,
  );
}

// Create a Supabase client for client-side use.
export const createSupabaseClientAnonymous: SupabaseClient<Database> =
  createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

// Create a Supabase client for server-side privileged use.
export const createSupabaseClientServiceRole = (): SupabaseClient<Database> => {
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
};

// Create a Supabase client for middleware use.
export const createSupabaseClientMiddleware = (
  req: NextRequest,
  res: NextResponse,
) => {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          req.cookies.set(name, value);
          res.cookies.set(name, value, options);
        });
      },
    },
  });
};

// Create a Supabase client for API route or server-side use.
export const createSupabaseClientApi = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore if called from a context where cookies cannot be written.
        }
      },
    },
  });
};
