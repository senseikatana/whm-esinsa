# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adherido a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.1] - 2026-11-12

Maintenance release with 3 changes.

- 🔹 ]7;file://localhost/home/senseikatana/Proyectos/next/whm-esinsafeat: environment variables and db setup scripts updated `089a2cd`
  - `.env.example`
  - `AGENTS.md`
  - `README.md`
  - `app/api/auth-config/route.ts`
  - `app/api/files/[key]/route.ts`
  - `app/api/files/route.ts`
  - `app/api/graphql/resolvers.ts`
  - `app/api/helper.ts`
  - `app/lib/auth-options.ts`
  - `app/lib/auth.ts`
  - `app/lib/db.ts`
  - `app/lib/drizzle.ts`
  - `app/lib/env.ts`
  - `app/lib/repositories/crud.ts`
  - `app/lib/schema.ts`
  - `app/lib/services/base.ts`
  - `app/lib/table-columns.ts`
  - `app/lib/tables.ts`
  - `docs/AUTH.md`
  - `drizzle.config.ts`
  - `nub.lock`
  - `package.json`
  - `scripts/check-env.ts`
  - `scripts/db-migrate.ts`
  - `scripts/seed.ts`
- 🔹 ]7;file://localhost/home/senseikatana/Proyectos/next/whm-esinsafeat: update documentation and configuration files to reflect changes in ar `38a26af`
  - `.env.example`
  - `.gitignore`
  - `AGENTS.md`
  - `CONTRIBUTING.md`
  - `README.md`
  - `app/App.tsx`
  - `app/api/auth-config/route.ts`
  - `app/api/auth/[...all]/route.ts`
  - `app/api/customers/[id]/route.ts`
  - `app/api/customers/route.ts`
  - `app/api/files/[key]/route.ts`
  - `app/api/files/route.ts`
  - `app/api/graphql/resolvers.ts`
  - `app/api/graphql/route.ts`
  - `app/api/helper.ts`
  - `app/api/orders/[id]/route.ts`
  - `app/api/orders/route.ts`
  - `app/api/picking-tasks/[id]/route.ts`
  - `app/api/picking-tasks/route.ts`
  - `app/api/products/[id]/route.ts`
  - `app/api/products/route.ts`
  - `app/api/staff/[id]/route.ts`
  - `app/api/staff/route.ts`
  - `app/components/DesktopDashboardView.tsx`
  - `app/components/LoginPage.tsx`
  - `app/interfaces/auth.ts`
  - `app/layout.tsx`
  - `app/lib/api-auth.ts`
  - `app/lib/auth-client.ts`
  - `app/lib/auth-context.tsx`
  - `app/lib/auth-options.ts`
  - `app/lib/auth.ts`
  - `app/lib/db.ts`
  - `app/lib/file-limits.ts`
  - `app/lib/index.ts`
  - `app/lib/insforge.ts`
  - `app/lib/seeds/accounts.ts`
  - `app/lib/seeds/users.ts`
  - `app/lib/services/base.ts`
  - `app/lib/storage.ts`
  - `app/lib/table-columns.ts`
  - `biome.json`
  - `cloudflare-worker/.gitignore`
  - `cloudflare-worker/AGENTS.md`
  - `cloudflare-worker/README.md`
  - `cloudflare-worker/worker.ts`
  - `cloudflare-worker/wrangler.toml`
  - `db/migrations/0001_warehouse_schema.sql`
  - `db/migrations/0002_user_profiles_view.sql`
  - `db/seeds/001_seed_warehouse_data.sql`
  - `db/seeds/002_seed_esinsa_catalog.sql`
  - `db/seeds/003_backfill_links.sql`
  - `docs/AUTH.md`
  - `migrations/20260901084243_create-warehouse-tables.sql`
  - `migrations/20260901090937_seed-warehouse-data.sql`
  - `migrations/20260901120956_create-user-roles.sql`
  - `migrations/20260901122700_add-slug-columns.sql`
  - `migrations/20260901153856_setup-realtime.sql`
  - `migrations/20260919090000_add-warehouse-integrity.sql`
  - `migrations/20260919090500_fix-realtime-coverage.sql`
  - `migrations/20260919091000_seed-esinsa-catalog.sql`
  - `next.config.ts`
  - `nub.lock`
  - `package.json`
  - `scripts/db-migrate.ts`
  - `scripts/seed.ts`
- 🔹 ]7;file://localhost/home/senseikatana/Proyectos/next/whm-esinsafix: update lucide-react to ^1.72.0 `3a7ae43`
  - `nub.lock`
  - `package.json`
- 🔹 ]7;file://localhost/home/senseikatana/Proyectos/next/whm-esinsafeat(package.json): remove bun and nub lockfiles `87eef86`
- 🚀 feat: implement warehouse migration scripts and schema changes for warehous `dd7181b`

