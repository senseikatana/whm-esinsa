# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adherido a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
