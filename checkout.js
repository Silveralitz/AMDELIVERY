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

    const localBackends = ['localhost', '127.0.0.1'];
    const apiBase = window.API_BASE_URL || (localBackends.includes(window.location.hostname) ? 'http://localhost:3000' : null);

    if (!apiBase) {
        showFeedback('No se ha configurado una URL de backend pública. Para usar este checkout desde otro dispositivo debes definir window.API_BASE_URL con la URL de tu servidor de pedidos.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar pedido';
        return;
    }

    const apiUrl = `${apiBase.replace(/\/$/, '')}/api/order`;
    console.log('Enviando pedido a', apiUrl);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });

        const responseText = await response.text();
        let result = {};

        try {
            result = responseText ? JSON.parse(responseText) : {};
        } catch {
            result = { message: responseText || 'Error inesperado del servidor.' };
        }

        if (!response.ok) {
            throw new Error(result.message || `Error del servidor: ${response.status}`);
        }

        localStorage.removeItem('cart');
        checkoutForm.reset();
        loadOrder();
        showFeedback(`Gracias, ${datos.nombre}! Tu pedido de $${total} se ha enviado correctamente. También recibirás un resumen por correo y el responsable del negocio lo recibirá.`);
    } catch (error) {
        showFeedback(error.message || 'No se pudo enviar el pedido. Intenta de nuevo más tarde.', 'error');
        console.error('Fetch error:', error);
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
