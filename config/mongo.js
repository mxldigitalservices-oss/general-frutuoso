const mongoose = require('mongoose');
const env = require('./env');

// Si Mongo no responde, las consultas fallan de inmediato en vez de quedarse colgadas.
mongoose.set('bufferCommands', false);
mongoose.set('strictQuery', true);

async function connect() {
  if (!env.MONGO_URL) throw new Error('MONGO_URL no está definida');
  await mongoose.connect(env.MONGO_URL, { serverSelectionTimeoutMS: 5000, maxPoolSize: 10 });
  console.log('✔ MongoDB listo');
}

async function close() {
  await mongoose.disconnect();
}

module.exports = { connect, close };
