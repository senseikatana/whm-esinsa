-- Seed data for WarehouseFlow SGA

-- Products / Inventory
INSERT INTO products (sku, name, category, stock, min_stock, location, price) VALUES
  ('SKU-001', 'Palet Europeo 120x80', 'Palets', 450, 100, 'A-01-01', 12.50),
  ('SKU-002', 'Caja Cartón 60x40x40', 'Embalaje', 2500, 500, 'A-02-03', 1.20),
  ('SKU-003', 'Film Estirable 500mm', 'Embalaje', 180, 50, 'B-05-02', 18.90),
  ('SKU-004', 'Etiquetas Térmicas 100x150', 'Etiquetado', 95, 30, 'B-03-01', 25.00),
  ('SKU-005', 'Cinta Adhesiva 50mm', 'Embalaje', 8, 20, 'A-04-02', 2.50),
  ('SKU-006', 'Transpaleta Manual 2500kg', 'Equipamiento', 12, 5, 'C-01-01', 285.00),
  ('SKU-008', 'Contenedor Plástico 60L', 'Almacenaje', 320, 100, 'B-08-03', 15.50),
  ('SKU-009', 'Guantes Trabajo Talla L', 'EPI', 145, 50, 'A-06-04', 28.00),
  ('SKU-011', 'Scanner Código Barras', 'Tecnología', 25, 10, 'C-05-02', 85.00),
  ('SKU-012', 'PDA Industrial Zebra', 'Tecnología', 18, 8, 'C-05-03', 1250.00)
ON CONFLICT (sku) DO NOTHING;

-- Customers / Suppliers
INSERT INTO customers (code, name, type, email, phone, status) VALUES
  ('CUST001', 'Mercadona S.A.', 'Cliente', 'pedidos@mercadona.es', '+34 900 123 456', 'Activo'),
  ('CUST002', 'Carrefour España', 'Cliente', 'compras@carrefour.es', '+34 900 234 567', 'Activo'),
  ('CUST003', 'El Corte Inglés', 'Cliente', 'logistica@elcorteingles.es', '+34 900 345 678', 'Activo'),
  ('SUPP001', 'Distribuciones García SL', 'Proveedor', 'ventas@distgarcia.com', '+34 963 123 456', 'Activo'),
  ('SUPP002', 'Logística Martínez', 'Proveedor', 'info@logmartinez.es', '+34 932 234 567', 'Activo')
ON CONFLICT (code) DO NOTHING;

-- Orders (outbound - client orders)
INSERT INTO orders (order_number, customer_name, status, priority, total_items, total_value) VALUES
  ('PED-2026-001', 'Mercadona S.A.', 'Pendiente', 'high', 3, 1850.50),
  ('PED-2026-002', 'Carrefour España', 'Picking', 'normal', 5, 3250.00),
  ('PED-2026-003', 'El Corte Inglés', 'Pendiente', 'normal', 2, 890.00),
  ('PED-2026-004', 'Mercadona S.A.', 'Packing', 'high', 4, 2100.00),
  ('PED-2026-005', 'Carrefour España', 'Despachado', 'normal', 6, 4500.00),
  ('PED-2026-006', 'El Corte Inglés', 'Pendiente', 'high', 8, 6750.00),
  ('REC-2026-001', 'Distribuciones García SL', 'Pendiente', 'normal', 12, 1450.00),
  ('REC-2026-002', 'Logística Martínez', 'Completado', 'normal', 24, 3800.00)
ON CONFLICT (order_number) DO NOTHING;

-- Picking tasks
INSERT INTO picking (task_number, order_number, assigned_to, zone, status, total_items, picked_items) VALUES
  ('PICK-001', 'PED-2026-001', 'Carlos Ruiz', 'A', 'Pendiente', 3, 0),
  ('PICK-002', 'PED-2026-002', 'María López', 'B', 'En Proceso', 5, 2),
  ('PICK-003', 'PED-2026-003', 'Carlos Ruiz', 'C', 'Pendiente', 2, 0)
ON CONFLICT (task_number) DO NOTHING;

-- Staff / Operators
INSERT INTO staff (name, role, zone, status) VALUES
  ('Juan García', 'Administrador', 'Oficina', 'Activo'),
  ('María López', 'Operario', 'Zona B', 'En Ruta'),
  ('Carlos Ruiz', 'Operario', 'Zona A', 'Activo'),
  ('Ana Martínez', 'Operario', 'Zona C', 'Inactivo');
