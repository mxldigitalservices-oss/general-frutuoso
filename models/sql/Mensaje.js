const { query } = require('../../config/postgres');

exports.crear = ({ nombre, email, mensaje, ip }) =>
  query('INSERT INTO mensajes_contacto (nombre, email, mensaje, ip) VALUES ($1, $2, $3, $4)', [nombre, email, mensaje, ip || null]);

exports.listar = async (limite = 100) =>
  (await query('SELECT * FROM mensajes_contacto ORDER BY leido ASC, creado_en DESC LIMIT $1', [limite])).rows;

exports.marcarLeido = (id) => query('UPDATE mensajes_contacto SET leido = TRUE WHERE id = $1', [id]);

exports.contarNoLeidos = async () =>
  Number((await query('SELECT COUNT(*) FROM mensajes_contacto WHERE leido = FALSE')).rows[0].count);
