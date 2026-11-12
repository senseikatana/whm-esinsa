-- ESINSA catalog seed (expanded).
--
-- Idempotent: ON CONFLICT DO NOTHING for natural-keyed tables and a NOT EXISTS
-- guard for staff (no unique key on name). Re-runnable on a fresh or existing DB;
-- never overwrites operational rows that already exist.
--
-- Products keep the legacy NUT0004001-4029 and SKU-00x identifiers so existing
-- rows/documents remain valid, and add ESINSA gasket families (spiral wound,
-- kammprofile, RTJ, graphite, PTFE, copper, ASTM A193 bolting) plus warehouse
-- consumables. Column values follow the domain catalogue in
-- withastro/src/data/productsCatalog.ts.

-- Products
INSERT INTO public.products (sku, name, category, stock, min_stock, location, price)
VALUES
  ('NUT0004001', 'Junta espiralada 316L DN50 PN16', 'Espirometálicas', 120, 40, 'A-01-01', 14.75),
  ('NUT0004002', 'Junta espiralada 316L DN80 PN16', 'Espirometálicas', 95, 30, 'A-01-02', 18.4),
  ('NUT0004003', 'Junta espiralada 316L DN100 PN16', 'Espirometálicas', 60, 25, 'A-01-03', 23.9),
  ('NUT0004004', 'Junta espiralada 316L DN150 PN16', 'Espirometálicas', 18, 20, 'A-02-01', 36.2),
  ('NUT0004005', 'Junta grafito flexible DN25', 'Grafito Puro', 200, 80, 'A-05-01', 8.45),
  ('NUT0004006', 'Junta grafito flexible DN50', 'Grafito Puro', 180, 70, 'A-05-02', 11.6),
  ('NUT0004007', 'Junta grafito flexible DN100', 'Grafito Puro', 55, 60, 'A-05-03', 18.9),
  ('NUT0004008', 'Junta PTFE DN40', 'PTFE Fluoropolímero', 140, 50, 'B-01-01', 9.7),
  ('NUT0004009', 'Junta PTFE DN80', 'PTFE Fluoropolímero', 75, 30, 'B-01-02', 14.3),
  ('NUT0004010', 'Junta kammprofile DN150', 'Kammprofile', 25, 12, 'A-03-01', 42.8),
  ('NUT0004011', 'Junta kammprofile DN200', 'Kammprofile', 8, 15, 'A-03-02', 58.6),
  ('NUT0004012', 'Junta metálica RTJ R24', 'RTJ Metálica', 30, 15, 'A-04-01', 24.5),
  ('NUT0004013', 'Junta metálica RTJ R31', 'RTJ Metálica', 6, 12, 'A-04-02', 31.2),
  ('NUT0004014', 'Junta cobre recocido DN20', 'Cobre Industrial', 250, 100, 'B-02-01', 5.4),
  ('NUT0004015', 'Junta cobre recocido DN50', 'Cobre Industrial', 160, 60, 'B-02-02', 9.85),
  ('NUT0004016', 'Espárrago ASTM A193 B7 M12x80', 'Tornillería B7/2H', 500, 200, 'B-04-01', 2.35),
  ('NUT0004017', 'Espárrago ASTM A193 B7 M16x100', 'Tornillería B7/2H', 420, 150, 'B-04-02', 4.1),
  ('NUT0004018', 'Espárrago ASTM A193 B7 M20x120', 'Tornillería B7/2H', 300, 120, 'B-04-03', 6.75),
  ('NUT0004019', 'Espárrago ASTM A193 B8M M16x100', 'Tornillería Inox', 180, 60, 'B-05-01', 5.2),
  ('NUT0004020', 'Espárrago ASTM A193 B16 M24x150', 'Tornillería Inox', 35, 40, 'B-05-02', 12.6),
  ('NUT0004021', 'Tuerca hexagonal 2H M12', 'Tuercas 2H/8M', 800, 300, 'B-06-01', 0.95),
  ('NUT0004022', 'Tuerca hexagonal 2H M16', 'Tuercas 2H/8M', 700, 250, 'B-06-02', 1.65),
  ('NUT0004023', 'Tuerca hexagonal 8M M16', 'Tuercas 2H/8M', 450, 150, 'B-06-03', 1.8),
  ('NUT0004024', 'Varilla roscada B7 M12 (1 m)', 'Materia Prima Corte', 120, 40, 'C-01-01', 4.9),
  ('NUT0004025', 'Plancha acero al carbono 2000x1000x3 mm', 'Materia Prima Corte', 45, 20, 'C-02-01', 38),
  ('NUT0004026', 'Plancha inox 316L 3000x1500x2 mm', 'Materia Prima Corte', 5, 10, 'C-02-02', 145),
  ('NUT0004027', 'Plancha cobre 2000x1000x1,5 mm', 'Materia Prima Corte', 18, 8, 'C-02-03', 92.5),
  ('NUT0004028', 'Cubrebridas PTFE DN50', 'Seguridad Industrial', 60, 25, 'C-03-01', 24.9),
  ('NUT0004029', 'Cubrebridas PTFE DN100', 'Seguridad Industrial', 35, 15, 'C-03-02', 36.4),
  ('NUT0004030', 'Junta espiralada 316L DN15 PN16', 'Espirometálicas', 240, 80, 'A-01-04', 6.4),
  ('NUT0004031', 'Junta espiralada 316L DN25 PN16', 'Espirometálicas', 210, 70, 'A-01-05', 7.8),
  ('NUT0004032', 'Junta espiralada 316L DN40 PN16', 'Espirometálicas', 160, 55, 'A-01-06', 9.1),
  ('NUT0004033', 'Junta espiralada 316L DN200 PN16', 'Espirometálicas', 22, 15, 'A-02-02', 44.5),
  ('NUT0004034', 'Junta espiralada 316L DN250 PN16', 'Espirometálicas', 12, 8, 'A-02-03', 56),
  ('NUT0004035', 'Junta espiralada 316L DN300 PN16', 'Espirometálicas', 6, 6, 'A-02-04', 72.3),
  ('NUT0004036', 'Junta espiralada 316L DN100 PN40', 'Espirometálicas', 34, 20, 'A-02-05', 28.6),
  ('NUT0004037', 'Junta espiralada 316L DN150 PN40', 'Espirometálicas', 16, 12, 'A-02-06', 41.2),
  ('NUT0004038', 'Junta espiralada 316L DN50 Clase 150', 'Espirometálicas', 130, 40, 'A-01-07', 12.9),
  ('NUT0004039', 'Junta espiralada 316L DN80 Clase 300', 'Espirometálicas', 48, 20, 'A-03-03', 21.75),
  ('NUT0004040', 'Junta espiralada 316L DN100 Clase 300', 'Espirometálicas', 26, 15, 'A-03-04', 27.4),
  ('NUT0004041', 'Junta kammprofile DN25', 'Kammprofile', 60, 20, 'A-03-05', 14.3),
  ('NUT0004042', 'Junta kammprofile DN50', 'Kammprofile', 45, 18, 'A-03-06', 18.6),
  ('NUT0004043', 'Junta kammprofile DN80', 'Kammprofile', 38, 15, 'A-03-07', 24.1),
  ('NUT0004044', 'Junta kammprofile DN100', 'Kammprofile', 30, 14, 'A-03-08', 29.8),
  ('NUT0004045', 'Junta kammprofile DN250', 'Kammprofile', 10, 6, 'A-03-09', 68.5),
  ('NUT0004046', 'Junta metálica RTJ R16', 'RTJ Metálica', 55, 20, 'A-04-03', 11.2),
  ('NUT0004047', 'Junta metálica RTJ R20', 'RTJ Metálica', 40, 15, 'A-04-04', 13.4),
  ('NUT0004048', 'Junta metálica RTJ R27', 'RTJ Metálica', 25, 12, 'A-04-05', 18.9),
  ('NUT0004049', 'Junta metálica RTJ R35', 'RTJ Metálica', 14, 10, 'A-04-06', 26.5),
  ('NUT0004050', 'Junta metálica RTJ R46', 'RTJ Metálica', 5, 6, 'A-04-07', 47.3),
  ('NUT0004051', 'Junta grafito flexible DN15', 'Grafito Puro', 320, 100, 'A-05-04', 6.9),
  ('NUT0004052', 'Junta grafito flexible DN20', 'Grafito Puro', 280, 90, 'A-05-05', 7.6),
  ('NUT0004053', 'Junta grafito flexible DN32', 'Grafito Puro', 210, 70, 'A-05-06', 9.4),
  ('NUT0004054', 'Junta grafito flexible DN40', 'Grafito Puro', 190, 60, 'A-05-07', 10.8),
  ('NUT0004055', 'Junta grafito flexible DN80', 'Grafito Puro', 100, 40, 'A-05-08', 15.6),
  ('NUT0004056', 'Junta grafito flexible DN150', 'Grafito Puro', 48, 25, 'A-05-09', 24.9),
  ('NUT0004057', 'Junta PTFE DN15', 'PTFE Fluoropolímero', 260, 80, 'B-01-03', 5.8),
  ('NUT0004058', 'Junta PTFE DN20', 'PTFE Fluoropolímero', 230, 75, 'B-01-04', 6.5),
  ('NUT0004059', 'Junta PTFE DN25', 'PTFE Fluoropolímero', 200, 65, 'B-01-05', 7.2),
  ('NUT0004060', 'Junta PTFE DN50', 'PTFE Fluoropolímero', 130, 45, 'B-01-06', 10.6),
  ('NUT0004061', 'Junta PTFE DN100', 'PTFE Fluoropolímero', 50, 25, 'B-01-07', 19.4),
  ('NUT0004062', 'Junta PTFE DN150', 'PTFE Fluoropolímero', 24, 15, 'B-01-08', 28.7),
  ('NUT0004063', 'Junta cobre recocido DN6', 'Cobre Industrial', 400, 150, 'B-02-03', 3.1),
  ('NUT0004064', 'Junta cobre recocido DN10', 'Cobre Industrial', 350, 120, 'B-02-04', 3.8),
  ('NUT0004065', 'Junta cobre recocido DN15', 'Cobre Industrial', 300, 100, 'B-02-05', 4.5),
  ('NUT0004066', 'Junta cobre recocido DN25', 'Cobre Industrial', 270, 90, 'B-02-06', 5.9),
  ('NUT0004067', 'Junta cobre recocido DN32', 'Cobre Industrial', 190, 70, 'B-02-07', 7.1),
  ('NUT0004068', 'Junta cobre recocido DN65', 'Cobre Industrial', 90, 35, 'B-02-08', 11.6),
  ('NUT0004069', 'Espárrago ASTM A193 B7 M10x60', 'Tornillería B7/2H', 600, 200, 'B-03-01', 1.85),
  ('NUT0004070', 'Espárrago ASTM A193 B7 M12x60', 'Tornillería B7/2H', 550, 200, 'B-03-02', 2.1),
  ('NUT0004071', 'Espárrago ASTM A193 B7 M16x80', 'Tornillería B7/2H', 480, 160, 'B-04-04', 3.4),
  ('NUT0004072', 'Espárrago ASTM A193 B7 M20x100', 'Tornillería B7/2H', 350, 120, 'B-04-05', 5.2),
  ('NUT0004073', 'Espárrago ASTM A193 B7 M24x130', 'Tornillería B7/2H', 220, 80, 'B-04-06', 8.9),
  ('NUT0004074', 'Espárrago ASTM A193 B7 M24x150', 'Tornillería B7/2H', 140, 50, 'B-04-07', 10.4),
  ('NUT0004075', 'Espárrago ASTM A193 B16 M20x110', 'Tornillería Inox', 90, 35, 'B-04-08', 9.75),
  ('NUT0004076', 'Espárrago ASTM A193 B8M M10x60', 'Tornillería Inox', 380, 120, 'B-05-03', 2.6),
  ('NUT0004077', 'Espárrago ASTM A193 B8M M12x70', 'Tornillería Inox', 320, 100, 'B-05-04', 3.1),
  ('NUT0004078', 'Espárrago ASTM A193 B8M M16x90', 'Tornillería Inox', 240, 80, 'B-05-05', 4.7),
  ('NUT0004079', 'Espárrago ASTM A193 B8M M20x130', 'Tornillería Inox', 130, 50, 'B-05-06', 7.9),
  ('NUT0004080', 'Espárrago ASTM A193 B8M M24x160', 'Tornillería Inox', 80, 30, 'B-05-07', 11.5),
  ('NUT0004081', 'Tuerca hexagonal 2H M10', 'Tuercas 2H/8M', 900, 300, 'B-06-04', 0.85),
  ('NUT0004082', 'Tuerca hexagonal 2H M20', 'Tuercas 2H/8M', 500, 180, 'B-06-05', 2.4),
  ('NUT0004083', 'Tuerca hexagonal 2H M24', 'Tuercas 2H/8M', 380, 140, 'B-06-06', 3.6),
  ('NUT0004084', 'Tuerca hexagonal 8M M10', 'Tuercas 2H/8M', 420, 140, 'B-07-01', 1.1),
  ('NUT0004085', 'Tuerca hexagonal 8M M12', 'Tuercas 2H/8M', 400, 130, 'B-07-02', 1.35),
  ('NUT0004086', 'Tuerca hexagonal 8M M20', 'Tuercas 2H/8M', 260, 90, 'B-07-03', 2.9),
  ('NUT0004087', 'Tuerca hexagonal 8M M24', 'Tuercas 2H/8M', 180, 70, 'B-07-04', 4.2),
  ('NUT0004088', 'Varilla roscada B7 M16 (1 m)', 'Materia Prima Corte', 95, 30, 'C-01-02', 6.8),
  ('NUT0004089', 'Varilla roscada B8M M16 (1 m)', 'Materia Prima Corte', 70, 25, 'C-01-03', 9.6),
  ('NUT0004090', 'Plancha inox 316L 3000x1500x3 mm', 'Materia Prima Corte', 12, 8, 'C-02-04', 210),
  ('NUT0004091', 'Plancha inox 316L 2000x1000x1,5 mm', 'Materia Prima Corte', 20, 10, 'C-02-05', 96.5),
  ('NUT0004092', 'Rollo grafito armado 1500x1500x1,5 mm', 'Materia Prima Corte', 25, 10, 'C-02-06', 88),
  ('NUT0004093', 'Rollo PTFE virgen 1500x1500x2 mm', 'Materia Prima Corte', 18, 8, 'C-02-07', 132),
  ('NUT0004094', 'Cubrebridas PTFE DN25', 'Seguridad Industrial', 40, 15, 'C-03-03', 22.4),
  ('NUT0004095', 'Cubrebridas PTFE DN80', 'Seguridad Industrial', 30, 12, 'C-03-04', 31.6),
  ('NUT0004096', 'Cubrebridas PTFE DN150', 'Seguridad Industrial', 14, 8, 'C-03-05', 49.9),
  ('SKU-001', 'Palet Europeo 120x80', 'Palets', 450, 100, 'D-01-01', 12.5),
  ('SKU-002', 'Caja Cartón 60x40x40', 'Embalaje', 2500, 500, 'D-01-02', 1.2),
  ('SKU-003', 'Film Estirable 500mm', 'Embalaje', 180, 50, 'D-01-03', 18.9),
  ('SKU-004', 'Etiquetas Térmicas 100x150', 'Etiquetado', 95, 30, 'D-02-01', 25),
  ('SKU-005', 'Cinta Adhesiva 50mm', 'Embalaje', 8, 20, 'D-02-02', 2.5),
  ('SKU-006', 'Transpaleta Manual 2500kg', 'Equipamiento', 12, 5, 'D-03-01', 285),
  ('SKU-008', 'Contenedor Plástico 60L', 'Almacenaje', 320, 100, 'D-03-02', 15.5),
  ('SKU-009', 'Guantes Trabajo Talla L', 'EPI', 145, 50, 'D-04-01', 28),
  ('SKU-011', 'Scanner Código Barras', 'Tecnología', 25, 10, 'D-05-01', 85),
  ('SKU-012', 'PDA Industrial Zebra', 'Tecnología', 18, 8, 'D-05-02', 1250)
