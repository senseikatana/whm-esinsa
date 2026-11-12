-- Realtime coverage and DELETE correctness.
--
-- The functions created in 20260901153856 reference NEW.* unconditionally, so
-- DELETE events publish to a NULL channel (NEW is unassigned on DELETE) and are
-- effectively lost. Replace them with OLD/NEW-aware versions and add the
-- missing channels/triggers for customers and staff.

-- 1. Missing channel patterns (customers/staff had no pattern in the original seed)
INSERT INTO realtime.channels (pattern, description, enabled)
VALUES
  ('customers:%', 'Customer record changes', true),
  ('staff:%', 'Staff record changes', true)
ON CONFLICT (pattern) DO UPDATE
SET description = EXCLUDED.description,
    enabled = EXCLUDED.enabled;

-- 2. products: OLD/NEW aware
CREATE OR REPLACE FUNCTION public.notify_product_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_id BIGINT;
  v_sku TEXT;
  v_name TEXT;
  v_stock INTEGER;
  v_category TEXT;
  v_event TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_id := OLD.id; v_sku := OLD.sku; v_name := OLD.name;
    v_stock := OLD.stock; v_category := OLD.category; v_event := 'deleted';
  ELSE
    v_id := NEW.id; v_sku := NEW.sku; v_name := NEW.name;
    v_stock := NEW.stock; v_category := NEW.category;
    v_event := CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'updated' END;
  END IF;

  PERFORM realtime.publish(
    'products:' || v_id::text,
    v_event,
    jsonb_build_object(
      'id', v_id,
      'sku', v_sku,
      'name', v_name,
      'stock', v_stock,
      'category', v_category
    )
  );
  RETURN NULL;
END;
$$;

-- 3. orders: OLD/NEW aware
CREATE OR REPLACE FUNCTION public.notify_order_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_id BIGINT;
  v_order_number TEXT;
  v_status TEXT;
  v_customer_name TEXT;
  v_event TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_id := OLD.id; v_order_number := OLD.order_number;
    v_status := OLD.status; v_customer_name := OLD.customer_name; v_event := 'deleted';
  ELSE
    v_id := NEW.id; v_order_number := NEW.order_number;
    v_status := NEW.status; v_customer_name := NEW.customer_name;
    v_event := CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'status_changed' END;
  END IF;

  PERFORM realtime.publish(
    'orders:' || v_id::text,
    v_event,
    jsonb_build_object(
      'id', v_id,
      'order_number', v_order_number,
      'status', v_status,
      'customer_name', v_customer_name
    )
  );
  RETURN NULL;
END;
$$;

-- 4. picking: OLD/NEW aware
CREATE OR REPLACE FUNCTION public.notify_picking_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_id BIGINT;
  v_task_number TEXT;
  v_status TEXT;
  v_picked_items INTEGER;
  v_total_items INTEGER;
  v_event TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_id := OLD.id; v_task_number := OLD.task_number; v_status := OLD.status;
    v_picked_items := OLD.picked_items; v_total_items := OLD.total_items; v_event := 'deleted';
  ELSE
    v_id := NEW.id; v_task_number := NEW.task_number; v_status := NEW.status;
    v_picked_items := NEW.picked_items; v_total_items := NEW.total_items;
    v_event := CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'progress' END;
  END IF;

  PERFORM realtime.publish(
    'picking:' || v_id::text,
    v_event,
    jsonb_build_object(
      'id', v_id,
      'task_number', v_task_number,
      'status', v_status,
      'picked_items', v_picked_items,
      'total_items', v_total_items
    )
  );
  RETURN NULL;
END;
$$;

-- 5. customers: new channel + trigger
CREATE OR REPLACE FUNCTION public.notify_customer_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_id BIGINT;
  v_code TEXT;
  v_name TEXT;
  v_type TEXT;
  v_status TEXT;
  v_event TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_id := OLD.id; v_code := OLD.code; v_name := OLD.name;
    v_type := OLD.type; v_status := OLD.status; v_event := 'deleted';
  ELSE
    v_id := NEW.id; v_code := NEW.code; v_name := NEW.name;
    v_type := NEW.type; v_status := NEW.status;
    v_event := CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'updated' END;
  END IF;

  PERFORM realtime.publish(
    'customers:' || v_id::text,
    v_event,
    jsonb_build_object(
      'id', v_id,
      'code', v_code,
      'name', v_name,
      'type', v_type,
      'status', v_status
    )
  );
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS customer_change_trigger ON public.customers;
CREATE TRIGGER customer_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.notify_customer_change();

-- 6. staff: new channel + trigger
CREATE OR REPLACE FUNCTION public.notify_staff_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_id BIGINT;
  v_name TEXT;
  v_role TEXT;
  v_zone TEXT;
  v_status TEXT;
  v_event TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_id := OLD.id; v_name := OLD.name; v_role := OLD.role;
    v_zone := OLD.zone; v_status := OLD.status; v_event := 'deleted';
  ELSE
    v_id := NEW.id; v_name := NEW.name; v_role := NEW.role;
    v_zone := NEW.zone; v_status := NEW.status;
    v_event := CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'updated' END;
  END IF;

  PERFORM realtime.publish(
    'staff:' || v_id::text,
    v_event,
    jsonb_build_object(
      'id', v_id,
      'name', v_name,
      'role', v_role,
      'zone', v_zone,
      'status', v_status
    )
  );
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS staff_change_trigger ON public.staff;
CREATE TRIGGER staff_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.notify_staff_change();
