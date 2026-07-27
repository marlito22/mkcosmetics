# MK Cosmetics — Tienda de maquillaje por catálogo

Tienda web de venta por catálogo: los clientes arman un carrito, confirman el pedido con sus datos (sin registro ni pago en línea) y tanto el cliente como el vendedor reciben una copia del pedido por correo.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **PostgreSQL** + **Drizzle ORM**
- **Nodemailer** (Gmail SMTP) para los correos de pedido
- Imágenes almacenadas en el disco local (`uploads/`), servidas vía `/api/images` con caché para Cloudflare

## Desarrollo

1. **Base de datos** — con Docker:
   ```bash
   docker run -d --name mk-cosmetics-db --restart unless-stopped \
     -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mk_cosmetics \
     -p 5432:5432 -v mk_cosmetics_pgdata:/var/lib/postgresql/data \
     postgres:17-alpine
   ```

2. **Variables de entorno** — copia `.env.example` a `.env` y completa:
   - `DATABASE_URL`: conexión a PostgreSQL.
   - `SMTP_USER` / `SMTP_PASS`: tu Gmail y una [contraseña de aplicación](https://myaccount.google.com/apppasswords) (requiere verificación en dos pasos activa).
   - `VENDOR_EMAIL`: correo del vendedor que recibe cada pedido.
   - `ADMIN_PASSWORD`: contraseña del panel `/admin`.
   - `AUTH_SECRET`: secreto largo y aleatorio para firmar la sesión del admin.

3. **Migraciones y datos de ejemplo**:
   ```bash
   npm install
   npm run db:migrate
   npm run db:seed   # 6 categorías, 5 marcas, 15 productos con imágenes placeholder
   ```

4. **Arrancar**:
   ```bash
   npm run dev
   ```
   - Tienda: http://localhost:3000
   - Admin: http://localhost:3000/admin (gestión de productos, categorías y marcas)

## Scripts de base de datos

| Script | Descripción |
| --- | --- |
| `npm run db:generate` | Genera migraciones SQL a partir de `src/db/schema.ts` |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:seed` | Carga datos de ejemplo (borra los existentes) |

## Despliegue en servidor local detrás de Cloudflare

1. Compila el build standalone:
   ```bash
   npm run build
   ```
2. Copia al servidor (o usa la misma máquina): `.next/standalone/`, `.next/static/` → `.next/standalone/.next/static/`, `public/` → `.next/standalone/public/`, y la carpeta `uploads/` junto al `server.js` (el route handler la lee desde el directorio de trabajo).
3. Define las variables de entorno del `.env` en el servidor y ejecuta:
   ```bash
   node .next/standalone/server.js
   ```
   Por defecto escucha en el puerto 3000 (`PORT` para cambiarlo). Deja el proceso como servicio (NSSM, Tarea programada o `pm2`).
4. En **Cloudflare**: crea el registro DNS del dominio apuntando a la IP pública del servidor (proxy naranja activado) y redirige el puerto 80/443 del router al servidor. Lo más recomendable es poner un proxy inverso (Caddy o Nginx) delante de Node para TLS, o usar un **Cloudflare Tunnel** (`cloudflared`) que no requiere abrir puertos:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
5. Las imágenes de `/api/images/*` se sirven con `Cache-Control: public, max-age=31536000, immutable`, así Cloudflare las cachea en su CDN automáticamente.

> **Importante:** respalda la carpeta `uploads/` y la base de datos; ahí vive todo el contenido de la tienda.

## Estructura

```
src/
  app/(tienda)/          # Home, catálogo, producto, carrito, checkout, confirmación
  app/admin/             # Panel de administración (login + CRUD de productos)
  app/api/images/        # Sirve las imágenes de uploads/ con caché
  components/            # UI de la tienda y del admin (shadcn/ui en components/ui)
  db/                    # Schema Drizzle, conexión y seed
  lib/                   # Server actions, correos, carrito (Zustand), validaciones
uploads/                 # Imágenes subidas desde el admin (no va a git)
drizzle/                 # Migraciones SQL generadas
```
