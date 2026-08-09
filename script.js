const products = [
    {
        id: 1,
        name: 'Johnnie Walker Red Label (750 ml)',
        description: 'Whisky escocés con sabor equilibrado y notas ahumadas.',
        price: 1400,
        oldPrice: 1700,
        category: 'Whisky',
        brand: 'Johnnie Walker',
        flavor: 'Ahumado',
        images: ['images/johnnie.jpg', 'images/johnnie-2.jpg'],
        offer: true
    },
    {
        id: 2,
        name: 'Absolut Vodka (750 ML)',
        description: 'Vodka premium, limpio y con una textura muy suave.',
        price: 450,
        oldPrice: 520,
        category: 'Vodka',
        brand: 'Absolut',
        flavor: 'Suave',
        images: ['images/absolut.jpg', 'images/absolut-2.jpg'],
        offer: true
    },
    {
        id: 3,
        name: 'Tanqueray Gin (750 ML)',
        description: 'Gin clásico con aromas cítricos y botánicos muy marcados.',
        price: 260,
        oldPrice: 320,
        category: 'Gin',
        brand: 'Tanqueray',
        flavor: 'Botánico',
        images: ['images/tanqueray.jpg', 'images/tanqueray-2.jpg'],
        offer: false
    },
    {
        id: 4,
        name: 'Fernet Branca (750 ML)',
        description: 'Amaro italiano con un perfil herbal intenso y muy característico.',
        price: 280,
        oldPrice: 330,
        category: 'Fernet',
        brand: 'Branca',
        flavor: 'Herbal',
        images: ['images/fernet.jpg', 'images/fernet-2.jpg'],
        offer: true
    },
    {
        id: 5,
        name: 'Jägermeister (700 ML)',
        description: 'Licor de hierbas con un sabor complejo y muy reconocible.',
        price: 410,
        oldPrice: 480,
        category: 'Jager',
        brand: 'Jägermeister',
        flavor: 'Herbal',
        images: ['images/jager.jpg', 'images/jager-2.jpg'],
        offer: true
    },
 
];

const state = {
    search: '',
    category: 'all',
    brand: 'all',
    flavor: 'all',
    favorites: [],
    cart: [],
    theme: 'dark'
};

const productsGrid = document.getElementById('productsGrid');
const offersGrid = document.getElementById('offersGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const brandFilter = document.getElementById('brandFilter');
const flavorFilter = document.getElementById('flavorFilter');
const favoritesPanel = document.getElementById('favoritesPanel');
const cartPanel = document.getElementById('cartPanel');
const favoritesList = document.getElementById('favoritesList');
const cartList = document.getElementById('cartList');
const cartSummary = document.getElementById('cartSummary');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const favoritesToggle = document.getElementById('favoritesToggle');
const cartToggle = document.getElementById('cartToggle');
const themeToggle = document.getElementById('themeToggle');
const scrollProductsBtn = document.getElementById('scrollProducts');
const chipList = document.getElementById('chipList');

function populateFilters() {
    const categories = [...new Set(products.map(product => product.category))];
    const brands = [...new Set(products.map(product => product.brand))];
    const flavors = [...new Set(products.map(product => product.flavor))];

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });

    flavors.forEach(flavor => {
        const option = document.createElement('option');
        option.value = flavor;
        option.textContent = flavor;
        flavorFilter.appendChild(option);
    });
}

function getFilteredProducts() {
    return products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(state.search.toLowerCase()) ||
            product.description.toLowerCase().includes(state.search.toLowerCase());
        const matchesCategory = state.category === 'all' || product.category === state.category;
        const matchesBrand = state.brand === 'all' || product.brand === state.brand;
        const matchesFlavor = state.flavor === 'all' || product.flavor === state.flavor;
        return matchesSearch && matchesCategory && matchesBrand && matchesFlavor;
    });
}

