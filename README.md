# DesarrollAMO · Web

Fuente de verdad del sitio público **[desarrollamo.com.ar](https://desarrollamo.com.ar/)**.

## Estado inicial

`v0.1.0` es una migración conservadora del sitio que ya estaba en producción el 2026-09-05. No mezcla la migración con un rediseño.

El sitio Netlify existente se preserva:

- dominio: `desarrollamo.com.ar`;
- site ID: `bfc9b6b0-c384-4092-9108-c48cb876649e`;
- producción no se recrea ni se transfiere durante esta migración.

## Estructura

- `public/` — único directorio publicable;
- `scripts/snapshot-live.py` — captura reproducible del sitio público actual;
- `scripts/validate.mjs` — evita snapshots incompletos y archivos internos expuestos;
- `snapshot-manifest.json` — evidencia de las URLs capturadas;
- `netlify.toml` — publica exclusivamente `public/`.

## Decisión de seguridad

El deploy histórico mezclaba páginas públicas con tests, scripts Python, PowerShell y herramientas internas. Esos archivos **no forman parte del nuevo publish**.

## Verificación

```bash
npm run check
```

Antes de considerar una versión apta para producción se debe verificar además mediante un **deploy preview** del mismo proyecto Netlify y probar sus rutas principales.

## Evolución

Una vez establecida esta fuente de verdad, el rediseño puede avanzar en cambios separados consumiendo:

- [`desarrollamo/branding`](https://github.com/desarrollamo/branding)
- [`desarrollamo/design-system`](https://github.com/desarrollamo/design-system)

Así cada mejora futura tiene un diff auditable contra el sitio que realmente estaba publicado.
