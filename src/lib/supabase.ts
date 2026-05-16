import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import WebSocket from 'isomorphic-ws';
import type { Product, UiProduct } from './types';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

/**
 * True when real Supabase credentials are configured.
 * Lets the site run in "demo mode" with seed data when env vars
 * are missing — useful for local development without a backend.
 */
export const isSupabaseConfigured =
  !!SUPABASE_URL &&
  !!SUPABASE_ANON_KEY &&
  SUPABASE_URL !== 'https://YOUR-PROJECT.supabase.co' &&
  SUPABASE_ANON_KEY !== 'YOUR-ANON-PUBLIC-KEY';

/**
 * The shared Supabase client.
 * Returns null in demo mode so callers can no-op gracefully.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
      realtime: {
        transport: WebSocket,
      },
    })
  : null;

/**
 * Map a Supabase product row to the UI shape used by ProductCard.
 */
export function mapDbProduct(p: Product): UiProduct {
  return {
    id: p.id,
    name: p.name,
    cat: p.category,
    sub: p.subtitle ?? '',
    price: `PKR ${p.price_pkr.toLocaleString('en-PK')}`,
    pricePkr: p.price_pkr,
    desc: p.description ?? '',
    badge: p.badge,
    image: p.image_url,
    inStock: p.in_stock,
    isFeatured: p.is_featured,
    displayOrder: p.display_order,
  };
}

/**
 * Fetch all in-stock products, ordered for the storefront.
 * Returns empty array if Supabase isn't configured (demo mode handles fallback).
 */
export async function fetchProducts(): Promise<UiProduct[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
  return (data ?? []).map(mapDbProduct);
}