ON CONFLICT (sku) DO NOTHING;

-- Customers / suppliers / carriers
INSERT INTO public.customers (code, name, type, email, phone, status)
VALUES
  ('CUST001', 'Mercadona S.A.', 'Cliente', 'pedidos@mercadona.es', '+34 900 123 456', 'Activo'),
  ('CUST002', 'Carrefour España', 'Cliente', 'compras@carrefour.es', '+34 900 234 567', 'Activo'),
  ('CUST003', 'El Corte Inglés', 'Cliente', 'logistica@elcorteingles.es', '+34 900 345 678', 'Activo'),
  ('SUPP001', 'Distribuciones García SL', 'Proveedor', 'ventas@distgarcia.com', '+34 963 123 456', 'Activo'),
  ('SUPP002', 'Logística Martínez', 'Proveedor', 'info@logmartinez.es', '+34 932 234 567', 'Activo'),
  ('CLI010', 'Repsol Química S.A.', 'Cliente', 'compras.quimica@repsol.com', '+34 910 100 100', 'Activo'),
  ('CLI011', 'Dow Chemical Ibérica S.L.', 'Cliente', 'compras.iberia@dow.com', '+34 977 559 000', 'Activo'),
  ('CLI012', 'BASF Española S.L.', 'Cliente', 'pedidos.es@basf.com', '+34 934 969 000', 'Activo'),
  ('CLI013', 'Cepsa Química S.A.', 'Cliente', 'suministros@cepsa.com', '+34 913 377 000', 'Activo'),
  ('CLI014', 'MASA Mantenimiento Industrial', 'Cliente', 'compras@masa.es', '+34 977 000 100', 'Activo'),
  ('CLI015', 'Ercros S.A.', 'Cliente', 'compras@ercros.es', '+34 934 393 000', 'Activo'),
  ('CLI016', 'Iqoxe S.L.', 'Cliente', 'mantenimiento@iqoxe.com', '+34 977 000 200', 'Activo'),
  ('CLI017', 'Messer Ibérica de Gases S.A.', 'Cliente', 'pedidos@messer.es', '+34 977 000 300', 'Activo'),
  ('CLI018', 'Air Liquide España S.A.', 'Cliente', 'suministros@airliquide.com', '+34 915 300 900', 'Activo'),
  ('CLI019', 'Enagás S.A.', 'Cliente', 'compras@enagas.es', '+34 910 000 400', 'Activo'),
  ('CLI020', 'Petronor S.A.', 'Cliente', 'almacen@petronor.es', '+34 946 000 500', 'Activo'),
  ('CLI021', 'CLH Compañía Logística de Hidrocarburos', 'Cliente', 'compras@clh.es', '+34 910 000 600', 'Pendiente'),
  ('SUPP010', 'Novus (Flexitallic)', 'Proveedor', 'ventas@novus.es', '+34 910 000 700', 'Activo'),
  ('SUPP011', 'Klinger Ibérica S.A.', 'Proveedor', 'pedidos@klinger.es', '+34 930 000 800', 'Activo'),
  ('SUPP012', 'Garlock España S.L.', 'Proveedor', 'ventas@garlock.es', '+34 930 000 900', 'Activo'),
  ('SUPP013', 'Lamons Ibérica S.L.', 'Proveedor', 'info@lamons.es', '+34 930 001 000', 'Activo'),
  ('SUPP014', 'Aceros Inox Tarragona', 'Proveedor', 'compras@acerosinox.es', '+34 977 100 200', 'Activo'),
  ('TRAN001', 'Transportes Logísticos Riu Clar S.L.', 'Transportista', 'trafico@transriuclar.es', '+34 977 000 900', 'Activo')
