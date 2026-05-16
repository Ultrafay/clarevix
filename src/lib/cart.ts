import { atom, computed } from 'nanostores';
import type { CartItem } from './types';

const STORAGE_KEY = 'clarevix-cart';

function loadCart(): CartItem[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistCart(items: readonly CartItem[]) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota errors */
  }
}

/** Reactive cart store. Subscribe with cart.subscribe(...) or use computed values below. */
export const cart = atom<CartItem[]>(loadCart());

cart.subscribe((value) => persistCart(value));

export const cartCount = computed(cart, (items) => items.reduce((sum, i) => sum + i.qty, 0));

export const cartTotalPkr = computed(cart, (items) =>
  items.reduce((sum, i) => sum + parsePkr(i.price) * i.qty, 0)
);

export function parsePkr(price: string): number {
  return parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
}

export function addToCart(name: string, price: string) {
  const items = [...cart.get()];
  const existing = items.find((i) => i.name === name);
  if (existing) existing.qty += 1;
  else items.push({ name, price, qty: 1 });
  cart.set(items);
}

export function changeQty(name: string, delta: number) {
  const items = cart.get().map((i) => (i.name === name ? { ...i, qty: i.qty + delta } : i));
  cart.set(items.filter((i) => i.qty > 0));
}

export function removeFromCart(name: string) {
  cart.set(cart.get().filter((i) => i.name !== name));
}

export function clearCart() {
  cart.set([]);
}
