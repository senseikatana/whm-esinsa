# Autenticación

La app usa **Better Auth 1.7** con Postgres (Neon). No hay SDK de terceros ni
tablas `auth.*`: Better Auth crea y administra `user`, `session`, `account` y
`verification` en la misma base.

## Archivos

| Archivo | Rol |
|---------|-----|
| `app/lib/auth-options.ts` | Configuración compartida (providers, campos extra, sesión) |
| `app/lib/auth.ts` | Instancia server con el plugin `nextCookies()` |
| `app/lib/auth-client.ts` | Cliente React (`useSession`, `signIn`, `signUp`) |
| `app/lib/auth-context.tsx` | Provider de sesión y traducción de errores |
| `app/lib/api-auth.ts` | Guardas `withAuth` / `withWriteAuth` para route handlers |
| `app/api/auth/[...all]/route.ts` | Handler HTTP de Better Auth |
| `app/api/auth-config/route.ts` | Informa qué providers OAuth están configurados |

## Flujo

1. `signUp.email` crea el usuario con rol `viewer` (el rol es `input: false`,
   así que un cliente no puede asignarse `admin`).
2. Better Auth emite una cookie de sesión httpOnly.
3. `useSession()` hidrata el contexto y `App.tsx` muestra el dashboard.
4. Cada route handler valida la sesión contra la base antes de tocar datos.

## Registro público

- `minPasswordLength` es 8.
- Las cuentas nuevas nacen con rol `viewer`.
- `DISABLE_PUBLIC_SIGNUP=true` cierra el registro; los usuarios se crean por
  `db:seed` o directamente en la base.

## Roles

Los roles válidos son `admin`, `manager`, `supervisor`, `operator`, `picker` y
`viewer`. El rol vive en `"user".role` y tiene un CHECK en la base.

`viewer` es de solo lectura: `withWriteAuth` rechaza POST/PUT/DELETE. Las
pantallas no son un control de seguridad; la API sí.

## Usuarios demo

`bun run db:seed` crea las cuentas de `app/lib/seeds/accounts.ts` y las marca
como verificadas. Son las mismas que muestra el login en "Ver credenciales de
prueba", así que no pueden desincronizarse.

## Google y GitHub

1. Creá la credencial OAuth en el proveedor.
2. Redirect URI: `https://<dominio>/api/auth/callback/google` o
   `https://<dominio>/api/auth/callback/github`.
3. Cargá las variables `*_CLIENT_ID` / `*_CLIENT_SECRET` en el servidor.
4. Reiniciá. `/api/auth-config` devuelve `true` para el provider habilitado y el
   botón se activa solo.

Si faltan credenciales, el botón queda deshabilitado con un tooltip. No hay
fallback silencioso.

## Sesiones

- Duración: 7 días, con renovación diaria.
- Cookie httpOnly + `SameSite=Lax` (default de Better Auth).
- `BETTER_AUTH_SECRET` debe tener al menos 32 caracteres y rotarse con
  `BETTER_AUTH_SECRETS` si alguna vez se filtra.

## Verificación manual

```bash
# Login
curl -c /tmp/cookies.txt -H 'Content-Type: application/json' \
  -d '{"email":"admin@esinsa.com","password":"admin123"}' \
  http://localhost:3000/api/auth/sign-in/email

# Sesión
curl -b /tmp/cookies.txt http://localhost:3000/api/auth/get-session

# Recurso protegido: 200 con cookie, 401 sin cookie
curl -b /tmp/cookies.txt http://localhost:3000/api/products
curl http://localhost:3000/api/products
```