ON CONFLICT (code) DO NOTHING;

-- Orders (outbound PED-* + inbound REC-*), dated across ~6 weeks
INSERT INTO public.orders (order_number, customer_name, status, priority, total_items, total_value, created_at)
VALUES
  ('PED-2026-001', 'Mercadona S.A.', 'Pendiente', 'high', 3, 1850.5, now() - interval '42 days'),
  ('PED-2026-002', 'Carrefour España', 'Picking', 'normal', 5, 3250, now() - interval '40 days'),
  ('PED-2026-003', 'El Corte Inglés', 'Pendiente', 'normal', 2, 890, now() - interval '38 days'),
  ('PED-2026-004', 'Mercadona S.A.', 'Packing', 'high', 4, 2100, now() - interval '35 days'),
  ('PED-2026-005', 'Carrefour España', 'Despachado', 'normal', 6, 4500, now() - interval '33 days'),
  ('PED-2026-006', 'El Corte Inglés', 'Pendiente', 'high', 8, 6750, now() - interval '30 days'),
  ('PED-2026-007', 'Repsol Química S.A.', 'Pendiente', 'high', 4, 3240, now() - interval '28 days'),
  ('PED-2026-008', 'Dow Chemical Ibérica S.L.', 'Picking', 'normal', 6, 4180.5, now() - interval '26 days'),
  ('PED-2026-009', 'BASF Española S.L.', 'Packing', 'normal', 3, 1560, now() - interval '25 days'),
  ('PED-2026-010', 'Cepsa Química S.A.', 'Despachado', 'high', 8, 6240.75, now() - interval '24 days'),
  ('PED-2026-011', 'MASA Mantenimiento Industrial', 'Pendiente', 'normal', 2, 740, now() - interval '22 days'),
  ('PED-2026-012', 'Ercros S.A.', 'Despachado', 'normal', 5, 2890, now() - interval '21 days'),
  ('PED-2026-013', 'Iqoxe S.L.', 'Picking', 'normal', 4, 1980, now() - interval '20 days'),
  ('PED-2026-014', 'Messer Ibérica de Gases S.A.', 'Completado', 'normal', 3, 1250, now() - interval '18 days'),
  ('PED-2026-015', 'Air Liquide España S.A.', 'Pendiente', 'urgent', 10, 7480, now() - interval '16 days'),
  ('PED-2026-016', 'Enagás S.A.', 'Packing', 'high', 7, 5120, now() - interval '15 days'),
  ('PED-2026-017', 'Petronor S.A.', 'Despachado', 'normal', 9, 6890, now() - interval '14 days'),
  ('PED-2026-018', 'CLH Compañía Logística de Hidrocarburos', 'Pendiente', 'normal', 4, 2310, now() - interval '12 days'),
  ('PED-2026-019', 'Repsol Química S.A.', 'Completado', 'high', 6, 4390, now() - interval '11 days'),
  ('PED-2026-020', 'Dow Chemical Ibérica S.L.', 'Pendiente', 'normal', 5, 3620, now() - interval '10 days'),
  ('PED-2026-021', 'BASF Española S.L.', 'Picking', 'normal', 3, 1420, now() - interval '9 days'),
  ('PED-2026-022', 'Cepsa Química S.A.', 'Packing', 'high', 8, 5980, now() - interval '8 days'),
  ('PED-2026-023', 'MASA Mantenimiento Industrial', 'Despachado', 'normal', 2, 680, now() - interval '7 days'),
  ('PED-2026-024', 'Ercros S.A.', 'Pendiente', 'low', 3, 1150, now() - interval '6 days'),
  ('PED-2026-025', 'Iqoxe S.L.', 'Completado', 'normal', 4, 2070, now() - interval '5 days'),
  ('PED-2026-026', 'Air Liquide España S.A.', 'Picking', 'urgent', 12, 8930, now() - interval '4 days'),
  ('PED-2026-027', 'Enagás S.A.', 'Pendiente', 'high', 6, 4610, now() - interval '3 days'),
  ('PED-2026-028', 'Petronor S.A.', 'Packing', 'normal', 7, 5240, now() - interval '2 days'),
  ('PED-2026-029', 'Mercadona S.A.', 'Despachado', 'normal', 6, 4500, now() - interval '1 days'),
  ('PED-2026-030', 'Carrefour España', 'Completado', 'normal', 5, 3250, now() - interval '1 days'),
  ('REC-2026-001', 'Distribuciones García SL', 'Pendiente', 'normal', 12, 1450, now() - interval '37 days'),
  ('REC-2026-002', 'Logística Martínez', 'Completado', 'normal', 24, 3800, now() - interval '29 days'),
  ('REC-2026-003', 'Novus (Flexitallic)', 'Completado', 'normal', 18, 2450, now() - interval '27 days'),
  ('REC-2026-004', 'Klinger Ibérica S.A.', 'Pendiente', 'normal', 12, 1620, now() - interval '23 days'),
  ('REC-2026-005', 'Garlock España S.L.', 'Control de Calidad', 'normal', 8, 1180, now() - interval '19 days'),
  ('REC-2026-006', 'Lamons Ibérica S.L.', 'Pendiente', 'high', 15, 2210, now() - interval '17 days'),
  ('REC-2026-007', 'Aceros Inox Tarragona', 'Completado', 'normal', 22, 3840, now() - interval '13 days'),
  ('REC-2026-008', 'Distribuciones García SL', 'Pendiente', 'normal', 10, 1350, now() - interval '9 days'),
  ('REC-2026-009', 'Logística Martínez', 'Completado', 'normal', 24, 3800, now() - interval '8 days'),
  ('REC-2026-010', 'Novus (Flexitallic)', 'Control de Calidad', 'normal', 20, 2790, now() - interval '6 days'),
  ('REC-2026-011', 'Klinger Ibérica S.A.', 'Pendiente', 'normal', 14, 1930, now() - interval '4 days'),
  ('REC-2026-012', 'Garlock España S.L.', 'Completado', 'normal', 9, 1320, now() - interval '3 days'),
  ('REC-2026-013', 'Lamons Ibérica S.L.', 'Pendiente', 'normal', 16, 2380, now() - interval '2 days'),
  ('REC-2026-014', 'Aceros Inox Tarragona', 'Control de Calidad', 'normal', 26, 4120, now() - interval '1 days')
