# Cloudflare Worker — Proxy de whm.senseikatana.com

Este worker sirve la app WarehouseFlow SGA en `https://whm.senseikatana.com` proxeando todo el tráfico al upstream de InsForge.

## Arquitectura

```
whm.senseikatana.com/*
        │
        ▼
┌─────────────────────────┐
│   Cloudflare Worker     │
│  (whm-withnext-proxy)   │
│   proxy transparente    │
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│  8cc79ec9.insforge.site │
└─────────────────────────┘
```

`worker.ts` no reescribe HTML ni quita prefijos: como usa un subdominio dedicado, la ruta se proxea tal cual. Solo reescribe los `Location` de los redirects para que apunten al subdominio.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `worker.ts` | Proxy reverso (Fetch API) |
| `wrangler.toml` | Configuración del Worker y la ruta |

## Deploy

Preferir los scripts de `withnext/` (desde su raíz):

```bash
bun run worker:dev      # wrangler dev
bun run worker:deploy   # wrangler deploy
bun run worker:tail     # wrangler tail
```

O manualmente:

```bash
cd withnext/cloudflare-worker
wrangler deploy
```

## Verificar

```bash
curl -I https://whm.senseikatana.com
```

## Notas

- El upstream está en `worker.ts` (`UPSTREAM`) y debe coincidir con el dominio InsForge del proyecto `whm-withnext`.
- NO ejecutar `insforge domains attach senseikatana.com` ni `insforge domains dns sync`: sobreescriben los registros DNS que necesita el Worker.
- `bun run worker:delete` elimina el worker `whm-withnext-proxy`.
