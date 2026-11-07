const nodemailer = require('nodemailer');
const env = require('../config/env');
const { escapeHtml } = require('./escape');

let transporter = null;
const configurado = () => !!(env.GMAIL_USER && env.GMAIL_PASS && env.CONTACT_TO);

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: env.GMAIL_USER, pass: env.GMAIL_PASS } });
  }
  return transporter;
}

exports.configurado = () => !!(env.GMAIL_USER && env.GMAIL_PASS);

// Devuelve true si se envió; false si el correo no está configurado.
exports.notificarContacto = async ({ nombre, email, mensaje }) => {
  if (!configurado()) return false;
  await getTransporter().sendMail({
    from: `"Portal Fructuoso Heredia" <${env.GMAIL_USER}>`,
    to: env.CONTACT_TO,
    replyTo: email,
    subject: `Nuevo mensaje de ${nombre}`.replace(/[\r\n]/g, ' '),
    html: `<p><b>Nombre:</b> ${escapeHtml(nombre)}</p><p><b>Correo:</b> ${escapeHtml(email)}</p><p><b>Mensaje:</b></p><p>${escapeHtml(mensaje).replace(/\n/g, '<br>')}</p>`
  });
  return true;
};

// Enlace para crear una nueva contraseña (la URL se construye en el servidor con un código aleatorio).
exports.enviarRestablecimiento = async ({ nombre, email, url }) => {
  await getTransporter().sendMail({
    from: `"Portal Fructuoso Heredia" <${env.GMAIL_USER}>`,
    to: email,
    subject: 'Restablecer tu contraseña del panel',
    text: `Hola ${nombre},\n\nRecibimos una solicitud para restablecer tu contraseña del panel. Usa este enlace (válido 30 minutos y de un solo uso):\n${url}\n\nSi no lo solicitaste, ignora este mensaje: tu contraseña no cambia.`,
    html: `<p>Hola ${escapeHtml(nombre)},</p><p>Recibimos una solicitud para restablecer tu contraseña del panel. El enlace es válido por 30 minutos y solo funciona una vez:</p><p><a href="${escapeHtml(url)}">Crear una nueva contraseña</a></p><p>Si no lo solicitaste, ignora este mensaje: tu contraseña no cambia.</p>`
  });
};
