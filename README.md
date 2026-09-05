# DesarrollAMO · Web

Fuente de verdad del sitio público **[desarrollamo.com.ar](https://desarrollamo.com.ar/)**.

## Alcance

Este repositorio contiene únicamente la superficie publicable del sitio corporativo: presentación, servicios, trabajos seleccionados, contacto y políticas públicas.

No contiene credenciales, infraestructura privada, procesos internos, datos de clientes ni maquinaria operativa de DesarrollAMO.

## Estructura

- `public/` — único directorio publicable;
- `scripts/sync-footer.mjs` — sincroniza el footer corporativo oficial;
- `scripts/validate.mjs` — controla rutas, exposición y contrato del footer;
- `scripts/snapshot-live.py` — herramienta conservadora de recuperación/migración;
- `netlify.toml` — valida y publica exclusivamente `public/`.

## Footer corporativo

La web fija **Design System v0.3.0** y **Branding v1.3.0**. Durante `npm run check` se sincronizan localmente el CSS y el wordmark, y las páginas reciben una única instancia del footer oficial.

El footer enlaza a FAQ, Términos, Privacidad, Cookies, Pagos y Licencias. Las páginas no mantienen copias independientes del componente.

## Políticas públicas

Las rutas públicas vigentes son:

- `/faq`
- `/terms`
- `/privacy`
- `/cookies`
- `/payments`
- `/licenses`

No se permite publicar políticas con marcadores pendientes, referencias históricas obsoletas o datos personales innecesarios.

## Verificación

```bash
npm run check
```

El mismo comando es la puerta de publicación en Netlify. Si falla la sincronización, falta una ruta o reaparece un footer legado, el deploy debe fallar.

## Principio

La web muestra qué es y qué hace DesarrollAMO. La arquitectura interna de la empresa se mantiene fuera de esta superficie pública.
