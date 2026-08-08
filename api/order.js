if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const nodemailer = require('nodemailer');

function buildOrderEmailHtml(order) {
  const orderItemsHtml = order.items
    .map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${item.price}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${item.price * item.quantity}</td>
      </tr>
    `)
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
      <h2 style="color: #0f766e;">Nuevo pedido desde A.M DELIVERY</h2>
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
      <p style="margin-top: 16px; color: #4b5563;">Este mensaje confirma un pedido realizado desde la tienda A.M DELIVERY.</p>
    </div>
  `;
}

function getRecipientEmail(order) {
  return process.env.ORDER_EMAIL || 'ventas@example.com';
}

async function sendOrderEmail(order) {
  const recipient = getRecipientEmail(order);
  const customerEmail = order.customer.email;

  if (!recipient) {
    throw new Error('No hay correo responsable configurado.');
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Faltan credenciales SMTP en las variables de entorno.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailHtml = buildOrderEmailHtml(order);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `A.M DELIVERY <${process.env.SMTP_USER}>`,
    to: recipient,
    replyTo: customerEmail || recipient,
    subject: `Nuevo pedido de ${order.customer.nombre} ${order.customer.apellido}`,
    html: mailHtml
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('<html><head><title>405 Not Allowed</title></head><body bgcolor="white"><center><h1>405 Not Allowed</h1></center></body></html>');
    return;
  }

  const order = req.body;

  if (!order || !order.customer || !Array.isArray(order.items) || order.items.length === 0) {
    res.status(400).json({ message: 'Datos de pedido incompletos.' });
    return;
  }

  try {
    await sendOrderEmail(order);
    res.status(200).json({ message: 'Pedido enviado correctamente.' });
  } catch (error) {
    console.error('Error enviando pedido:', error);
    res.status(500).json({ message: error.message || 'No se pudo enviar el pedido.' });
  }
};