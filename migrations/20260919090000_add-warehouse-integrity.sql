-- Warehouse integrity: updated_at maintenance, slug defaults, relational FKs,
-- CHECK constraints, query indexes and RLS policies.
--
-- Lock notes (production awareness):
--   * ADD COLUMN without DEFAULT is metadata-only since PG11 (fast).
--   * ENABLE ROW LEVEL SECURITY and ADD CONSTRAINT take brief ACCESS EXCLUSIVE locks.
--   * CHECK/FK constraints are added NOT VALID and then VALIDATED to keep the
--     ACCESS EXCLUSIVE window short; VALIDATE takes SHARE UPDATE EXCLUSIVE.
--   * CREATE INDEX (non-concurrent) blocks writes on the table while building.
--     Tables here are small; for large production tables build these indexes
--     CONCURRENTLY from a maintenance window instead.

-- =====================================================================
-- 1. updated_at maintenance
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

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_customers_updated_at ON public.customers;
CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_picking_updated_at ON public.picking;
CREATE TRIGGER trg_picking_updated_at
  BEFORE UPDATE ON public.picking
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_staff_updated_at ON public.staff;
CREATE TRIGGER trg_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- 2. Slug defaults
--    slug columns are NOT NULL with a UNIQUE index, but the CRUD service
--    (app/lib/services/base.ts) and direct SDK writes do not always send one.
--    Fill it server-side from the natural key of each entity.
-- =====================================================================
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
  -- Branching with IF/ELSIF (not CASE over NEW fields): PL/pgSQL parses every
  -- NEW.<field> reference in the expression against the trigger's row type, so
  -- a CASE would fail with "record new has no field ..." on other tables.
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

DROP TRIGGER IF EXISTS trg_products_slug ON public.products;
CREATE TRIGGER trg_products_slug
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW WHEN (NEW.slug IS NULL OR btrim(NEW.slug) = '')
  EXECUTE FUNCTION public.set_entity_slug();

DROP TRIGGER IF EXISTS trg_customers_slug ON public.customers;
CREATE TRIGGER trg_customers_slug
  BEFORE INSERT OR UPDATE ON public.customers
  FOR EACH ROW WHEN (NEW.slug IS NULL OR btrim(NEW.slug) = '')
  EXECUTE FUNCTION public.set_entity_slug();

DROP TRIGGER IF EXISTS trg_orders_slug ON public.orders;
CREATE TRIGGER trg_orders_slug
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW WHEN (NEW.slug IS NULL OR btrim(NEW.slug) = '')
  EXECUTE FUNCTION public.set_entity_slug();

DROP TRIGGER IF EXISTS trg_picking_slug ON public.picking;
CREATE TRIGGER trg_picking_slug
  BEFORE INSERT OR UPDATE ON public.picking
  FOR EACH ROW WHEN (NEW.slug IS NULL OR btrim(NEW.slug) = '')
  EXECUTE FUNCTION public.set_entity_slug();

DROP TRIGGER IF EXISTS trg_staff_slug ON public.staff;
CREATE TRIGGER trg_staff_slug
  BEFORE INSERT OR UPDATE ON public.staff
  FOR EACH ROW WHEN (NEW.slug IS NULL OR btrim(NEW.slug) = '')
  EXECUTE FUNCTION public.set_entity_slug();

-- =====================================================================
-- 3. Foreign keys
--    orders/picking store denormalized text today (customer_name,
--    order_number, assigned_to). Keep those columns for backward
--    compatibility and add nullable FK columns resolved automatically
--    from the text keys.
-- =====================================================================
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id BIGINT;
ALTER TABLE public.picking ADD COLUMN IF NOT EXISTS order_id BIGINT;
ALTER TABLE public.picking ADD COLUMN IF NOT EXISTS staff_id BIGINT;

COMMENT ON COLUMN public.orders.customer_id IS 'Resolved FK to customers(id); customer_name remains the display snapshot.';
COMMENT ON COLUMN public.picking.order_id IS 'Resolved FK to orders(id); order_number remains the display key.';
COMMENT ON COLUMN public.picking.staff_id IS 'Resolved FK to staff(id); assigned_to remains the display name.';

-- Backfill existing rows by name / natural key.
UPDATE public.orders o
SET customer_id = c.id
FROM public.customers c
WHERE o.customer_id IS NULL
  AND lower(btrim(c.name)) = lower(btrim(o.customer_name));

UPDATE public.picking p
SET order_id = o.id
FROM public.orders o
WHERE p.order_id IS NULL
  AND p.order_number = o.order_number;