ON CONFLICT (order_number) DO NOTHING;

-- Picking tasks (FKs to orders/staff are resolved by trg_picking_resolve_refs)
INSERT INTO public.picking (task_number, order_number, assigned_to, zone, status, total_items, picked_items)
VALUES
  ('PICK-001', 'PED-2026-001', 'Carlos Ruiz', 'A', 'Pendiente', 3, 0),
  ('PICK-002', 'PED-2026-002', 'María López', 'B', 'En Proceso', 5, 2),
  ('PICK-003', 'PED-2026-003', 'Carlos Ruiz', 'C', 'Pendiente', 2, 0),
  ('PICK-004', 'PED-2026-004', 'Pedro Sánchez', 'A', 'En Proceso', 4, 1),
  ('PICK-005', 'PED-2026-005', 'Lucía Fernández', 'B', 'Completado', 6, 6),
  ('PICK-006', 'PED-2026-006', 'Juan Torres', 'C', 'Pendiente', 8, 0),
  ('PICK-007', 'PED-2026-007', 'David Moreno', 'A', 'En Proceso', 4, 2),
  ('PICK-008', 'PED-2026-008', 'Marta Vidal', 'B', 'Pendiente', 6, 0),
  ('PICK-009', 'PED-2026-009', 'Javier Ortega', 'C', 'Completado', 3, 3),
  ('PICK-010', 'PED-2026-010', 'Pedro Sánchez', 'A', 'En Proceso', 8, 5),
  ('PICK-011', 'PED-2026-011', 'Juan Torres', 'B', 'Pendiente', 2, 0),
  ('PICK-012', 'PED-2026-012', 'Lucía Fernández', 'C', 'Completado', 5, 5),
  ('PICK-013', 'PED-2026-013', 'David Moreno', 'A', 'Pendiente', 4, 0),
  ('PICK-014', 'PED-2026-014', 'Marta Vidal', 'B', 'Completado', 3, 3),
  ('PICK-015', 'PED-2026-015', 'Javier Ortega', 'C', 'En Proceso', 10, 4),
  ('PICK-016', 'PED-2026-016', 'Pedro Sánchez', 'A', 'En Proceso', 7, 6),
  ('PICK-017', 'PED-2026-017', 'Juan Torres', 'B', 'Completado', 9, 9),
  ('PICK-018', 'PED-2026-018', 'Lucía Fernández', 'C', 'Pendiente', 4, 0),
  ('PICK-019', 'PED-2026-019', 'David Moreno', 'A', 'Completado', 6, 6),
  ('PICK-020', 'PED-2026-020', 'Marta Vidal', 'B', 'En Proceso', 5, 2),
  ('PICK-021', 'PED-2026-021', 'Javier Ortega', 'C', 'Pendiente', 3, 0),
  ('PICK-022', 'PED-2026-022', 'Pedro Sánchez', 'A', 'En Proceso', 8, 3),
  ('PICK-023', 'PED-2026-023', 'Juan Torres', 'B', 'Completado', 2, 2),
  ('PICK-024', 'PED-2026-024', 'Lucía Fernández', 'C', 'Pendiente', 3, 0),
  ('PICK-025', 'PED-2026-025', 'David Moreno', 'A', 'En Proceso', 4, 1),
  ('PICK-026', 'PED-2026-026', 'Marta Vidal', 'B', 'Pendiente', 12, 0),
  ('PICK-027', 'PED-2026-027', 'Javier Ortega', 'C', 'En Proceso', 6, 2),
  ('PICK-028', 'PED-2026-028', 'Pedro Sánchez', 'A', 'Completado', 7, 7),
  ('PICK-029', 'PED-2026-029', 'Juan Torres', 'B', 'Completado', 6, 6),
  ('PICK-030', 'PED-2026-030', 'Lucía Fernández', 'C', 'Completado', 5, 5)
