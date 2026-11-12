-- Warehouse schema for Neon Postgres.
-- Replaces the InsForge-specific migrations: no auth.* functions, no RLS
-- (all access goes through authenticated server route handlers).

-- =====================================================================
-- Shared helpers
-- =====================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.slugify_text(p_value TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(
    both '-' from regexp_replace(
      regexp_replace(
        lower(
          translate(
            coalesce(p_value, ''),
            'áéíóúüñàèìòùçÁÉÍÓÚÜÑÀÈÌÒÙÇ',
            'aeiouunaeioucaeiouunaeiouc'
          )
        ),
        '[^a-z0-9]+', '-', 'g'
      ),
      '-{2,}', '-', 'g'
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.set_entity_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_base TEXT;
  v_candidate TEXT;
  v_taken BOOLEAN;
BEGIN
  IF TG_TABLE_NAME = 'products' THEN
    v_base := public.slugify_text(NEW.sku);
  ELSIF TG_TABLE_NAME = 'customers' THEN
    v_base := public.slugify_text(NEW.code);
  ELSIF TG_TABLE_NAME = 'orders' THEN
    v_base := public.slugify_text(NEW.order_number);
  ELSIF TG_TABLE_NAME = 'picking' THEN
    v_base := public.slugify_text(NEW.task_number);
  ELSIF TG_TABLE_NAME = 'staff' THEN
    v_base := public.slugify_text(NEW.name);
  END IF;

  IF v_base IS NULL OR v_base = '' THEN
    RETURN NEW;
  END IF;

  v_candidate := v_base;
  EXECUTE format(
    'SELECT EXISTS (SELECT 1 FROM public.%I WHERE slug = $1 AND id IS DISTINCT FROM $2)',
    TG_TABLE_NAME
  )
  INTO v_taken
  USING v_candidate, NEW.id;

  IF v_taken THEN
    v_candidate := v_base || '-' || NEW.id::text;
  END IF;

  NEW.slug := v_candidate;
  RETURN NEW;
END;
$$;

-- =====================================================================
-- Domain tables
-- =====================================================================
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL DEFAULT '',
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Cliente',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Activo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL DEFAULT '',
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_id BIGINT,
  status TEXT NOT NULL DEFAULT 'Pendiente',
  priority TEXT NOT NULL DEFAULT 'normal',
  total_items INTEGER NOT NULL DEFAULT 0,
  total_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS picking (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL DEFAULT '',
  task_number TEXT NOT NULL UNIQUE,
  order_number TEXT NOT NULL DEFAULT '',
  order_id BIGINT,
  assigned_to TEXT NOT NULL DEFAULT '',
  staff_id BIGINT,
  zone TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Pendiente',
  total_items INTEGER NOT NULL DEFAULT 0,
  picked_items INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Operario',
  zone TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Activo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Warehouse file attachments (replaces InsForge object storage).
CREATE TABLE IF NOT EXISTS files (
  key TEXT PRIMARY KEY,
  content_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  size INTEGER NOT NULL,
  data BYTEA NOT NULL,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- Constraints
-- =====================================================================
ALTER TABLE orders ADD CONSTRAINT orders_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE picking ADD CONSTRAINT picking_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
ALTER TABLE picking ADD CONSTRAINT picking_staff_id_fkey
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL;

ALTER TABLE products ADD CONSTRAINT products_stock_non_negative CHECK (stock >= 0);
ALTER TABLE products ADD CONSTRAINT products_min_stock_non_negative CHECK (min_stock >= 0);
ALTER TABLE products ADD CONSTRAINT products_price_non_negative CHECK (price >= 0);

ALTER TABLE orders ADD CONSTRAINT orders_total_items_non_negative CHECK (total_items >= 0);
ALTER TABLE orders ADD CONSTRAINT orders_total_value_non_negative CHECK (total_value >= 0);
ALTER TABLE orders ADD CONSTRAINT orders_priority_valid
  CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
ALTER TABLE orders ADD CONSTRAINT orders_status_valid
  CHECK (status IN ('Pendiente', 'Picking', 'Packing', 'Despachado', 'Completado', 'Cancelado', 'Control de Calidad', 'Recibido'));

ALTER TABLE picking ADD CONSTRAINT picking_total_items_non_negative CHECK (total_items >= 0);
ALTER TABLE picking ADD CONSTRAINT picking_picked_items_non_negative CHECK (picked_items >= 0);
ALTER TABLE picking ADD CONSTRAINT picking_status_valid
  CHECK (status IN ('Pendiente', 'En Proceso', 'Completado', 'Pausada', 'Cancelado'));

ALTER TABLE staff ADD CONSTRAINT staff_role_valid
  CHECK (role IN ('Administrador', 'Supervisor', 'Operario', 'Picker', 'Mantenimiento'));
ALTER TABLE staff ADD CONSTRAINT staff_status_valid
  CHECK (status IN ('Activo', 'Inactivo', 'En Ruta'));

ALTER TABLE customers ADD CONSTRAINT customers_type_valid
  CHECK (type IN ('Cliente', 'Proveedor', 'Transportista'));
ALTER TABLE customers ADD CONSTRAINT customers_status_valid
  CHECK (status IN ('Activo', 'Inactivo', 'Pendiente', 'Bloqueado'));

-- =====================================================================
-- Indexes
-- =====================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_slug ON customers(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_slug ON orders(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_picking_slug ON picking(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_slug ON staff(slug);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock, min_stock);
CREATE INDEX IF NOT EXISTS idx_products_category_sku ON products(category, sku);
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(stock, min_stock) WHERE stock <= min_stock;

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_picking_status ON picking(status);
CREATE INDEX IF NOT EXISTS idx_picking_order_id ON picking(order_id);
CREATE INDEX IF NOT EXISTS idx_picking_staff_id ON picking(staff_id);
CREATE INDEX IF NOT EXISTS idx_picking_assigned_to ON picking(assigned_to);
CREATE INDEX IF NOT EXISTS idx_picking_status_zone ON picking(status, zone);

CREATE INDEX IF NOT EXISTS idx_staff_role_status ON staff(role, status);
CREATE INDEX IF NOT EXISTS idx_customers_type_status ON customers(type, status);

-- =====================================================================
-- Triggers
-- =====================================================================
DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_picking_updated_at ON picking;
CREATE TRIGGER trg_picking_updated_at BEFORE UPDATE ON picking
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_staff_updated_at ON staff;
CREATE TRIGGER trg_staff_updated_at BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_products_slug ON products;
CREATE TRIGGER trg_products_slug BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW WHEN (NEW.slug IS NULL OR btrim(NEW.slug) = '')
  EXECUTE FUNCTION public.set_entity_slug();
DROP TRIGGER IF EXISTS trg_customers_slug ON customers;
CREATE TRIGGER trg_customers_slug BEFORE INSERT OR UPDATE ON customers
  FOR EACH ROW WHEN (NEW.slug IS NULL OR btrim(NEW.slug) = '')
  EXECUTE FUNCTION public.set_entity_slug();
DROP TRIGGER IF EXISTS trg_orders_slug ON orders;
CREATE TRIGGER trg_orders_slug BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW WHEN (NEW.slug IS NULL OR btrim(NEW.slug) = '')
  EXECUTE FUNCTION public.set_entity_slug();
DROP TRIGGER IF EXISTS trg_picking_slug ON picking;
CREATE TRIGGER trg_picking_slug BEFORE INSERT OR UPDATE ON picking
  FOR EACH ROW WHEN (NEW.slug IS NULL OR btrim(NEW.slug) = '')
  EXECUTE FUNCTION public.set_entity_slug();
DROP TRIGGER IF EXISTS trg_staff_slug ON staff;
CREATE TRIGGER trg_staff_slug BEFORE INSERT OR UPDATE ON staff
  FOR EACH ROW WHEN (NEW.slug IS NULL OR btrim(NEW.slug) = '')
  EXECUTE FUNCTION public.set_entity_slug();
