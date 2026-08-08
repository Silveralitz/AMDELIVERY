require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Verificar si las credenciales SMTP están configuradas
const SMTP_CONFIGURED = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

if (!SMTP_CONFIGURED) {
  console.warn('⚠️  Variables SMTP no configuradas. Copia .env.example a .env y configura tus credenciales.');
  console.warn('📧 Los correos NO se enviarán hasta que se configure correctamente.');
}

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
      <h2 style="color: #0f766e;">Nuevo pedido desde AMDELIVERY</h2>
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
      <p style="margin-top: 16px; color: #4b5563;">Este mensaje confirma un pedido realizado desde la tienda AMDELIVERY.</p>
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
  const { responsibleEmail, customerEmail } = getRecipientEmails(order);

  if (!responsibleEmail) {
    throw new Error('No hay correo del responsable configurado.');
  }

  // Modo de prueba: simular envío sin credenciales SMTP
  if (!SMTP_CONFIGURED) {
    console.log('\n📧 [MODO PRUEBA] Pedido listo para enviar:');
    console.log(`   → Responsable: ${responsibleEmail}`);
    if (customerEmail) console.log(`   → Cliente: ${customerEmail}`);
    console.log(`   → Total: $${order.total}\n`);
    return;
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

  const sender = process.env.SMTP_FROM || `AMDELIVERY <${process.env.SMTP_USER}>`;
  const mailHtml = buildOrderEmailHtml(order);

  await transporter.sendMail({
    from: sender,
    to: responsibleEmail,
    replyTo: customerEmail || sender,
    subject: `Nuevo pedido de ${order.customer.nombre} ${order.customer.apellido}`,
    html: mailHtml
  });
}

app.post('/api/order', async (req, res) => {
  const order = req.body;

  if (!order || !order.customer || !order.items || order.items.length === 0) {
    return res.status(400).json({ message: 'Datos de pedido incompletos.' });
  }

  try {
    await sendOrderEmails(order);
    const message = SMTP_CONFIGURED
      ? 'Pedido enviado correctamente.'
      : 'Pedido guardado en modo prueba. Configura las credenciales SMTP en .env para enviar correos reales.';
    return res.status(200).json({ message });
  } catch (error) {
    console.error('Error procesando el pedido:', error.message);
    return res.status(500).json({ message: error.message || 'No se pudo procesar el pedido.' });
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
