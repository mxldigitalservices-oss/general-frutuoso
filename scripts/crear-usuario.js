// Crea (o actualiza) un usuario del panel, p. ej. el asistente con rol "editor".
// Uso: NEW_PASSWORD='clave-larga' npm run crear-usuario -- correo@dominio.com "Nombre" editor
const pg = require('../config/postgres');
const Usuario = require('../models/sql/Usuario');

(async () => {
  const [email, nombre, rol = 'editor'] = process.argv.slice(2);
  const clave = process.env.NEW_PASSWORD || '';
  if (!email || !nombre) throw new Error('Uso: NEW_PASSWORD=... npm run crear-usuario -- correo "Nombre" [admin|editor]');
  if (!['admin', 'editor'].includes(rol)) throw new Error('El rol debe ser admin o editor');
  if (clave.length < 10 || clave.length > 72) throw new Error('NEW_PASSWORD debe tener entre 10 y 72 caracteres');
  await pg.init();
  const u = await Usuario.guardar({ nombre, email, clave, rol });
  console.log(`✔ Usuario listo: ${u.email} (${u.rol})`);
  await pg.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
