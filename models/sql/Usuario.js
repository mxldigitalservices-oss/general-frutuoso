const bcrypt = require('bcryptjs');
const { query } = require('../../config/postgres');

// Hash falso para igualar el tiempo de respuesta cuando el correo no existe.
const HASH_FALSO = bcrypt.hashSync('no-existe', 12);

exports.hashear = (clave) => bcrypt.hash(clave, 12);

exports.buscarPorEmail = async (email) => {
  const r = await query('SELECT * FROM usuarios WHERE email = $1 AND activo = TRUE', [String(email).toLowerCase()]);
  return r.rows[0] || null;
};

exports.verificar = async (email, clave) => {
  const u = await exports.buscarPorEmail(email);
  const ok = await bcrypt.compare(String(clave), u ? u.password_hash : HASH_FALSO);
  return u && ok ? u : null;
};

exports.contar = async () => Number((await query('SELECT COUNT(*) FROM usuarios')).rows[0].count);

// Crea o actualiza (por correo). Sirve también para restablecer una clave.
exports.guardar = async ({ nombre, email, clave, rol = 'editor' }) => {
  const hash = await exports.hashear(clave);
  const r = await query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre, password_hash = EXCLUDED.password_hash, rol = EXCLUDED.rol, activo = TRUE
     RETURNING id, nombre, email, rol`,
    [nombre, String(email).toLowerCase(), hash, rol]
  );
  return r.rows[0];
};

exports.registrarAcceso = (id) => query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = $1', [id]).catch(() => {});

// Cambia nombre, correo y (opcionalmente) contraseña de la propia cuenta.
exports.actualizarCuenta = async (id, { nombre, email, clave }) => {
  if (clave) {
    const hash = await exports.hashear(clave);
    await query('UPDATE usuarios SET nombre = $1, email = $2, password_hash = $3 WHERE id = $4', [nombre, String(email).toLowerCase(), hash, id]);
  } else {
    await query('UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3', [nombre, String(email).toLowerCase(), id]);
  }
};
