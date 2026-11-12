# WarehouseFlow SGA

Sistema de Gestión de Almacén (SGA) enterprise construido con Next.js 16, React 19, Tailwind CSS 4 e InsForge como backend.

## Descripción

WarehouseFlow es una aplicación web completa para la gestión de operaciones de almacén que incluye:

- **Dashboard operativo** con KPIs en tiempo real
- **Gestión de inventario** con clases ABC y ubicaciones
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
| Framework | Next.js 16.2 (App Router) |
| UI | React 19.2, Tailwind CSS 4, Lucide Icons |
| Backend | InsForge (PostgreSQL, Auth, Storage) |
| Lenguaje | TypeScript 5.9 |
| Linting | Biome 2.5 |
| Package Manager | Bun |
| IA | Gemini API (opcional) |

## Requisitos previos

- [Bun](https://bun.sh/) ≥ 1.0
- [InsForge CLI](https://insforge.dev) (para gestión del backend)
- Node.js ≥ 18 (para InsForge CLI)

## Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd whm-withnext

# Instalar dependencias
bun install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de InsForge

# Ejecutar en desarrollo
bun dev
```

## Variables de entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `NEXT_PUBLIC_INSFORGE_URL` | URL del proyecto InsForge | Sí |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Anon key de InsForge | Sí |

## Scripts disponibles

```bash
bun dev          # Servidor de desarrollo
bun build        # Build de producción
bun start        # Servidor de producción
bun lint         # Verificar errores con Biome
bun lint:fix     # Corregir errores automáticamente
bun format       # Verificar formato
bun format:fix   # Corregir formato automáticamente
bun check        # Verificar lint + formato
bun check:fix    # Corregir todo automáticamente
```

## Estructura del proyecto

```
whm-withnext/
├── app/
│   ├── App.tsx                    # Componente principal de la aplicación
│   ├── page.tsx                   # Entry point (Next.js)
│   ├── layout.tsx                 # Layout raíz
│   ├── globals.css                # Estilos globales (Tailwind)
│   ├── components/                # Componentes UI modulares
│   │   ├── CrudView.tsx           # Tabla CRUD genérica con filtros y batch delete
│   │   ├── DesktopDashboardView.tsx # Dashboard principal
│   │   ├── KpiCard.tsx            # Tarjeta de KPI
│   │   ├── SidebarItem.tsx        # Item del sidebar
│   │   ├── VoicePickingView.tsx   # Picking guiado por voz
│   │   ├── RoutesView.tsx         # Gestión de rutas
│   │   ├── WhatsAppAgentView.tsx  # Agente WhatsApp IA
│   │   ├── SapIntegrationView.tsx # Integración SAP
│   │   └── MobileAppSimulator.tsx # Simulador PDA
│   ├── lib/                       # Lógica de negocio
│   │   ├── insforge.ts            # Cliente InsForge SDK
│   │   ├── seeds/                 # Datos semilla
│   │   │   ├── products.ts
│   │   │   ├── customers.ts
│   │   │   ├── orders.ts
│   │   │   ├── picking.ts
│   │   │   └── staff.ts
│   │   └── services/              # Servicios CRUD
│   │       ├── base.ts            # Servicio base genérico
│   │       ├── products.ts
│   │       ├── customers.ts
│   │       ├── orders.ts
│   │       ├── picking.ts
│   │       └── staff.ts
│   └── utils/                     # Utilidades
│       ├── ai-api.ts              # Helper de IA (Gemini / DeepSeek)
│       └── sku-generator.ts       # Generador de SKUs
├── migrations/                    # Migraciones de base de datos
├── public/                        # Assets estáticos
├── biome.json                     # Configuración de Biome
├── postcss.config.mjs             # Configuración de PostCSS
├── tsconfig.json                  # Configuración de TypeScript
└── package.json
```

## Base de datos

El proyecto usa InsForge (PostgreSQL) con las siguientes tablas:

| Tabla | Descripción |
|-------|-------------|
| `products` | Inventario de productos con SKU, stock y ubicación |
| `customers` | Clientes y proveedores |
| `orders` | Órdenes de entrada (recepción) y salida (expedición) |
| `picking` | Tareas de picking asignadas a operarios |
| `staff` | Personal del almacén y sus roles |

### Migraciones

```bash
# Crear nueva migración
bunx @insforge/cli db migrations new <nombre>

# Aplicar migraciones pendientes
bunx @insforge/cli db migrations up --all

# Ejecutar query directa
bunx @insforge/cli db query "SELECT * FROM products"
```

## Autenticación

### Métodos de login

| Método | Descripción |
|--------|-------------|
| Email/Password | Login tradicional con email y contraseña |
| Google OAuth | Login con cuenta de Google |
| GitHub OAuth | Login con cuenta de GitHub |

### Usuarios de prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@esinsa.com | admin123 | Administrador |
| gerente@esinsa.com | gerente123 | Gerente |
| supervisor@esinsa.com | super123 | Supervisor |
| operario1@esinsa.com | opera123 | Operario |
| picker1@esinsa.com | picker123 | Picker |
| viewer@esinsa.com | viewer123 | Visor |

### Roles y permisos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `admin` | Administrador | Acceso total al sistema |
| `manager` | Gerente | Gestión operativa, reportes |
| `supervisor` | Supervisor | Supervisión de operaciones y personal |
| `operator` | Operario | Inventario, recepciones, expediciones |
| `picker` | Picker | Solo picking |
| `viewer` | Visor | Solo lectura del dashboard |

### Configurar OAuth

Para habilitar Google y GitHub OAuth:

1. Ve al dashboard de InsForge → **Authentication → Providers**
2. Habilita **Google** y **GitHub**
3. Configura los Client ID y Client Secret de cada provider
4. Las redirect URIs deben incluir:
   - `https://8cc79ec9.ap-southeast.insforge.app/auth/callback/google`
   - `https://whm.senseikatana.com/auth/callback/google`
   - `https://8cc79ec9.ap-southeast.insforge.app/auth/callback/github`
   - `https://whm.senseikatana.com/auth/callback/github`

## CI/CD

### GitHub Actions

El proyecto usa GitHub Actions para CI/CD automático. En cada push a `main`:

1. **Lint & Build** — verifica que el código pasa Biome y compila
2. **Deploy to InsForge** — despliega el frontend
3. **Deploy Cloudflare Worker** — despliega el proxy

### Configurar secrets de GitHub

Ve a **Settings → Secrets and variables → Actions** y añade:

| Secret | Descripción |
|--------|-------------|
| `NEXT_PUBLIC_INSFORGE_URL` | URL de InsForge (`https://8cc79ec9.ap-southeast.insforge.app`) |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Anon key de InsForge |
| `INSFORGE_ACCESS_TOKEN` | Token de acceso de InsForge |
| `CLOUDFLARE_API_TOKEN` | API token de Cloudflare |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID de Cloudflare |

### Obtener tokens

```bash
# InsForge access token
npx -y @insforge/cli@latest secrets get API_KEY

# Cloudflare: ve a dash.cloudflare.com → My Profile → API Tokens
```

### Flujo

```
Push / PR        → GitHub Actions → Lint + Build (sin deploy)
Manual dispatch  → GitHub Actions → Lint + Build → Deploy InsForge + Worker
```

Los deploys automáticos quedaron deshabilitados hasta que el repo tenga los secrets `INSFORGE_ACCESS_TOKEN` y `CLOUDFLARE_API_TOKEN`. Por ahora se lanzan a mano:

```bash
gh workflow run deploy.yml -R senseikatana/whm-admin
```

## Despliegue

### Scripts disponibles

```bash
bun run build          # Build de producción
bun run db:deploy      # Desplegar frontend a InsForge
bun run worker:deploy  # Desplegar Worker a Cloudflare
bun run deploy         # Build + Worker en paralelo
bun run deploy:full    # InsForge + Worker en paralelo
```

### ⚠️ Importante: NO usar domains attach

La app se sirve en `https://whm.senseikatana.com` mediante el Cloudflare Worker `whm-withnext-proxy` (upstream `https://8cc79ec9.insforge.site`). **NO ejecutar** estos comandos porque sobreescriben los registros DNS y rompen el Worker:

```bash
# ❌ NO USAR - Sobreescribe DNS del Worker
npx @insforge/cli domains attach senseikatana.com
npx @insforge/cli domains dns sync senseikatana.com
```

### Flujo de deploy correcto

```bash
# 1. Deploy del frontend a InsForge
bun run db:deploy

# 2. Deploy del Worker a Cloudflare
bun run worker:deploy
```

| Email | Contraseña | Rol |
| --- | --- | --- |
| admin@esinsa.com | admin123 | Administrador |
| gerente@esinsa.com | gerente123 | Gerente |
| supervisor@esinsa.com | super123 | Supervisor |
| operario1@esinsa.com | opera123 | Operario |
| picker1@esinsa.com | picker123 | Picker |
| viewer@esinsa.com | viewer123 | Visor |

## Contribuir

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para las guías de contribución.

## Changelog

Ver [CHANGELOG.md](./CHANGELOG.md) para el historial de cambios.

## Licencia

© 2026 ESINSA — WarehouseFlow SGA. Todos los derechos reservados.
