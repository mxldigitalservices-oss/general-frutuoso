-- Esquema relacional (se aplica de forma idempotente al iniciar)
CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol           VARCHAR(20) NOT NULL DEFAULT 'editor' CHECK (rol IN ('admin', 'editor')),
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ultimo_acceso TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS mensajes_contacto (
  id        SERIAL PRIMARY KEY,
  nombre    VARCHAR(120) NOT NULL,
  email     VARCHAR(160) NOT NULL,
  mensaje   TEXT NOT NULL,
  ip        VARCHAR(64),
  leido     BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mensajes_leido ON mensajes_contacto (leido, creado_en DESC);

CREATE TABLE IF NOT EXISTS auditoria (
  id         SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  accion     VARCHAR(40) NOT NULL,
  entidad    VARCHAR(40) NOT NULL,
  entidad_id VARCHAR(40),
  detalle    VARCHAR(300),
  creado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria (creado_en DESC);
