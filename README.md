# Portal Juan Manuel Fructuoso Heredia

Sitio institucional, literario y CMS. Node.js + Express + EJS. PostgreSQL (usuarios), MongoDB (contenido e imágenes), Redis (sesiones y caché).

## Estructura
- `server.js` arranque y conexión a las bases de datos · `app.js` configuración de Express y seguridad
- `config/` entorno, conexiones, módulos del panel, valores por defecto
- `models/` MongoDB (contenido) y `models/sql/` PostgreSQL (usuarios, mensajes, auditoría) · `db/schema.sql`
- `controllers/` lógica · `routes/` rutas públicas y `routes/admin/` (un archivo por módulo) · `middleware/` · `utils/`
- `views/` EJS públicas y `views/admin/` · `public/css`, `public/js`, `public/img`

## Local
```bash
npm install
cp .env.example .env     # completa DATABASE_URL, MONGO_URL, REDIS_URL, SESSION_SECRET y SETUP_TOKEN
npm run dev
```
Primer acceso: abre `/admin/setup`, escribe el SETUP_TOKEN y crea la cuenta del General.

## Railway
Servicio web desde el repo + plugins PostgreSQL, MongoDB y Redis. Variables mínimas: `NODE_ENV=production`, `SESSION_SECRET` (32+ caracteres), `SETUP_TOKEN`, `DATABASE_URL`, `MONGO_URL`, `REDIS_URL`. Healthcheck: `/healthz`.

## Dominio oficial
Define `SITE_URL=https://www.tudominio.com` y `CANONICAL_HOST=www.tudominio.com`; el resto de hosts redirige al dominio oficial (301).

## Usuarios extra (asistente)
`NEW_PASSWORD='clave-larga' npm run crear-usuario -- correo@dominio.com "Nombre" editor`
