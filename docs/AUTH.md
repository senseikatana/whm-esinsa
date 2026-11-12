# Autenticación — WarehouseFlow SGA

## Roles de usuario

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `admin` | Administrador | Acceso total |
| `manager` | Gerente | Gestión operativa, reportes |
| `supervisor` | Supervisor | Supervisión de operaciones y personal |
| `operator` | Operario | Inventario, recepciones, expediciones |
| `picker` | Picker | Solo picking |
| `viewer` | Visor | Solo lectura del dashboard |

## Configurar Google SSO

### 1. Crear proyecto en Google Cloud Console

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un proyecto nuevo o selecciona uno existente
3. Ve a **APIs & Services → Credentials**

### 2. Crear OAuth 2.0 Client

1. Haz clic en **Create Credentials → OAuth client ID**
2. Selecciona **Web application**
3. Configura:

```
Name: WarehouseFlow SGA

Authorized JavaScript origins:
  - https://8cc79ec9.ap-southeast.insforge.app
  - https://senseikatana.com

Authorized redirect URIs:
  - https://8cc79ec9.ap-southeast.insforge.app/auth/callback/google
  - https://senseikatana.com/auth/callback/google
```

4. Copia el **Client ID** y **Client Secret**

### 3. Configurar en InsForge

```bash
# Añadir el provider OAuth
npx -y @insforge/cli@latest config apply
```

O desde el dashboard de InsForge:
1. Ve a **Authentication → Providers**
2. Habilita **Google**
3. Pega el Client ID y Client Secret
4. Guarda

### 4. Probar el login

```typescript
import insforge from "./lib/insforge";

// Login con Google
const { data, error } = await insforge.auth.signInWithOAuth({
  provider: "google",
  redirectTo: "https://whm.senseikatana.com"
});
```

## Crear usuarios de prueba

Los usuarios se crean automáticamente al registrarse. Para crear usuarios de prueba:

### Desde el dashboard de InsForge

1. Ve a **Authentication → Users**
2. Haz clic en **Invite user**
3. Introduce el email y selecciona el rol

### Desde la CLI

```bash
# Crear usuario vía SQL (solo para testing)
npx -y @insforge/cli@latest db query "
  INSERT INTO auth.users (email, password, email_verified, profile)
  VALUES (
    'admin@esinsa.com',
    crypt('admin123', gen_salt('bf')),
    true,
    '{\"name\": \"Sergio Jurado\"}'::jsonb
  )
"
```

### Usuarios de ejemplo

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@esinsa.com | admin123 | admin |
| gerente@esinsa.com | gerente123 | manager |
| supervisor@esinsa.com | super123 | supervisor |
| operario1@esinsa.com | opera123 | operator |
| picker1@esinsa.com | picker123 | picker |
| viewer@esinsa.com | viewer123 | viewer |

## Permisos por rol

```typescript
import { ROLE_PERMISSIONS } from "./lib/seeds/users";

const userRole = "operator";
const hasAccess = ROLE_PERMISSIONS[userRole].includes("inventory");
// true
```

## Proteger rutas

```typescript
import { useAuth } from "./lib/auth-context";

function ProtectedPage() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <AuthModal isOpen={true} />;

  return <Dashboard />;
}
```

## Verificar rol en API routes

```typescript
import { NextResponse } from "next/server";
import insforge from "../../lib/insforge";

export async function GET(request: Request) {
  const { data: { user } } = await insforge.auth.getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await insforge.database
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ... lógica del endpoint
}
```
| Email | Contraseña | Rol |
| --- | --- | --- |
| admin@esinsa.com | admin123 | Administrador |
| gerente@esinsa.com | gerente123 | Gerente |
| supervisor@esinsa.com | super123 | Supervisor |
| operario1@esinsa.com | opera123 | Operario |
| picker1@esinsa.com | picker123 | Picker |
| viewer@esinsa.com | viewer123 | Visor |