ON CONFLICT (task_number) DO NOTHING;

-- Staff (no natural unique key: insert only missing names)
INSERT INTO public.staff (name, role, zone, status)
SELECT v.name, v.role, v.zone, v.status
FROM (
VALUES
  ('Juan García', 'Administrador', 'Oficina', 'Activo'),
  ('María López', 'Operario', 'Zona B', 'En Ruta'),
  ('Carlos Ruiz', 'Operario', 'Zona A', 'Activo'),
  ('Ana Martínez', 'Operario', 'Zona C', 'Inactivo'),
  ('Sergio Jurado', 'Supervisor', 'Oficina', 'Activo'),
  ('Laura Martínez', 'Administrador', 'Oficina', 'Activo'),
  ('Pedro Sánchez', 'Picker', 'Zona A', 'Activo'),
  ('Juan Torres', 'Picker', 'Zona B', 'Activo'),
  ('Lucía Fernández', 'Picker', 'Zona C', 'Activo'),
  ('David Moreno', 'Operario', 'Zona D', 'Activo'),
  ('Marta Vidal', 'Operario', 'Taller Corte', 'Activo'),
  ('Javier Ortega', 'Operario', 'Muelles', 'En Ruta'),
  ('Andrés Molina', 'Mantenimiento', 'Taller Corte', 'Activo')
) AS v(name, role, zone, status)
WHERE NOT EXISTS (SELECT 1 FROM public.staff s WHERE s.name = v.name);

-- Final FK reconciliation (covers rows created before the resolver triggers).
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
