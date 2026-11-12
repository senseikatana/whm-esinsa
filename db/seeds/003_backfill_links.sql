-- Backfill denormalized text keys into their FK columns.
UPDATE orders o
SET customer_id = c.id
FROM customers c
WHERE o.customer_id IS NULL
  AND lower(btrim(c.name)) = lower(btrim(o.customer_name));

UPDATE picking p
SET order_id = o.id
FROM orders o
WHERE p.order_id IS NULL
  AND p.order_number = o.order_number;

UPDATE picking p
SET staff_id = s.id
FROM staff s
WHERE p.staff_id IS NULL
  AND lower(btrim(s.name)) = lower(btrim(p.assigned_to));
