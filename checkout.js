const orderList = document.getElementById('orderList');
const orderTotal = document.getElementById('orderTotal');
const checkoutForm = document.getElementById('checkoutForm');
const themeToggle = document.getElementById('themeToggle');
const orderFeedback = document.getElementById('orderFeedback');
const submitButton = checkoutForm.querySelector('button[type="submit"]');

function showFeedback(message, type = 'success') {
    orderFeedback.textContent = message;
    orderFeedback.className = `order-feedback ${type}`;
    orderFeedback.hidden = false;
}

function loadOrder() {
    const storedCart = localStorage.getItem('cart');
    const cart = storedCart ? JSON.parse(storedCart) : [];

    if (cart.length === 0) {
        orderList.innerHTML = '<p>Tu carrito está vacío. Regresa a la tienda para agregar productos.</p>';
        orderTotal.textContent = '$0';
        return;
    }

    orderList.innerHTML = '';
    const total = cart.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const row = document.createElement('div');
        row.className = 'order-item';
        row.innerHTML = `
            <div>
                <p class="order-item-name">${item.name}</p>
                <small>${item.quantity} x $${item.price}</small>
            </div>
            <strong>$${itemTotal}</strong>
        `;
        orderList.appendChild(row);
        return sum + itemTotal;
    }, 0);

    orderTotal.textContent = `$${total}`;
}

checkoutForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(checkoutForm);
    const datos = Object.fromEntries(formData.entries());
    const storedCart = localStorage.getItem('cart');
    const cart = storedCart ? JSON.parse(storedCart) : [];
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (cart.length === 0) {
        showFeedback('Tu carrito está vacío. Agrega productos antes de finalizar la compra.', 'error');
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando pedido...';

    const order = {
        customer: datos,
        items: cart,
        total
    };

    try {
        const response = await fetch('/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Error al enviar el pedido.');
        }

        localStorage.removeItem('cart');
        checkoutForm.reset();
        loadOrder();
        showFeedback(`Gracias, ${datos.nombre}! Tu pedido de $${total} se ha enviado correctamente. También recibirás un resumen por correo y el responsable del negocio lo recibirá.`);
    } catch (error) {
        showFeedback(error.message || 'No se pudo enviar el pedido. Intenta de nuevo más tarde.', 'error');
        console.error(error);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar pedido';
    }
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    themeToggle.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
});

loadOrder();
