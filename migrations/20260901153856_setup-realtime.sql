-- Realtime channels for WarehouseFlow SGA

-- 1. Create channel patterns
INSERT INTO realtime.channels (pattern, description, enabled)
VALUES
  ('products:%', 'Product stock and status changes', true),
  ('orders:%', 'Order status updates', true),
  ('picking:%', 'Picking task progress', true),
  ('dashboard', 'Dashboard stats updates', true),
  ('inventory', 'Inventory level changes', true)
ON CONFLICT (pattern) DO UPDATE
SET description = EXCLUDED.description,
    enabled = EXCLUDED.enabled;

-- 2. Publish function for products
CREATE OR REPLACE FUNCTION public.notify_product_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.publish(
    'products:' || NEW.id::text,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN TG_OP = 'DELETE' THEN 'deleted'
      ELSE 'updated'
    END,
    jsonb_build_object(
      'id', NEW.id,
      'sku', NEW.sku,
      'name', NEW.name,
      'stock', NEW.stock,
      'category', NEW.category
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for products
CREATE TRIGGER product_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.notify_product_change();

-- 3. Publish function for orders
CREATE OR REPLACE FUNCTION public.notify_order_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.publish(
    'orders:' || NEW.id::text,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN TG_OP = 'DELETE' THEN 'deleted'
      ELSE 'status_changed'
    END,
    jsonb_build_object(
      'id', NEW.id,
      'order_number', NEW.order_number,
      'status', NEW.status,
      'customer_name', NEW.customer_name
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for orders
CREATE TRIGGER order_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.notify_order_change();

-- 4. Publish function for picking tasks
CREATE OR REPLACE FUNCTION public.notify_picking_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.publish(
    'picking:' || NEW.id::text,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN TG_OP = 'DELETE' THEN 'deleted'
      ELSE 'progress'
    END,
    jsonb_build_object(
      'id', NEW.id,
      'task_number', NEW.task_number,
      'status', NEW.status,
      'picked_items', NEW.picked_items,
      'total_items', NEW.total_items
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for picking
CREATE TRIGGER picking_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.picking
FOR EACH ROW EXECUTE FUNCTION public.notify_picking_change();

-- 5. Dashboard stats channel (published on any inventory/order change)
CREATE OR REPLACE FUNCTION public.notify_dashboard_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.publish(
    'dashboard',
    'stats_updated',
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'action', TG_OP,
      'timestamp', now()
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dashboard triggers
CREATE TRIGGER dashboard_products_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.notify_dashboard_update();

CREATE TRIGGER dashboard_orders_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.notify_dashboard_update();

-- 6. Inventory channel (stock changes)
CREATE OR REPLACE FUNCTION public.notify_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stock IS DISTINCT FROM NEW.stock THEN
    PERFORM realtime.publish(
      'inventory',
      'stock_changed',
      jsonb_build_object(
        'id', NEW.id,
        'sku', NEW.sku,
        'name', NEW.name,
        'old_stock', OLD.stock,
        'new_stock', NEW.stock,
        'min_stock', NEW.min_stock
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inventory trigger
CREATE TRIGGER inventory_change_trigger
AFTER UPDATE ON public.products
FOR EACH ROW
WHEN (OLD.stock IS DISTINCT FROM NEW.stock)
EXECUTE FUNCTION public.notify_inventory_change();
