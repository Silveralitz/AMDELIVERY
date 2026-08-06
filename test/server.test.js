const test = require('node:test');
const assert = require('node:assert/strict');
const { buildOrderEmailHtml, getRecipientEmails } = require('../server');

test('buildOrderEmailHtml incluye el detalle del pedido y el total', () => {
  const order = {
    customer: {
      nombre: 'Ana',
      apellido: 'Pérez',
      direccion: 'Av. 18 de Julio 1234',
      pais: 'Uruguay',
      barrio: 'Centro',
      departamento: 'Montevideo',
      codigoPostal: '11300',
      telefono: '099123456',
      email: 'cliente@example.com'
    },
    items: [
      { name: 'Agua', quantity: 2, price: 120 }
    ],
    total: 240
  };

  const html = buildOrderEmailHtml(order);

  assert.match(html, /Ana Pérez/);
  assert.match(html, /Agua/);
  assert.match(html, /240/);
});

test('getRecipientEmails devuelve el responsable y el cliente', () => {
  const order = {
    customer: {
      email: 'cliente@example.com'
    }
  };

  const emails = getRecipientEmails(order);

  assert.equal(emails.responsibleEmail, 'ventas@example.com');
  assert.equal(emails.customerEmail, 'cliente@example.com');
});
