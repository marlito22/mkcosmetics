# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> **Esto NO es el Next.js que conoces.** Este repo usa **Next.js 16.2** (App Router, React 19.2), que trae cambios que rompen patrones de Next 15/14: `middleware.ts` fue reemplazado por `proxy.ts` (export `proxy`, runtime `nodejs` fijo, sin `edge`), `revalidateTag` ahora exige un segundo argumento (`cacheLife`), Turbopack es el bundler por defecto, y `next lint` ya no existe. Antes de tocar routing, caché, imágenes o middleware, revisa `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` y la carpeta `01-app/` en general — no asumas comportamiento de versiones anteriores.

## Comandos

```bash
npm run dev          # servidor de desarrollo (Turbopack)
npm run build         # build de producción (standalone) + copia assets + migra DB (postbuild)
npm run start          # sirve el build de producción
npm run lint            # eslint (flat config)
npm run db:generate     # genera migración SQL a partir de src/db/schema.ts
npm run db:migrate      # aplica migraciones pendientes (también corre en postbuild)
npm run db:push         # empuja el schema directo a la DB sin migración (solo dev)
npm run db:seed         # borra y recarga datos de ejemplo (6 categorías, 5 marcas, 15 productos)
```

No hay test runner configurado en este proyecto.

### Base de datos local

```bash
docker run -d --name mk-cosmetics-db --restart unless-stopped \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mk_cosmetics \
  -p 5432:5432 -v mk_cosmetics_pgdata:/var/lib/postgresql/data \
  postgres:17-alpine
```

Copia `.env.example` a `.env` y completa `DATABASE_URL`, `SMTP_USER`/`SMTP_PASS` (contraseña de aplicación de Gmail), `VENDOR_EMAIL`, `ADMIN_PASSWORD` y `AUTH_SECRET`.

## Arquitectura

Tienda de catálogo (sin pago en línea): el cliente arma un carrito, confirma con sus datos, y tanto cliente como vendedor reciben el pedido por correo (Nodemailer/Gmail SMTP).

- **`src/app/(tienda)/`** — grupo de rutas público: home, catálogo (`tienda/`), producto (`producto/[slug]/`), carrito, checkout y confirmación (`pedido/[codigo]/`). Server Components que consultan `src/lib/queries.ts` directamente.
- **`src/app/admin/`** — panel de administración (CRUD de productos, categorías, marcas). Protegido por `src/proxy.ts` (equivalente al `middleware.ts` clásico, renombrado en Next 16): toda ruta bajo `/admin` excepto `/admin/login` exige una cookie de sesión válida (`mk_admin`), verificada con JWT vía `jose` (`src/lib/auth-token.ts`). La sesión dura 7 días.
- **`src/app/api/images/[...path]/`** — sirve archivos de `uploads/` (que no van a git) con cache-control largo pensado para que Cloudflare los cachee como CDN. Resuelve y valida la ruta contra path traversal.
- **`src/db/`** — `schema.ts` (Drizzle ORM, PostgreSQL) define categorías, marcas, productos, imágenes de producto, variantes/tonos de producto, pedidos e ítems de pedido, con sus `relations`. `seed.ts` puebla datos de ejemplo. Las migraciones SQL generadas viven en `drizzle/`.
- **`src/lib/actions/`** — Server Actions (`"use server"`) organizadas por dominio: `auth.ts` (login admin), `catalog.ts` (categorías/marcas), `orders.ts` (checkout y creación de pedidos), `products.ts` (CRUD de productos, incluye validación Zod y límites de imágenes: `MAX_GENERAL_IMAGES`, `MAX_VARIANTS`, `MAX_IMAGE_BYTES`). Todas las mutaciones de admin llaman `requireAdmin()` al inicio.
- **`src/lib/images.ts`** — guarda imágenes subidas: valida tipo/tamaño, las procesa con `sharp` (redimensiona a 1200px, convierte a WebP) y las escribe en `uploads/<subdir>/`.
- **`src/lib/cart-store.ts`** — estado del carrito en cliente con Zustand + `persist` (localStorage, clave `mk-cart`), incluye función `migrate` para compatibilizar carritos guardados con versiones previas del shape.
- **`src/components/ui/`** — primitivas shadcn/ui (estilo `radix-nova`, ver `components.json`); el resto de `src/components/` es UI específica de tienda/admin construida sobre esas primitivas.
- **`src/lib/validation.ts`**, **`src/lib/slug.ts`**, **`src/lib/format.ts`** — helpers compartidos (esquemas Zod, generación de slugs únicos, formateo de precios en COP).

### Notas específicas de Next.js 16 en este repo

- `next.config.ts` usa `output: "standalone"` y fuerza la inclusión de los binarios nativos de `sharp`/`libvips` vía `outputFileTracingIncludes` (si no, falla en runtime con "Could not load the sharp module").
- `experimental.serverActions.allowedOrigins` está fijado a `mkcosmetic.com`/`www.mkcosmetic.com` para pasar el chequeo CSRF de Server Actions detrás del Cloudflare Tunnel; `bodySizeLimit` está en `70mb` por los uploads de imágenes múltiples.
- El `postbuild` (`scripts/copy-standalone-assets.js` + `drizzle-kit migrate`) copia `public/` y `.next/static/` dentro de `.next/standalone/` y aplica migraciones pendientes automáticamente — así el servidor de producción nunca queda desincronizado del schema.
- Despliegue: `deploy.sh` (en el servidor) hace `git merge` a `main`, build, resincroniza `.next/standalone/` (static, public, symlink a `uploads/`) y reinicia el servicio systemd detrás de un Cloudflare Tunnel nombrado.
