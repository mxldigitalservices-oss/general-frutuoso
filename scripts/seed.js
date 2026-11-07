// Siembra libros y biografía iniciales si están vacíos. Uso: npm run seed
const mongo = require('../config/mongo');
const { sembrarSiVacio } = require('../utils/bootstrap');

(async () => {
  await mongo.connect();
  await sembrarSiVacio();
  await mongo.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