## [0.8.0] - 2026-11-12

### Changed

- Backend migrado de InsForge (caído) a **Neon Postgres 17** con `pg` y pool único (`app/lib/db.ts`).
- Autenticación migrada a **Better Auth 1.7**: email/password, Google y GitHub; sesión httpOnly de 7 días.
- CRUD de `products`, `customers`, `orders`, `picking` y `staff` reescrito con SQL parametrizado y allowlist de columnas.
- Adjuntos (`files`) pasan de object storage de InsForge a tabla Postgres con límite de 5 MB.
- Esquema y seeds movidos a `db/migrations/` y `db/seeds/`, con runner idempotente (`bun run db:setup`).
- El login muestra las cuentas demo desde `app/lib/seeds/accounts.ts` y deshabilita los botones OAuth sin credenciales.
- Todos los route handlers exigen sesión; el rol `viewer` no puede escribir.
- **Drizzle ORM 0.45**: schema tipado (`app/lib/schema.ts`), cliente (`app/lib/drizzle.ts`) y repositorio único (`app/lib/repositories/crud.ts`).
- `nub run env:check` valida variables, conexión y presencia del esquema.
- Pool lazy: `next build` ya no requiere `DATABASE_URL`; el error aparece al primer query.
- `DISABLE_PUBLIC_SIGNUP` para cerrar el registro; contraseñas mínimo 8.
- Migraciones con advisory lock y `DATABASE_URL_UNPOOLED`.
- Eliminados el proxy de Cloudflare y las migraciones/esquema de InsForge.

### Fixed

- El SDK apuntaba a `http://localhost:7130` cuando faltaban las env vars, por eso fallaban login, registro y SSO.
- Las credenciales de prueba ahora existen de verdad como usuarios de auth.
- Se silencia el hydration mismatch provocado por extensiones del navegador (`suppressHydrationWarning`).

## [0.7.0] - 2026-11-12

Highlights: feat: implement warehouse migration scripts and schema changes for warehous, plus 1 more change.

- 🔹 ]7;file://localhost/home/senseikatana/Proyectos/next/whm-esinsafeat(package.json): remove bun and nub lockfiles `87eef86`
  - `bun.lock`
  - `nub.lock`
  - `package.json`
- 🚀 feat: implement warehouse migration scripts and schema changes for warehous `dd7181b`
  - `.biomeignore`
  - `.env.example`
  - `.gitignore`
  - `AGENTS.md`
  - `CONTRIBUTING.md`
  - `LICENSE`
  - `README.md`
  - `app/App.tsx`
  - `app/api/customers/[id]/route.ts`
  - `app/api/customers/route.ts`
  - `app/api/graphql/resolvers.ts`
  - `app/api/graphql/route.ts`
  - `app/api/graphql/schema.ts`
  - `app/api/helper.ts`
  - `app/api/orders/[id]/route.ts`
  - `app/api/orders/route.ts`
  - `app/api/picking-tasks/[id]/route.ts`
  - `app/api/picking-tasks/route.ts`
  - `app/api/products/[id]/route.ts`
  - `app/api/products/route.ts`
  - `app/assets/hero.png`
  - `app/assets/react.svg`
  - `app/assets/vite.svg`
  - `app/components/AuthModal.tsx`
  - `app/components/CrudView.tsx`
  - `app/components/DesktopDashboardView.tsx`
  - `app/components/FileUpload.tsx`
  - `app/components/KpiCard.tsx`
  - `app/components/LoginPage.tsx`
  - `app/components/MobileAppSimulator.tsx`
  - `app/components/RoutesView.tsx`
  - `app/components/SapIntegrationView.tsx`
  - `app/components/SidebarItem.tsx`
  - `app/components/VoicePickingView.tsx`
  - `app/components/WhatsAppAgentView.tsx`
  - `app/components/index.ts`
  - `app/favicon.ico`
  - `app/globals.css`
  - `app/interfaces/api.ts`
  - `app/interfaces/auth.ts`
  - `app/interfaces/components.ts`
  - `app/interfaces/crud.ts`
  - `app/interfaces/entities.ts`
  - `app/interfaces/index.ts`
  - `app/interfaces/storage.ts`
  - `app/layout.tsx`
  - `app/lib/apis/graphql-client.ts`
  - `app/lib/apis/index.ts`
  - `app/lib/apis/warehouse.api.ts`
  - `app/lib/apollo.ts`
  - `app/lib/auth-context.tsx`
  - `app/lib/auth.ts`
  - `app/lib/base-path.ts`
  - `app/lib/index.ts`
  - `app/lib/insforge.ts`
  - `app/lib/normalize.ts`
  - `app/lib/queries.ts`
  - `app/lib/seeds/customers.ts`
  - `app/lib/seeds/index.ts`
  - `app/lib/seeds/orders.ts`
  - `app/lib/seeds/picking.ts`
  - `app/lib/seeds/products.ts`
  - `app/lib/seeds/staff.ts`
  - `app/lib/seeds/users.ts`
  - `app/lib/services/api-error.ts`
  - `app/lib/services/api-manager.ts`
  - `app/lib/services/base.ts`
  - `app/lib/services/customers.ts`
  - `app/lib/services/index.ts`
  - `app/lib/services/orders.ts`
  - `app/lib/services/picking.ts`
  - `app/lib/services/products.ts`
  - `app/lib/services/slugify.service.ts`
  - `app/lib/services/staff.ts`
  - `app/lib/storage.ts`
  - `app/page.tsx`
  - `app/providers.tsx`
  - `app/utils/ai-api.ts`
  - `app/utils/index.ts`
  - `app/utils/sku-generator.ts`
  - `biome.json`
  - `bun.lock`
  - `cloudflare-worker/.gitignore`
  - `cloudflare-worker/AGENTS.md`
  - `cloudflare-worker/README.md`
  - `cloudflare-worker/worker.ts`
  - `cloudflare-worker/wrangler.toml`
  - `docs/AUTH.md`
  - `migrations/20260901084243_create-warehouse-tables.sql`
  - `migrations/20260901090937_seed-warehouse-data.sql`
  - `migrations/20260901120956_create-user-roles.sql`
  - `migrations/20260901122700_add-slug-columns.sql`
  - `migrations/20260901153856_setup-realtime.sql`
  - `migrations/20260919090000_add-warehouse-integrity.sql`
  - `migrations/20260919090500_fix-realtime-coverage.sql`
  - `migrations/20260919091000_seed-esinsa-catalog.sql`
  - `next.config.ts`
  - `package.json`
  - `postcss.config.mjs`
  - `public/file.svg`
  - `public/globe.svg`
  - `public/next.svg`
  - `public/vercel.svg`
  - `public/window.svg`
  - `tsconfig.json`

