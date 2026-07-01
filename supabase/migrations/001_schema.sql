-- Optional Supabase schema for future migration from JSON storage
-- Currently orders/quotes use data/orders.json and data/quotes.json

CREATE TABLE IF NOT EXISTS products (
  part_number TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category_slug TEXT NOT NULL,
  price DECIMAL(10,2),
  image_url TEXT,
  stock_status TEXT,
  fitment_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT,
  status TEXT DEFAULT 'pending',
  customer_email TEXT,
  customer_name TEXT,
  shipping JSONB,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2),
  shipping_cost DECIMAL(10,2),
  total DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_numbers TEXT[] NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