UPDATE public.picking p
SET staff_id = s.id
FROM public.staff s
WHERE p.staff_id IS NULL
  AND lower(btrim(s.name)) = lower(btrim(p.assigned_to));

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_customer_id_fkey') THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_customer_id_fkey
      FOREIGN KEY (customer_id) REFERENCES public.customers(id)
      ON DELETE SET NULL NOT VALID;
    ALTER TABLE public.orders VALIDATE CONSTRAINT orders_customer_id_fkey;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'picking_order_id_fkey') THEN
    ALTER TABLE public.picking
      ADD CONSTRAINT picking_order_id_fkey
      FOREIGN KEY (order_id) REFERENCES public.orders(id)
      ON DELETE CASCADE NOT VALID;
    ALTER TABLE public.picking VALIDATE CONSTRAINT picking_order_id_fkey;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'picking_staff_id_fkey') THEN
    ALTER TABLE public.picking
      ADD CONSTRAINT picking_staff_id_fkey
      FOREIGN KEY (staff_id) REFERENCES public.staff(id)
      ON DELETE SET NULL NOT VALID;
    ALTER TABLE public.picking VALIDATE CONSTRAINT picking_staff_id_fkey;
  END IF;
END $$;

-- Resolve FK columns automatically so existing writers that only send the
-- text keys keep working (API routes, CRUD services, InsForge table editor).
CREATE OR REPLACE FUNCTION public.resolve_order_customer()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.customer_id IS NULL
     AND NEW.customer_name IS NOT NULL
     AND btrim(NEW.customer_name) <> '' THEN
    SELECT c.id INTO NEW.customer_id
    FROM public.customers c
    WHERE lower(btrim(c.name)) = lower(btrim(NEW.customer_name))
    ORDER BY c.id
    LIMIT 1;
  END IF;

  IF NEW.customer_id IS NOT NULL
     AND (NEW.customer_name IS NULL OR btrim(NEW.customer_name) = '') THEN
    SELECT c.name INTO NEW.customer_name
    FROM public.customers c
    WHERE c.id = NEW.customer_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_resolve_customer ON public.orders;
CREATE TRIGGER trg_orders_resolve_customer
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.resolve_order_customer();

CREATE OR REPLACE FUNCTION public.resolve_picking_refs()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_id IS NULL
     AND NEW.order_number IS NOT NULL
     AND btrim(NEW.order_number) <> '' THEN
    SELECT o.id INTO NEW.order_id
    FROM public.orders o
    WHERE o.order_number = NEW.order_number
    LIMIT 1;
  END IF;

  IF NEW.staff_id IS NULL
     AND NEW.assigned_to IS NOT NULL
     AND btrim(NEW.assigned_to) <> '' THEN
    SELECT s.id INTO NEW.staff_id
    FROM public.staff s
    WHERE lower(btrim(s.name)) = lower(btrim(NEW.assigned_to))
    ORDER BY s.id
    LIMIT 1;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_picking_resolve_refs ON public.picking;
CREATE TRIGGER trg_picking_resolve_refs
  BEFORE INSERT OR UPDATE ON public.picking
  FOR EACH ROW EXECUTE FUNCTION public.resolve_picking_refs();

-- =====================================================================
-- 4. CHECK constraints
--    Values below are the union of the UI selects and the current seed data
--    (App.tsx products/orders/staff forms, CrudView.tsx status colors).
-- =====================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_stock_non_negative') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_stock_non_negative CHECK (stock >= 0) NOT VALID;
    ALTER TABLE public.products VALIDATE CONSTRAINT products_stock_non_negative;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_min_stock_non_negative') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_min_stock_non_negative CHECK (min_stock >= 0) NOT VALID;
    ALTER TABLE public.products VALIDATE CONSTRAINT products_min_stock_non_negative;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_price_non_negative') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_price_non_negative CHECK (price >= 0) NOT VALID;
    ALTER TABLE public.products VALIDATE CONSTRAINT products_price_non_negative;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_total_items_non_negative') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_total_items_non_negative CHECK (total_items >= 0) NOT VALID;
    ALTER TABLE public.orders VALIDATE CONSTRAINT orders_total_items_non_negative;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_total_value_non_negative') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_total_value_non_negative CHECK (total_value >= 0) NOT VALID;
    ALTER TABLE public.orders VALIDATE CONSTRAINT orders_total_value_non_negative;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_priority_valid') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_priority_valid
      CHECK (priority IN ('low', 'normal', 'high', 'urgent')) NOT VALID;
    ALTER TABLE public.orders VALIDATE CONSTRAINT orders_priority_valid;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_status_valid') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_status_valid
      CHECK (status IN (
        'Pendiente', 'Control de Calidad', 'Picking', 'Packing',
        'Despachado', 'Completado', 'Recibido', 'Cancelado'
      )) NOT VALID;
    ALTER TABLE public.orders VALIDATE CONSTRAINT orders_status_valid;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'picking_total_items_non_negative') THEN
    ALTER TABLE public.picking ADD CONSTRAINT picking_total_items_non_negative CHECK (total_items >= 0) NOT VALID;
    ALTER TABLE public.picking VALIDATE CONSTRAINT picking_total_items_non_negative;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'picking_picked_items_non_negative') THEN
    ALTER TABLE public.picking ADD CONSTRAINT picking_picked_items_non_negative CHECK (picked_items >= 0) NOT VALID;
    ALTER TABLE public.picking VALIDATE CONSTRAINT picking_picked_items_non_negative;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'picking_status_valid') THEN
    ALTER TABLE public.picking ADD CONSTRAINT picking_status_valid
      CHECK (status IN ('Pendiente', 'En Proceso', 'Completado', 'Pausada', 'Cancelado')) NOT VALID;
    ALTER TABLE public.picking VALIDATE CONSTRAINT picking_status_valid;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_role_valid') THEN
    ALTER TABLE public.staff ADD CONSTRAINT staff_role_valid
      CHECK (role IN ('Administrador', 'Supervisor', 'Operario', 'Picker', 'Mantenimiento')) NOT VALID;
    ALTER TABLE public.staff VALIDATE CONSTRAINT staff_role_valid;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_status_valid') THEN
    ALTER TABLE public.staff ADD CONSTRAINT staff_status_valid
      CHECK (status IN ('Activo', 'Inactivo', 'En Ruta')) NOT VALID;
    ALTER TABLE public.staff VALIDATE CONSTRAINT staff_status_valid;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_type_valid') THEN
    ALTER TABLE public.customers ADD CONSTRAINT customers_type_valid
      CHECK (type IN ('Cliente', 'Proveedor', 'Transportista')) NOT VALID;
    ALTER TABLE public.customers VALIDATE CONSTRAINT customers_type_valid;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_status_valid') THEN
    ALTER TABLE public.customers ADD CONSTRAINT customers_status_valid
      CHECK (status IN ('Activo', 'Inactivo', 'Pendiente', 'Bloqueado')) NOT VALID;
    ALTER TABLE public.customers VALIDATE CONSTRAINT customers_status_valid;
  END IF;
