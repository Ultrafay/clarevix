-- ════════════════════════════════════════════════════════════════
-- CLAREVIX — Supabase Setup
-- Run this entire file once in Supabase SQL Editor:
--   Dashboard → SQL Editor → New query → paste → Run
-- ════════════════════════════════════════════════════════════════

-- ─── PRODUCTS TABLE ──────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  subtitle text,
  price_pkr integer not null check (price_pkr >= 0),
  description text,
  badge text,
  image_url text,
  in_stock boolean default true not null,
  is_featured boolean default false not null,
  display_order integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists products_in_stock_idx on products(in_stock);
create index if not exists products_category_idx on products(category);
create index if not exists products_display_order_idx on products(display_order);
create index if not exists products_is_featured_idx on products(is_featured) where is_featured = true;

-- Auto-update `updated_at` on row update
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists products_updated_at on products;
create trigger products_updated_at before update on products
  for each row execute function set_updated_at();

-- ─── ORDERS TABLE ────────────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  address text not null,
  items jsonb not null,
  total_pkr integer not null check (total_pkr >= 0),
  payment_method text not null,
  notes text,
  status text default 'New' not null,
  created_at timestamptz default now() not null
);

create index if not exists orders_created_at_idx on orders(created_at desc);
create index if not exists orders_status_idx on orders(status);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────
alter table products enable row level security;

drop policy if exists "Public can read products" on products;
create policy "Public can read products"
  on products for select
  using (true);

drop policy if exists "Authenticated can insert products" on products;
create policy "Authenticated can insert products"
  on products for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update products" on products;
create policy "Authenticated can update products"
  on products for update
  to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated can delete products" on products;
create policy "Authenticated can delete products"
  on products for delete
  to authenticated
  using (true);

alter table orders enable row level security;

drop policy if exists "Anyone can place an order" on orders;
create policy "Anyone can place an order"
  on orders for insert
  with check (true);

drop policy if exists "Authenticated can read orders" on orders;
create policy "Authenticated can read orders"
  on orders for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can update orders" on orders;
create policy "Authenticated can update orders"
  on orders for update
  to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated can delete orders" on orders;
create policy "Authenticated can delete orders"
  on orders for delete
  to authenticated
  using (true);

-- ─── STORAGE BUCKET FOR PRODUCT IMAGES ───────────────────────────
insert into storage.buckets (id, name, public)
  values ('product-images', 'product-images', true)
  on conflict (id) do nothing;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Authenticated can upload product images" on storage.objects;
create policy "Authenticated can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "Authenticated can update product images" on storage.objects;
create policy "Authenticated can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Authenticated can delete product images" on storage.objects;
create policy "Authenticated can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

-- ─── SEED INITIAL PRODUCTS (optional) ────────────────────────────
-- Comment this block out if you want to start with an empty store.
insert into products (name, category, subtitle, price_pkr, description, badge, is_featured, display_order) values
  ('Clare Clarity Facewash', 'Facewash', 'Daily Cleanse · Face', 1850, 'Gentle amino acid-based cleanser preserving the skin barrier while deeply purifying pores.', null, true, 1),
  ('Vix Active Serum', 'Serum', 'Active Treatment · Face', 3200, 'Niacinamide, Hyaluronic Acid & Vitamin C blend targeting hyperpigmentation, texture & glow.', 'Bestseller', true, 2),
  ('Clare-Barrier Moisturizer', 'Moisturizer', 'Hydration · Face', 2400, 'Ceramide-rich daily moisturizer rebuilding the skin barrier and locking in lasting hydration.', null, true, 3),
  ('SPF 50 Veil Sunscreen', 'Sunscreen', 'Sun Protection · Face', 2750, 'Weightless mineral sunscreen. Broad spectrum UVA/UVB protection for daily use.', 'SPF 50', true, 4),
  ('Deep Glow Mask', 'Mask', 'Weekly Treatment · Face', 1950, 'Kaolin clay & niacinamide mask that purifies pores, controls shine, and restores clarity.', 'New', false, 5),
  ('Brightening Vitamin C Serum', 'Serum', 'Brightening · Face', 2900, 'High-potency 15% stabilised Vitamin C with ferulic acid for luminous, even skin tone.', null, false, 6),
  ('Radiance Renewal Mask', 'Mask', 'Glow Treatment · Face', 2100, 'Enzyme exfoliating mask with papaya extract and AHA complex for smooth, radiant skin.', 'New', false, 7),
  ('Hydra-Plump Moisturizer', 'Moisturizer', 'Intensive Hydration · Face', 2650, 'Triple hyaluronic acid formula for dehydrated skin. 72-hour moisture lock technology.', null, false, 8),
  ('Gentle Rice Facewash', 'Facewash', 'Brightening Cleanse · Face', 1650, 'Fermented rice water and PHA for gentle brightening and a velvety-clean finish.', null, false, 9),
  ('Scalp Renewal Shampoo', 'Shampoo', 'Strengthen · Hair', 1600, 'Biotin and keratin-enriched shampoo for strengthened, voluminous hair from root to tip.', null, false, 10),
  ('Nourish Hair Oil', 'Oil', 'Deep Nourishment · Hair', 1950, 'Cold-pressed argan, jojoba, and rosemary oil for deep nourishment and scalp health.', null, false, 11),
  ('Vix Hair Tonic', 'Tonic', 'Growth Stimulant · Hair', 2100, 'Caffeine and peptide-activated scalp tonic that stimulates follicles and reduces hair fall.', 'Bestseller', false, 12),
  ('Balance Scalp Shampoo', 'Shampoo', 'Oil Control · Hair', 1700, 'Zinc PCA and salicylic acid shampoo for oily, dandruff-prone scalps.', null, false, 13)
on conflict do nothing;
