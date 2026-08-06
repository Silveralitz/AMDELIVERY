const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

function buildOrderEmailHtml(order) {
  const orderItemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${item.price}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${item.price * item.quantity}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
      <h2 style="color: #0f766e;">Nuevo pedido desde BotellasUY</h2>
      <p><strong>Cliente:</strong> ${order.customer.nombre} ${order.customer.apellido}</p>
      <p><strong>Dirección:</strong> ${order.customer.direccion}</p>
      <p><strong>País:</strong> ${order.customer.pais}</p>
      <p><strong>Barrio:</strong> ${order.customer.barrio || 'No informado'}</p>
      <p><strong>Departamento:</strong> ${order.customer.departamento || 'No informado'}</p>
      <p><strong>Código postal:</strong> ${order.customer.codigoPostal || 'No informado'}</p>
      <p><strong>Teléfono:</strong> ${order.customer.telefono || 'No informado'}</p>
      <p><strong>Email:</strong> ${order.customer.email || 'No informado'}</p>
      <h3>Productos</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Producto</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Cantidad</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Precio</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${orderItemsHtml}
        </tbody>
      </table>
      <p style="margin-top: 16px;"><strong>Total:</strong> $${order.total}</p>
      <p style="margin-top: 16px; color: #4b5563;">Este mensaje confirma un pedido realizado desde la tienda BotellasUY.</p>
    </div>
  `;
}

function getRecipientEmails(order) {
  const responsibleEmail = process.env.ORDER_EMAIL || 'ventas@example.com';
  const customerEmail = order?.customer?.email || '';

  return {
    responsibleEmail,
    customerEmail
  };
}

async function sendOrderEmails(order) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'user@example.com',
      pass: process.env.SMTP_PASS || 'password'
    }
  });

  const { responsibleEmail, customerEmail } = getRecipientEmails(order);
  const recipients = [...new Set([responsibleEmail, customerEmail].filter(Boolean))];

  if (recipients.length === 0) {
    throw new Error('No hay destinatarios para enviar el pedido.');
  }

  const sender = process.env.SMTP_FROM || 'BotellasUY <no-reply@botellasuy.com>';
  const mailHtml = buildOrderEmailHtml(order);

  const emailPromises = recipients.map((email, index) => {
    const subject = index === 0
      ? `Nuevo pedido de ${order.customer.nombre} ${order.customer.apellido}`
      : `Confirmación de tu pedido en BotellasUY`;

    return transporter.sendMail({
      from: sender,
      to: email,
      replyTo: responsibleEmail,
      subject,
      html: mailHtml
    });
  });

  await Promise.all(emailPromises);
}

app.post('/api/order', async (req, res) => {
  const order = req.body;

  if (!order || !order.customer || !order.items || order.items.length === 0) {
    return res.status(400).json({ message: 'Datos de pedido incompletos.' });
  }

  try {
    await sendOrderEmails(order);
    return res.status(200).json({ message: 'Pedido enviado correctamente.' });
  } catch (error) {
    console.error('Error enviando el correo:', error);
    return res.status(500).json({ message: 'No se pudo enviar el pedido por correo.' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor ejecutando en http://localhost:${PORT}`);
  });
}

module.exports = {
  app,
  buildOrderEmailHtml,
  getRecipientEmails,
  sendOrderEmails
};
