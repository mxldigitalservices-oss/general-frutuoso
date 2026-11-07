const { query } = require('../../config/postgres');

// Nunca debe romper la operación principal: los errores se registran y se ignoran.
exports.registrar = async (usuarioId, accion, entidad, entidadId, detalle) => {
  try {
    await query(
      'INSERT INTO auditoria (usuario_id, accion, entidad, entidad_id, detalle) VALUES ($1, $2, $3, $4, $5)',
      [usuarioId || null, accion, entidad, entidadId ? String(entidadId) : null, detalle ? String(detalle).slice(0, 300) : null]
    );
  } catch (e) { console.error('Auditoría:', e.message); }
};

exports.ultimos = async (n = 10) =>
  (await query(
    `SELECT a.*, u.nombre AS usuario FROM auditoria a LEFT JOIN usuarios u ON u.id = a.usuario_id ORDER BY a.creado_en DESC LIMIT $1`, [n]
  )).rows;