## [0.6.0] — 2026-09-01

### Añadido

- Dynamic basePath: un solo build sirve en subpath y raíz
- DeepSeek AI: migrado de Gemini, integrado en CRUD y copilot
- Realtime: 5 canales con triggers en InsForge
- Interfaces centralizadas en `app/interfaces/`
- Asistencia IA en modales CRUD (auto-completar)
- Normalización snake_case → camelCase para datos del backend

### Eliminado

- Vista móvil (MobileAppSimulator) del header y render
- Gemini API — reemplazado por DeepSeek

### Corregido

- `.env.local` con valores reales de InsForge
- `loadData` causaba bucle infinito (useCallback fix)
- Flasheo en carga inicial
- Scripts de package.json corregidos

## [0.4.0] — 2026-09-01

### Añadido

#### GraphQL + Apollo
- Apollo Server 5 como servidor GraphQL en `/api/graphql`
- Apollo Client 4 para el frontend con `ApolloProvider`
- Schema GraphQL completo con tipos: `Product`, `Customer`, `Order`, `PickingTask`, `Staff`, `DashboardStats`
- Queries con filtros, paginación y búsqueda por slug
- Mutations CRUD completo con batch delete por slugs
- Multi-resource queries: dashboard completo en una sola llamada GraphQL
- Introspection habilitada para desarrollo

#### API Manager (patrón del gist)
- `ApiManager` singleton con configuración de APIs, endpoints y path params
- `warehouse.api.ts` con typed helpers: `productsApi`, `customersApi`, `ordersApi`, `pickingApi`, `staffApi`
- `graphql-client.ts` con `graphqlQuery()`, `loadDashboard()`, `loadInventoryWithAlerts()`
- HTTP shortcuts: `get`, `post`, `put`, `patch`, `delete`
- URL builder con path params (`:slug`, `:id`) y query params

#### Slugify SEO-friendly
- `slugify()` — genera slugs limpios con normalización Unicode
- `uniqueSlug()` — slugs con sufijo aleatorio
- `productSlug()` — slugs para productos basados en categoría + nombre
- `orderSlug()` — slugs para órdenes con fecha
- `isValidSlug()` — validación de formato slug
- Columnas `slug` añadidas a todas las tablas con índices únicos

#### Autenticación
- `auth.ts` con signUp, signIn, signOut, getCurrentUser, resendVerification
- `auth-context.tsx` con AuthProvider y useAuth hook
- `AuthModal.tsx` — modal de login/registro con verificación de email
- Tabla `user_profiles` con roles: admin, manager, supervisor, operator, picker, viewer
- RLS policies: usuarios ven su perfil, admins ven todos
- Trigger auto-crea perfil al registrarse
- Google SSO documentado en `docs/AUTH.md`

