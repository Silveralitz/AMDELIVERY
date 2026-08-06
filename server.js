const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/order', async (req, res) => {
  const order = req.body;

  if (!order || !order.customer || !order.items || order.items.length === 0) {
    return res.status(400).json({ message: 'Datos de pedido incompletos.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'user@example.com',
        pass: process.env.SMTP_PASS || 'password'
      }
    });

    const orderItemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${item.price}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${item.price * item.quantity}</td>
      </tr>
    `).join('');

    const mailHtml = `
      <h2>Nuevo pedido desde BotellasUY</h2>
      <p><strong>Nombre:</strong> ${order.customer.nombre} ${order.customer.apellido}</p>
      <p><strong>Dirección:</strong> ${order.customer.direccion}</p>
      <p><strong>País:</strong> ${order.customer.pais}</p>
      <p><strong>Barrio:</strong> ${order.customer.barrio}</p>
      <p><strong>Departamento:</strong> ${order.customer.departamento}</p>
      <p><strong>Código postal:</strong> ${order.customer.codigoPostal}</p>
      <p><strong>Teléfono:</strong> ${order.customer.telefono}</p>
      <p><strong>Email:</strong> ${order.customer.email}</p>
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
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'BotellasUY <no-reply@botellasuy.com>',
      to: process.env.ORDER_EMAIL || 'ventas@example.com',
      subject: `Nuevo pedido de ${order.customer.nombre} ${order.customer.apellido}`,
      html: mailHtml
    });

    return res.status(200).json({ message: 'Pedido enviado correctamente.' });
  } catch (error) {
    console.error('Error enviando el correo:', error);
    return res.status(500).json({ message: 'No se pudo enviar el pedido por correo.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutando en http://localhost:${PORT}`);
});
