import sgMail from '@sendgrid/mail';
import config from '../utils/config.js'; // Importa la configuración desde config.js

// Configurar la API Key de SendGrid
sgMail.setApiKey(config.SENDGRID_API_KEY);

export const sendEmail = async (to, subject, text, html) => {
  const msg = {
    to, // Correo del receptor
    from: config.FROM_EMAIL, // Correo remitente definido en config.js
    subject, // Asunto del correo
    text, // Versión de texto plano
    html, // Versión HTML
  };

  try {
    await sgMail.send(msg); // Enviar el correo
    console.log(`Correo enviado exitosamente a ${to}`);
  } catch (error) {
    console.error('Error al enviar el correo:', error.response?.body || error.message);
    throw new Error('No se pudo enviar el correo');
  }
};
