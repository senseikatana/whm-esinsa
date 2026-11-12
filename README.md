# WarehouseFlow SGA

Sistema de Gestión de Almacén (SGA) construido con Next.js 16, React 19, Tailwind CSS 4, **Neon Postgres** y **Better Auth**.

## Descripción

WarehouseFlow cubre las operaciones de un almacén:

- **Dashboard operativo** con KPIs
- **Gestión de inventario** con ubicaciones
- **Recepción y expedición** de mercancía
- **Picking por voz** guiado por IA
- **Gestión de rutas** internas
- **Agente WhatsApp** con IA conversacional
- **Integración SAP** ERP
- **CRM de clientes** y proveedores
- **Gestión de personal** y turnos
- **Simulador PDA** para terminales handheld

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16.4 (App Router, React Compiler) |
| UI | React 19.3, Tailwind CSS 4, Lucide Icons |
| Base de datos | Neon Postgres 17 (driver `pg`) |
| Autenticación | Better Auth 1.7 (email/password + Google + GitHub) |
| Almacenamiento | Adjuntos en Postgres (`files`), intercambiable por R2/S3 |
| Lenguaje | TypeScript 7 |
| Linting | Biome 2.6 |
| Package Manager | Nub 0.10 |
| IA | DeepSeek API (opcional, clave por usuario) |

## Requisitos previos

- [Nub](https://nubjs.com) ≥ 0.10 (o Bun ≥ 1.0)
- Un proyecto de [Neon](https://neon.tech) (o cualquier Postgres 15+)

## Instalación

```bash
nub install
cp .env.example .env.local
# Editar .env.local: DATABASE_URL y BETTER_AUTH_SECRET

# Crea las tablas de Better Auth, el esquema del WMS y los datos demo
nub run db:setup

nub run dev
```

La app queda en `http://localhost:3000`.

## Variables de entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `DATABASE_URL` | Connection string de Neon (pooled) | Sí |
| `BETTER_AUTH_SECRET` | Secreto de Better Auth (`openssl rand -base64 32`) | Sí |
| `BETTER_AUTH_URL` | URL pública base de la app | Sí |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Orígenes extra separados por coma | No |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth de Google | No |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | OAuth de GitHub | No |

Si un proveedor OAuth no tiene credenciales, su botón aparece deshabilitado en el login.

## Scripts disponibles

```bash
nub run dev            # Servidor de desarrollo
nub run build          # Build de producción
nub run start          # Servidor de producción
nub run lint           # Biome lint
nub run lint:fix       # Biome lint --write
nub run format         # Biome format
nub run check          # Biome check
nub run db:setup       # Auth tables + esquema + seeds + usuarios demo
nub run db:auth:migrate# Solo tablas de Better Auth
nub run db:migrate     # Solo db/migrations/*.sql
nub run db:seed        # Solo seeds + usuarios demo (idempotente)
```

## Estructura del proyecto

```
.
├── app/
│   ├── App.tsx                    # Componente principal (cliente)
│   ├── page.tsx / layout.tsx      # Entry point y layout raíz
│   ├── api/
│   │   ├── auth/[...all]/         # Handler de Better Auth
│   │   ├── auth-config/           # Proveedores OAuth habilitados
│   │   ├── files/                 # Subida/descarga de adjuntos
│   │   └── {products,customers,orders,picking-tasks}/  # CRUD
│   ├── components/                # UI modular (CrudView, dashboard, etc.)
│   ├── lib/
│   │   ├── auth.ts                # Instancia server de Better Auth
│   │   ├── auth-options.ts        # Config compartida (server y scripts)
│   │   ├── auth-client.ts         # Cliente React de Better Auth
│   │   ├── auth-context.tsx       # Provider de sesión
│   │   ├── api-auth.ts            # Guardas de sesión/roles
│   │   ├── db.ts                  # Pool de Postgres
│   │   ├── table-columns.ts       # Allowlist de columnas por tabla
│   │   └── seeds/                 # Datos semilla y cuentas demo
│   └── utils/
├── db/
│   ├── migrations/                # Esquema propio (0001, 0002...)
│   └── seeds/                     # Catálogo y backfills
├── scripts/
│   ├── db-migrate.ts              # Runner de migraciones
│   └── seed.ts                    # Seeds + usuarios demo
└── docs/
```

## Base de datos

Tablas propias:

| Tabla | Descripción |
|-------|-------------|
| `products` | Inventario con SKU, stock y ubicación |
| `customers` | Clientes, proveedores y transportistas |
| `orders` | Órdenes de entrada (REC-*) y salida (PED-*) |
| `picking` | Tareas de picking asignadas |
| `staff` | Personal del almacén |
| `files` | Adjuntos (5 MB máximo por archivo) |
| `user_profiles` | Vista sobre la tabla `user` de Better Auth |

Better Auth administra `user`, `session`, `account` y `verification`.

### Migraciones

Cada archivo de `db/migrations/*.sql` se aplica una sola vez y queda registrado en `schema_migrations`:

```bash
nub run db:migrate
```

## Autenticación

### Métodos de login

| Método | Descripción |
|--------|-------------|
| Email/Password | Sesión httpOnly con Better Auth |
| Google OAuth | Login con cuenta de Google |
| GitHub OAuth | Login con cuenta de GitHub |

### Usuarios de prueba

Creados por `nub run db:seed`:

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@esinsa.com | admin123 | Administrador |
| gerente@esinsa.com | gerente123 | Gerente |
| supervisor@esinsa.com | super123 | Supervisor |
| operario1@esinsa.com | opera123 | Operario |
| picker1@esinsa.com | picker123 | Picker |
| viewer@esinsa.com | viewer123 | Visor |

Las cuentas se registran automáticamente con rol `viewer` (solo lectura); el rol se administra en la base de datos, nunca desde el cliente.

### Roles y permisos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `admin` | Administrador | Acceso total |
| `manager` | Gerente | Operación y reportes |
| `supervisor` | Supervisor | Operaciones y personal |
| `operator` | Operario | Inventario, recepciones, expediciones |
| `picker` | Picker | Picking |
| `viewer` | Visor | Solo lectura (la API rechaza escrituras) |

### Configurar OAuth

**Google** (Google Cloud Console → Credentials → OAuth client):

- Authorized redirect URI: `https://<tu-dominio>/api/auth/callback/google`

**GitHub** (Settings → Developer settings → OAuth Apps):

- Authorization callback URL: `https://<tu-dominio>/api/auth/callback/github`

Luego cargá `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET` en el entorno del servidor y reiniciá. Para local usar `http://localhost:3000/api/auth/callback/{provider}`.

## Despliegue

Recomendado: **Vercel** (o cualquier host Node) + Neon.

1. Importá el repo en Vercel.
2. Configurá `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` y, si aplica, las credenciales OAuth.
3. Ejecutá `nub run db:setup` una vez contra la base de producción (o `db:migrate` + `db:seed`).
4. Agregá el dominio de producción como `BETTER_AUTH_URL` y en `BETTER_AUTH_TRUSTED_ORIGINS`.

> El proyecto Neon creado desde el agente es *claimable*: hay que reclamarlo desde el dashboard de Neon antes de que expire. Al reclamarlo, Neon rota la `DATABASE_URL`; actualizá el entorno con la nueva.

## Contribuir

Ver [CONTRIBUTING.md](./CONTRIBUTING.md).

## Changelog

Ver [CHANGELOG.md](./CHANGELOG.md).

## Licencia

© 2026 ESINSA — WarehouseFlow SGA. Todos los derechos reservados.
