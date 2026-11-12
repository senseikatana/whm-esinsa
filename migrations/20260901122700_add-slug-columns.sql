-- Add slug columns for SEO-friendly URLs

-- Products: slug based on sku
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Customers: slug based on code
ALTER TABLE customers ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_customers_slug ON customers(slug);

-- Orders: slug based on order_number
ALTER TABLE orders ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_orders_slug ON orders(slug);

-- Picking: slug based on task_number
ALTER TABLE picking ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_picking_slug ON picking(slug);

-- Staff: slug based on name
ALTER TABLE staff ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_staff_slug ON staff(slug);

-- Update existing records with slugs
UPDATE products SET slug = LOWER(REPLACE(REPLACE(sku, ' ', '-'), '_', '-')) WHERE slug IS NULL;
UPDATE customers SET slug = LOWER(REPLACE(REPLACE(code, ' ', '-'), '_', '-')) WHERE slug IS NULL;
UPDATE orders SET slug = LOWER(REPLACE(REPLACE(order_number, ' ', '-'), '_', '-')) WHERE slug IS NULL;
UPDATE picking SET slug = LOWER(REPLACE(REPLACE(task_number, ' ', '-'), '_', '-')) WHERE slug IS NULL;
UPDATE staff SET slug = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), 'á', 'a'), 'é', 'e')) WHERE slug IS NULL;

-- Make slug NOT NULL after populating
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
ALTER TABLE customers ALTER COLUMN slug SET NOT NULL;
ALTER TABLE orders ALTER COLUMN slug SET NOT NULL;
ALTER TABLE picking ALTER COLUMN slug SET NOT NULL;
ALTER TABLE staff ALTER COLUMN slug SET NOT NULL;
