# Contribuir a WarehouseFlow SGA

Gracias por tu interés en contribuir a este proyecto. Esta guía te ayudará a empezar.

## Requisitos

- [Bun](https://bun.sh/) ≥ 1.0
- [InsForge CLI](https://insforge.dev)
- Acceso al proyecto InsForge (contacta al admin)

## Configuración del entorno

```bash
# 1. Fork y clonar el repositorio
git clone <tu-fork>
cd whm-withnext

# 2. Instalar dependencias
bun install

# 3. Configurar InsForge
npx @insforge/cli login
npx @insforge/cli link --project-id <project-id>

# 4. Crear .env.local
cp .env.example .env.local
# Editar con las credenciales de InsForge

# 5. Ejecutar en desarrollo
bun dev
```

## Flujo de trabajo

### 1. Crear una rama

```bash
git checkout -b feature/mi-feature
# o
git checkout -b fix/mi-bugfix
```

### 2. Desarrollar

- Escribe código limpio y bien tipado
- Sigue los patrones existentes en el proyecto
- No uses `any` explícitamente (está deshabilitado en Biome)
- Añade tipos TypeScript a todas las funciones y variables

### 3. Verificar calidad

```bash
# Verificar lint
bun lint

# Verificar formato
bun format

# Verificar todo
bun check

# Corregir automáticamente
bun check:fix

# Build de producción
bun build
```

### 4. Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: añadir filtro por categoría en inventario
fix: corregir cálculo de stock mínimo
docs: actualizar README con nuevas instrucciones
style: formatear código con Biome
refactor: extraer lógica de CRUD a servicio base
test: añadir tests para productsService
chore: actualizar dependencias
```

### 5. Pull Request

- Describe los cambios en la PR
- Incluye capturas de pantalla si hay cambios UI
- Asegúrate de que `bun build` pasa sin errores
- Referencia issues relacionados si existen

## Convenciones del proyecto

### Nombres de archivos

- Componentes: `PascalCase.tsx` (ej: `CrudView.tsx`)
- Servicios: `camelCase.ts` (ej: `products.ts`)
- Utilidades: `camelCase.ts` (ej: `sku-generator.ts`)
- Seeds: `camelCase.ts` (ej: `products.ts`)

### Estructura de componentes

```tsx
"use client";

import { useState } from "react";

interface MyComponentProps {
  title: string;
  data: any[];
}

export default function MyComponent({ title, data }: MyComponentProps) {
  // Hooks primero
  const [state, setState] = useState();

  // Lógica después
  const handleClick = () => {};

  // JSX al final
  return <div>...</div>;
}
```

### Servicios CRUD

Los servicios usan el patrón genérico de `app/lib/services/base.ts`:

```typescript
import { createCrudService } from "./base";
import type { MyEntity } from "../seeds/my-entity";

export const myEntityService = createCrudService<MyEntity>("my_entity");
```

Métodos disponibles:

- `list()` — Listar todos
- `getById(id)` — Obtener por ID
- `create(data)` — Crear registro
- `update(id, data)` — Actualizar
- `remove(id)` — Eliminar uno
- `removeBatch(ids)` — Eliminar en lote

### Estilos

- Usa Tailwind CSS para todo el styling
- Sigue el tema oscuro existente (`bg-[#050811]`, `bg-[#0b0f19]`, etc.)
- Usa los colores del design system: `indigo-600` (primario), `slate-800` (bordes), `emerald-500` (éxito), `rose-500` (peligro)

## Migraciones de base de datos

```bash
# Crear migración
npx @insforge/cli db migrations new descripcion-corta

# Editar el archivo SQL generado en migrations/
# Aplicar migración
npx @insforge/cli db migrations up --all
```

## Errores comunes

### Biome muestra errores

```bash
# Corregir automáticamente
bun check:fix

# Si persiste, revisar biome.json
```

### Build falla por TypeScript

```bash
# Verificar tipos
npx tsc --noEmit

# Limpiar cache de Next.js
rm -rf .next
bun build
```

### InsForge no conecta

```bash
# Verificar conexión
npx @insforge/cli current

# Re-login si es necesario
npx @insforge/cli login
```

## Preguntas

Si tienes dudas, abre un issue o contacta al equipo de desarrollo.

## Licencia

Al contribuir, aceptas que tu código será licenciado bajo los términos del proyecto.