function renderProducts() {
    const filtered = getFilteredProducts();
    productsGrid.innerHTML = '';

    if (filtered.length === 0) {
        productsGrid.innerHTML = '<p class="empty-state">No hay productos que coincidan con tu búsqueda.</p>';
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement('article');
        card.className = 'producto fade-in-item';
        card.dataset.productId = product.id;
        card.innerHTML = `
            <img src="${product.images[0]}" alt="${product.name}" class="product-image">
            <div class="producto-body">
                ${product.offer ? '<span class="badge offer">Oferta</span>' : '<span class="badge">Nuevo</span>'}
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="price-row">
                    <span class="price">$${product.price}</span>
                    ${product.oldPrice ? `<span class="old-price">$${product.oldPrice}</span>` : ''}
                </div>
                <div class="thumbnails">
                    ${product.images.map((image, index) => `<img class="thumb ${index === 0 ? 'active' : ''}" src="${image}" alt="${product.name} ${index + 1}">`).join('')}
                </div>
                <div class="product-actions">
                    <button class="action-btn primary" data-action="cart" data-id="${product.id}">Agregar</button>
                    <button class="action-btn secondary" data-action="favorite" data-id="${product.id}">♡</button>
                </div>
            </div>
        `;

        const productImage = card.querySelector('.product-image');

        card.querySelectorAll('.thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                if (productImage.src === thumb.src) return;
                productImage.classList.add('image-fade');
                setTimeout(() => {
                    productImage.src = thumb.src;
                    productImage.classList.remove('image-fade');
                }, 180);
                card.querySelectorAll('.thumb').forEach(item => item.classList.remove('active'));
                thumb.classList.add('active');
            });
        });

        productsGrid.appendChild(card);
    });
}

function renderOffers() {
    offersGrid.innerHTML = '';
    const offers = products.filter(product => product.offer);
    offers.forEach(product => {
        const card = document.createElement('article');
        card.className = 'offer-card';
        card.innerHTML = `
            <div class="offer-body">
                <span class="badge offer">-${Math.round((product.oldPrice - product.price) / product.oldPrice * 100)}%</span>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="price-row">
                    <span class="price">$${product.price}</span>
                    <span class="old-price">$${product.oldPrice}</span>
                </div>
            </div>
        `;
        offersGrid.appendChild(card);
    });
}

function updateCounts() {
    favoritesToggle.dataset.count = state.favorites.length;
    cartToggle.dataset.count = state.cart.length;
}

function renderPanel(panelName) {
    if (panelName === 'favorites') {
        favoritesList.innerHTML = '';
        if (state.favorites.length === 0) {
            favoritesList.innerHTML = '<p>No tienes productos favoritos aún.</p>';
            return;
        }
        state.favorites.forEach(product => {
            const item = document.createElement('div');
            item.className = 'panel-item';
            item.innerHTML = `<span>${product.name}</span><button class="action-btn secondary" data-remove="favorite" data-id="${product.id}">Quitar</button>`;
            favoritesList.appendChild(item);
        });
    }

    if (panelName === 'cart') {
        cartList.innerHTML = '';
        if (state.cart.length === 0) {
            cartList.innerHTML = '<p>Tu carrito está vacío.</p>';
            updateCartSummary();
            return;
        }
        state.cart.forEach(product => {
            const item = document.createElement('div');
            item.className = 'panel-item cart-item';
            item.innerHTML = `
                <div class="cart-item-info">
                    <span>${product.name}</span>
                    <small>${product.quantity} x $${product.price} = $${product.price * product.quantity}</small>
                </div>
                <div class="cart-item-actions">
                    <button class="action-btn secondary" data-action="decrement" data-id="${product.id}">-</button>
                    <span class="cart-quantity">${product.quantity}</span>
                    <button class="action-btn secondary" data-action="increment" data-id="${product.id}">+</button>
                    <button class="action-btn secondary" data-remove="cart" data-id="${product.id}">Quitar</button>
                </div>
            `;
            cartList.appendChild(item);
        });
        updateCartSummary();
    }
}

function updateCartSummary() {
    const total = state.cart.reduce((sum, product) => sum + product.price * product.quantity, 0);
    const itemCount = state.cart.reduce((sum, product) => sum + product.quantity, 0);
    if (cartSummary) {
        cartSummary.style.display = state.cart.length === 0 ? 'none' : 'block';
    }
    if (cartSubtotal) {
        cartSubtotal.textContent = `$${total}`;
    }
    if (cartTotal) {
        cartTotal.textContent = `$${total}`;
    }
    if (checkoutBtn) {
        checkoutBtn.disabled = state.cart.length === 0;
    }
}

function togglePanel(panelName) {
    if (panelName === 'favorites') {
        favoritesPanel.classList.toggle('open');
        if (favoritesPanel.classList.contains('open')) {
            cartPanel.classList.remove('open');
        }
        renderPanel('favorites');
    }

    if (panelName === 'cart') {
        cartPanel.classList.toggle('open');
        if (cartPanel.classList.contains('open')) {
            favoritesPanel.classList.remove('open');
        }
        renderPanel('cart');
    }
}

function closePanels() {
    favoritesPanel.classList.remove('open');
    cartPanel.classList.remove('open');
}

function addToFavorite(productId) {
    const product = products.find(item => item.id === Number(productId));
    if (!product || state.favorites.some(item => item.id === product.id)) return;
    state.favorites.push(product);
    updateCounts();
    renderPanel('favorites');
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(state.cart));
}