END $$;

-- =====================================================================
-- 5. Indexes for the real access patterns
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_picking_order_id ON public.picking(order_id);
CREATE INDEX IF NOT EXISTS idx_picking_staff_id ON public.picking(staff_id);
CREATE INDEX IF NOT EXISTS idx_picking_assigned_to ON public.picking(assigned_to);
CREATE INDEX IF NOT EXISTS idx_picking_status_zone ON public.picking(status, zone);
CREATE INDEX IF NOT EXISTS idx_products_category_sku ON public.products(category, sku);
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON public.products(stock, min_stock) WHERE stock <= min_stock;
CREATE INDEX IF NOT EXISTS idx_customers_type_status ON public.customers(type, status);
CREATE INDEX IF NOT EXISTS idx_staff_role_status ON public.staff(role, status);

-- user_profiles.email is assumed unique by the app (auth identity), but the
-- table only has a non-unique lookup today. Guard the index so it is skipped
-- instead of failing the migration if duplicates already exist in production.
DO $$
BEGIN
  IF EXISTS (
    SELECT lower(email) FROM public.user_profiles
    GROUP BY lower(email) HAVING count(*) > 1
  ) THEN
    RAISE WARNING 'Skipping idx_user_profiles_email_unique: duplicate emails exist in user_profiles';
  ELSIF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_user_profiles_email_unique') THEN
    CREATE UNIQUE INDEX idx_user_profiles_email_unique ON public.user_profiles (lower(email));
  END IF;
END $$;

-- =====================================================================
-- 6. RLS
--    Warehouse tables are shared operational data: reads and the current
--    API routes (which talk to Postgres with the anon key, no forwarded
--    session) need anon access, so the enabled policies stay permissive
--    to preserve existing behavior. project_admin is included because the
--    InsForge CLI/migration role is not necessarily the table owner and
--    would otherwise be blocked by RLS on `db query`. Tighten writes to
--    `authenticated` after app/api/* forwards the user JWT.
-- =====================================================================
DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY['products', 'customers', 'orders', 'picking', 'staff'];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t AND policyname = 'warehouse_shared_select') THEN
      EXECUTE format('CREATE POLICY warehouse_shared_select ON public.%I FOR SELECT TO anon, authenticated, project_admin USING (true)', t);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t AND policyname = 'warehouse_shared_insert') THEN
      EXECUTE format('CREATE POLICY warehouse_shared_insert ON public.%I FOR INSERT TO anon, authenticated, project_admin WITH CHECK (true)', t);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t AND policyname = 'warehouse_shared_update') THEN
      EXECUTE format('CREATE POLICY warehouse_shared_update ON public.%I FOR UPDATE TO anon, authenticated, project_admin USING (true) WITH CHECK (true)', t);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t AND policyname = 'warehouse_shared_delete') THEN
      EXECUTE format('CREATE POLICY warehouse_shared_delete ON public.%I FOR DELETE TO anon, authenticated, project_admin USING (true)', t);
    END IF;
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.products,
  public.customers,
  public.orders,
  public.picking,
  public.staff
TO anon, authenticated, project_admin;

-- =====================================================================
-- 7. user_profiles policy fix
--    The admin policies created in 20260901120956 subquery user_profiles
--    from inside a policy on user_profiles, which makes PostgreSQL raise
--    "infinite recursion detected in policy for relation user_profiles"
--    for every authenticated read/write. Replace the subqueries with a
--    SECURITY DEFINER helper (bypasses RLS as table owner).
-- =====================================================================
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.is_active
  );
$$;

DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins can insert profiles" ON public.user_profiles;
CREATE POLICY "Admins can insert profiles"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.user_profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.user_profiles FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
