/**
 * Database types for Supabase tables.
 * Keep these in sync with `supabase/schema.sql`.
 */

export type ProductCategory =
  | 'Facewash'
  | 'Serum'
  | 'Moisturizer'
  | 'Sunscreen'
  | 'Mask'
  | 'Shampoo'
  | 'Oil'
  | 'Tonic';

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'Facewash', label: 'Facewash' },
  { value: 'Serum', label: 'Serum' },
  { value: 'Moisturizer', label: 'Moisturizer' },
  { value: 'Sunscreen', label: 'Sunscreen' },
  { value: 'Mask', label: 'Mask' },
  { value: 'Shampoo', label: 'Shampoo' },
  { value: 'Oil', label: 'Hair Oil' },
  { value: 'Tonic', label: 'Hair Tonic' },
];

export type ProductBadge = 'Bestseller' | 'New' | 'SPF 50' | 'Limited' | null;

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  subtitle: string | null;
  price_pkr: number;
  description: string | null;
  badge: ProductBadge;
  image_url: string | null;
  in_stock: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type ProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

export type OrderStatus = 'New' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export type PaymentMethod =
  | 'Cash on Delivery'
  | 'EasyPaisa'
  | 'JazzCash'
  | 'Credit/Debit Card'
  | 'Bank Transfer';

export interface OrderItem {
  name: string;
  price: string;
  qty: number;
}

export interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: string;
  items: OrderItem[];
  total_pkr: number;
  payment_method: PaymentMethod;
  notes: string | null;
  status: OrderStatus;
  created_at: string;
}

export type OrderInput = Omit<Order, 'id' | 'created_at' | 'status'> & {
  status?: OrderStatus;
};

/**
 * Frontend-shaped product (used by ProductCard and cart).
 * Maps from the database row via mapDbProduct().
 */
export interface UiProduct {
  id: string;
  name: string;
  cat: ProductCategory;
  sub: string;
  price: string; // formatted, e.g. "PKR 2,400"
  pricePkr: number;
  desc: string;
  badge: ProductBadge;
  image: string | null;
  inStock: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

export interface CartItem {
  name: string;
  price: string;
  qty: number;
}