function addToCart(productId) {
    const product = products.find(item => item.id === Number(productId));
    if (!product) return;
    const cartItem = state.cart.find(item => item.id === product.id);
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        state.cart.push({ ...product, quantity: 1 });
    }
    updateCounts();
    saveCart();
    renderPanel('cart');
    showAddFeedback(productId);
}

function showAddFeedback(productId) {
    const card = productsGrid.querySelector(`.producto[data-product-id="${productId}"]`);
    if (!card) return;
    const button = card.querySelector('button[data-action="cart"]');
    if (!button) return;
    const originalText = button.textContent;
    button.textContent = 'Agregado';
    button.disabled = true;
    button.classList.add('added-button');
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        button.classList.remove('added-button');
    }, 1800);
}

function removeFromFavorite(productId) {
    state.favorites = state.favorites.filter(item => item.id !== Number(productId));
    updateCounts();
    renderPanel('favorites');
}

function updateCartItemQuantity(productId, change) {
    const item = state.cart.find(product => product.id === Number(productId));
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) {
        state.cart = state.cart.filter(product => product.id !== Number(productId));
    }
    updateCounts();
    saveCart();
    renderPanel('cart');
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== Number(productId));
    updateCounts();
    saveCart();
    renderPanel('cart');
}

searchInput.addEventListener('input', (event) => {
    state.search = event.target.value.trim();
    renderProducts();
});

categoryFilter.addEventListener('change', (event) => {
    state.category = event.target.value;
    renderProducts();
});

brandFilter.addEventListener('change', (event) => {
    state.brand = event.target.value;
    renderProducts();
});

flavorFilter.addEventListener('change', (event) => {
    state.flavor = event.target.value;
    renderProducts();
});

chipList.addEventListener('click', (event) => {
    if (event.target.matches('.chip')) {
        document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
        event.target.classList.add('active');
        state.category = event.target.dataset.category;
        categoryFilter.value = state.category === 'all' ? 'all' : state.category;
        renderProducts();
    }
});

productsGrid.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const id = button.dataset.id;
    if (button.dataset.action === 'favorite') {
        addToFavorite(id);
    }
    if (button.dataset.action === 'cart') {
        addToCart(id);
    }
});

favoritesList.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.remove === 'favorite') {
        removeFromFavorite(button.dataset.id);
    }
});

cartList.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.action === 'increment') {
        updateCartItemQuantity(button.dataset.id, 1);
        return;
    }
    if (button.dataset.action === 'decrement') {
        updateCartItemQuantity(button.dataset.id, -1);
        return;
    }
    if (button.dataset.remove === 'cart') {
        removeFromCart(button.dataset.id);
    }
});

favoritesToggle.addEventListener('click', () => togglePanel('favorites'));
cartToggle.addEventListener('click', () => togglePanel('cart'));

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (state.cart.length === 0) return;
        window.location.href = 'checkout.html';
    });
}

document.querySelectorAll('.panel-close').forEach(button => {
    button.addEventListener('click', () => {
        const panelName = button.dataset.panel;
        if (panelName === 'favorites') {
            favoritesPanel.classList.remove('open');
        }
        if (panelName === 'cart') {
            cartPanel.classList.remove('open');
        }
    });
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    state.theme = document.body.classList.contains('light') ? 'light' : 'dark';
    themeToggle.textContent = state.theme === 'light' ? '☀️' : '🌙';
});

scrollProductsBtn.addEventListener('click', () => {
    document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
});

document.addEventListener('click', (event) => {
    if (!favoritesPanel.contains(event.target) && !favoritesToggle.contains(event.target) && !cartPanel.contains(event.target) && !cartToggle.contains(event.target)) {
        closePanels();
    }
});

populateFilters();
renderProducts();
renderOffers();
updateCounts();
updateCartSummary();

const ageGate = document.getElementById('ageGate');
const ageGateYes = document.getElementById('ageGateYes');
const ageGateNo = document.getElementById('ageGateNo');

function hideAgeGate() {
    if (ageGate) {
        ageGate.style.display = 'none';
    }
}

function showAgeGate() {
    if (ageGate) {
        ageGate.style.display = 'grid';
    }
}

function checkAgeGate() {
    if (localStorage.getItem('ageConfirmed') === 'true') {
        hideAgeGate();
    } else {
        showAgeGate();
    }
}

if (ageGateYes) {
    ageGateYes.addEventListener('click', () => {
        localStorage.setItem('ageConfirmed', 'true');
        hideAgeGate();
    });
}

if (ageGateNo) {
    ageGateNo.addEventListener('click', () => {
        window.location.href = 'https://www.google.com/';
    });
}

checkAgeGate();
