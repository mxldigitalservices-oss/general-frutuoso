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