#### Storage
- Bucket `warehouse-files` (privado) en InsForge
- `storage.ts` con uploadFile, uploadFileAuto, downloadFile, deleteFile
- `FileUpload.tsx` — componente de subida con drag & drop

#### API Routes REST
- `/api/products` — GET, POST
- `/api/products/[id]` — PUT, DELETE
- `/api/customers` — GET, POST
- `/api/customers/[id]` — PUT, DELETE
- `/api/orders` — GET, POST
- `/api/orders/[id]` — PUT, DELETE
- `/api/picking-tasks` — GET, POST
- `/api/picking-tasks/[id]` — PUT, DELETE
- Helper compartido con InsForge SDK

#### Cloudflare Worker
- Proxy reverso: `senseikatana.com/works/whm-withnext/*` → InsForge
- Landing page en `senseikatana.com/`
- TypeScript tipado con `Env`, `WorkerHandler`
- `wrangler.toml` con rutas configuradas

#### Scripts y DevOps
- Scripts de Cloudflare: `worker:dev`, `worker:deploy`, `worker:tail`
- Scripts de InsForge: `insforge:db`, `insforge:migrate`, `insforge:secrets`, `insforge:deploy`
- Scripts combinados con `concurrently`: `deploy`, `deploy:full`
- `wrangler` y `concurrently` como devDependencies

### Cambiado

- CRUD ahora usa slugs en vez de IDs (SEO-friendly)
- GraphQL schema usa `slug` como identificador en queries y mutations
- API routes helper reescrito con `Promise.allSettled` para manejo robusto de errores
- `AuthProvider` con manejo de errores robusto (`.catch()`, `.finally()`)
- `globals.css` con `color-scheme: dark` forzado
- `layout.tsx` con `style={{ background: "#0a0a0a" }}` inline para evitar flashing
- Biome scripts actualizados a `@latest` para evitar bug de `stringWidth`
- `tsconfig.json` excluye `cloudflare-worker/` del build

### Eliminado

- Dependencias `convex` y `@convex-dev/react-query`
- Directorio vacío `app/convex/`
- Archivos Vite leftover

### Corregido

- Hydration mismatch del botón Gemini (localStorage en SSR)
- Flashing en carga inicial (fondo blanco → oscuro)
- `useButtonType` warnings en todos los botones (23 instancias)
- API routes devolvían HTML en vez de JSON en 404
- Biome corrompía archivos de API routes al formatear
- Errores de importación en `app/lib/` (ApiError, ApiEndpoint, etc.)

## [0.1.0] — 2026-09-01

### Añadido

#### Backend — InsForge
- Integración completa con InsForge como backend (PostgreSQL, Auth, Storage)
- Cliente SDK inicializado en `app/lib/insforge.ts`
- Migración de base de datos con 5 tablas: `products`, `customers`, `orders`, `picking`, `staff`
- Datos semilla para todas las tablas
- Servicios CRUD genéricos con operaciones: list, getById, create, update, remove, removeBatch

#### UI — Filtros y Batch Delete
- Filtros de búsqueda por texto en CrudView
- Filtros por dropdown para campos de tipo `select` (status, categoría, tipo)
- Contador de filtros activos con badge
- Checkbox multi-select en tabla con "select all"
- Barra de batch delete con confirmación
- Integración de batch delete en todas las vistas CRUD

#### Dashboard
- Estado vacío cuando no hay datos: mensaje informativo + contadores en 0
- KPI cards muestran "—" cuando no hay datos
- Gráfico y logs ocultos hasta tener datos reales

#### Documentación
- README.md completo con stack, estructura, scripts y despliegue
- CONTRIBUTING.md con guías de desarrollo, convenciones y flujo de trabajo
- CHANGELOG.md (este archivo)

### Cambiado

- Migrado de Firebase a InsForge como backend
- Migrado de Vite a Next.js 16 (App Router)
- Componentes modularizados en `app/components/`
- Dashboard usa datos reales en vez de hardcoded

### Eliminado

- Firebase y todas sus dependencias
- Archivos Vite leftover (`main.tsx`, `index.css`, `App.css`, `index.html`)
- `firebase-debug.log` (añadido a `.gitignore`)
- Convex dependencies (no se usaban)

### Corregido

- Biome.json actualizado a schema 2.5.11 con migración automática
- PostCSS simplificado para Tailwind CSS v4
- Errores de TypeScript en todos los archivos
- Accibilidad: keyboard handlers en elementos interactivos
- SSR: `localStorage` protegido contra acceso en servidor

## [0.0.1] — 2026-07-26

### Añadido
- Inicialización del proyecto con Next.js 16
- Configuración base de Tailwind CSS 4
- Estructura de componentes modular
- Integración inicial con Firebase (posteriormente eliminada)
