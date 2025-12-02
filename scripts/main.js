/**
 * SISTEMA DE GESTIÓN DE TIENDA DE ROPA FEMENINA
 * =============================================
 */

// Variables globales
let products = [];
let filteredProducts = [];
let cart = [];
let currentUser = null;

// Función para formatear precios en pesos colombianos
function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// Datos de productos de muestra
const sampleProducts = [
    {
        id: 1,
        name: "Vestido Elegante Negro",
        price: 359900,
        category: "vestidos",
        color: "negro",
        size: ["S", "M", "L"],
        description: "Elegante vestido negro perfecto para ocasiones especiales. Confeccionado con materiales de alta calidad.",
        materials: "95% Poliéster, 5% Elastano",
        origin: "Italia",
        stock: 15
    },
    {
        id: 2,
        name: "Blusa Blanca Clásica",
        price: 183900,
        category: "blusas",
        color: "blanco",
        size: ["XS", "S", "M", "L", "XL"],
        description: "Blusa blanca clásica ideal para el trabajo o eventos casuales. Diseño atemporal y versátil.",
        materials: "100% Algodón",
        origin: "España",
        stock: 25
    },
    {
        id: 3,
        name: "Pantalón Azul Marino",
        price: 263900,
        category: "pantalones",
        color: "azul",
        size: ["S", "M", "L", "XL"],
        description: "Pantalón azul marino de corte moderno. Perfecto para combinar con cualquier blusa o camisa.",
        materials: "70% Algodón, 30% Poliéster",
        origin: "Francia",
        stock: 20
    },
    {
        id: 4,
        name: "Falda Rosa Primavera",
        price: 159900,
        category: "faldas",
        color: "rosa",
        size: ["XS", "S", "M", "L"],
        description: "Falda rosa con estampado floral, perfecta para la temporada de primavera. Diseño fresco y juvenil.",
        materials: "100% Viscosa",
        origin: "Portugal",
        stock: 18
    },
    {
        id: 5,
        name: "Vestido Rojo Cocktail",
        price: 483900,
        category: "vestidos",
        color: "rojo",
        size: ["S", "M", "L"],
        description: "Vestido rojo de cocktail con detalles únicos. Ideal para eventos nocturnos y celebraciones especiales.",
        materials: "90% Seda, 10% Elastano",
        origin: "Italia",
        stock: 8
    },
    {
        id: 6,
        name: "Blusa Negra Ejecutiva",
        price: 223900,
        category: "blusas",
        color: "negro",
        size: ["S", "M", "L", "XL"],
        description: "Blusa negra de corte ejecutivo. Perfecta para el ambiente profesional con un toque de elegancia.",
        materials: "95% Poliéster, 5% Elastano",
        origin: "Alemania",
        stock: 22
    },
    {
        id: 7,
        name: "Pantalón Blanco Verano",
        price: 199900,
        category: "pantalones",
        color: "blanco",
        size: ["XS", "S", "M", "L", "XL"],
        description: "Pantalón blanco ligero para el verano. Confeccionado con tela transpirable y cómoda.",
        materials: "100% Lino",
        origin: "Grecia",
        stock: 30
    },
    {
        id: 8,
        name: "Falda Azul Denim",
        price: 171900,
        category: "faldas",
        color: "azul",
        size: ["S", "M", "L"],
        description: "Falda de denim azul con diseño moderno. Versátil y cómoda para el uso diario.",
        materials: "100% Algodón Denim",
        origin: "Estados Unidos",
        stock: 16
    }
];

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando aplicación...');
    initializeApp();
    routeTo(window.location.hash || '#home');
});

function initializeApp() {
    console.log('Inicializando aplicación...');
    
    // Carga productos disponibles (solo los que tienen stock)
    products = sampleProducts.filter(product => product.stock > 0);
    filteredProducts = [...products];
    
    console.log('Productos cargados:', products.length);
    
    // Carga datos persistentes
    loadCart();
    loadUserSession();
    
    // Configura event listeners
    setupEventListeners();
    setupFilterListeners();
    setupModalListeners();
    setupFormListeners();
    
    // Inicializa la interfaz
    displayProducts();
    updateCartCount();
}

function setupEventListeners() {
    // NAVEGACIÓN MÓVIL
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('active');
        });
    });
    
    // NAVEGACIÓN PRINCIPAL
    const homeBtn = document.querySelector('a[href="#home"]');
    const catalogBtn = document.querySelector('a[href="#catalog"]');
    const contactBtn = document.querySelector('a[href="#contact"]');
    
    if (homeBtn) {
        homeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showHome();
        });
    }
    
    if (catalogBtn) {
        catalogBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showCatalog();
        });
    }
    
    if (contactBtn) {
        contactBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showContact();
        });
    }
    
    // BOTONES DE ACCIÓN
    const loginBtn = document.getElementById('loginBtn');
    const cartBtn = document.getElementById('cartBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLogin();
        });
    }
    
    if (cartBtn) {
        cartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showCart();
        });
    }
    
    // CAMPO DE BÚSQUEDA
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchProducts(this.value);
            }
        });
        
        // También agregar evento para búsqueda en tiempo real (opcional)
        searchInput.addEventListener('input', function() {
            // Búsqueda con un pequeño delay para mejor rendimiento
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                searchProducts(this.value);
            }, 300);
        });
    }
}

function setupFilterListeners() {
    const filters = ['categoryFilter', 'colorFilter', 'priceFilter'];
    
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', applyFilters);
        }
    });
}

function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const colorFilter = document.getElementById('colorFilter');
    const priceFilter = document.getElementById('priceFilter');
    
    const categoryValue = categoryFilter ? categoryFilter.value.toLowerCase() : '';
    const colorValue = colorFilter ? colorFilter.value.toLowerCase() : '';
    const priceValue = priceFilter ? priceFilter.value.toLowerCase() : '';
    
    filteredProducts = products.filter(product => {
        const productTitle = product.name.toLowerCase();
        
        // Filtro por categoría (busca la palabra en el título)
        if (categoryValue && !productTitle.includes(categoryValue)) {
            return false;
        }
        
        // Filtro por color (busca la palabra en el título)
        if (colorValue && !productTitle.includes(colorValue)) {
            return false;
        }
        
        // Filtro por rango de precio (basado en el precio real del producto)
        if (priceValue) {
            const productPrice = product.price;
            let minPrice = 0;
            let maxPrice = Infinity;
            
            if (priceValue.includes('-')) {
                const [min, max] = priceValue.split('-').map(Number);
                minPrice = min;
                maxPrice = max;
            } else if (priceValue.includes('+')) {
                minPrice = parseInt(priceValue.replace('+', ''));
                maxPrice = Infinity;
            } else if (priceValue.includes('0-')) {
                const max = parseInt(priceValue.split('-')[1]);
                minPrice = 0;
                maxPrice = max;
            }
            
            if (productPrice < minPrice || productPrice > maxPrice) {
                return false;
            }
        }
        
        return true;
    });
    
    displayProducts();
}

function clearFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const colorFilter = document.getElementById('colorFilter');
    const priceFilter = document.getElementById('priceFilter');
    const searchInput = document.getElementById('searchInput');
    
    if (categoryFilter) categoryFilter.value = '';
    if (colorFilter) colorFilter.value = '';
    if (priceFilter) priceFilter.value = '';
    if (searchInput) searchInput.value = '';
    
    filteredProducts = [...products];
    displayProducts();
}

function searchProducts(searchTerm) {
    // Si no se proporciona término, obtenerlo del input
    if (!searchTerm) {
        const searchInput = document.getElementById('searchInput');
        searchTerm = searchInput ? searchInput.value : '';
    }
    
    if (!searchTerm || searchTerm.trim() === '') {
        // Si no hay término de búsqueda, aplicar solo los filtros actuales
        applyFilters();
        return;
    }
    
    const searchTermLower = searchTerm.toLowerCase().trim();
    
    // Obtener valores actuales de los filtros
    const categoryFilter = document.getElementById('categoryFilter');
    const colorFilter = document.getElementById('colorFilter');
    const priceFilter = document.getElementById('priceFilter');
    
    const categoryValue = categoryFilter ? categoryFilter.value.toLowerCase() : '';
    const colorValue = colorFilter ? colorFilter.value.toLowerCase() : '';
    const priceValue = priceFilter ? priceFilter.value.toLowerCase() : '';
    
    filteredProducts = products.filter(product => {
        const productTitle = product.name.toLowerCase();
        
        // Primero verificar si el producto contiene el término de búsqueda
        if (!productTitle.includes(searchTermLower)) {
            return false;
        }
        
        // Luego aplicar los filtros adicionales si están activos
        
        // Filtro por categoría (busca la palabra en el título)
        if (categoryValue && !productTitle.includes(categoryValue)) {
            return false;
        }
        
        // Filtro por color (busca la palabra en el título)
        if (colorValue && !productTitle.includes(colorValue)) {
            return false;
        }
        
        // Filtro por rango de precio (basado en el precio real del producto)
        if (priceValue) {
            const productPrice = product.price;
            let minPrice = 0;
            let maxPrice = Infinity;
            
            if (priceValue.includes('-')) {
                const [min, max] = priceValue.split('-').map(Number);
                minPrice = min;
                maxPrice = max;
            } else if (priceValue.includes('+')) {
                minPrice = parseInt(priceValue.replace('+', ''));
                maxPrice = Infinity;
            } else if (priceValue.includes('0-')) {
                const max = parseInt(priceValue.split('-')[1]);
                minPrice = 0;
                maxPrice = max;
            }
            
            if (productPrice < minPrice || productPrice > maxPrice) {
                return false;
            }
        }
        
        return true;
    });
    
    displayProducts();
}

function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <p>No se encontraron productos que coincidan con los filtros seleccionados.</p>
                <button onclick="clearFilters()" class="btn btn-primary">Limpiar filtros</button>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card fade-in" onclick="showProductDetail(${product.id})">
            <div class="product-image">
                <div class="image-placeholder">
                    <svg width="100%" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100%" height="100%" fill="#f8f9fa"/>
                        <rect x="50" y="30" width="200" height="140" fill="#e9ecef" stroke="#dee2e6" stroke-width="2" rx="8"/>
                        <circle cx="120" cy="80" r="12" fill="#adb5bd"/>
                        <polygon points="80,140 120,100 160,120 200,80 200,150 80,150" fill="#ced4da"/>
                        <text x="150" y="175" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#6c757d">${product.name}</text>
                    </svg>
                </div>
            </div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">${formatPrice(product.price)}</p>
            <p class="product-description">${product.description.substring(0, 100)}...</p>
            <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                Agregar al Carrito
            </button>
        </div>
    `).join('');
}

// Funciones de navegación
function showHome() {
    document.getElementById('home').style.display = 'block';
    document.getElementById('catalog').style.display = 'none';
    document.getElementById('contact').style.display = 'none';
    setActiveNav('#home');
}

function showCatalog() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('catalog').style.display = 'block';
    document.getElementById('contact').style.display = 'none';
    setActiveNav('#catalog');
}

function showContact() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('catalog').style.display = 'none';
    document.getElementById('contact').style.display = 'block';
    setActiveNav('#contact');
}

function setActiveNav(targetHash) {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === targetHash) {
            link.classList.add('active');
        }
    });
}

function routeTo(hash) {
    switch (hash) {
        case '#catalog':
            showCatalog();
            break;
        case '#contact':
            showContact();
            break;
        default:
            showHome();
            break;
    }
}

// Funciones del carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    showMessage('Producto añadido al carrito', 'success');
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function saveCart() {
    localStorage.setItem('fashionista_cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('fashionista_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function loadUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateLoginButton();
    }
}

// Funciones de modal y formularios (simplificadas)
function setupModalListeners() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
}

function setupFormListeners() {
    // Event listeners para formularios de login y registro
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const contactForm = document.getElementById('contactForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContact);
    }
}

function showLogin() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'block';
    }
}

function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.tab-btn');
    
    if (loginForm && registerForm) {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        
        tabs.forEach(tab => tab.classList.remove('active'));
        tabs[0].classList.add('active');
    }
}

function showRegisterForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.tab-btn');
    
    if (loginForm && registerForm) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        
        tabs.forEach(tab => tab.classList.remove('active'));
        tabs[1].classList.add('active');
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Validaciones básicas
    if (!email || !password) {
        showMessage('Por favor, completa todos los campos', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Por favor, ingresa un correo electrónico válido', 'error');
        return;
    }
    
    // Verificar si el usuario existe en localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateLoginButton();
        closeLoginModal();
        showMessage(`¡Bienvenida, ${user.name}!`, 'success');
    } else {
        showMessage('Correo electrónico o contraseña incorrectos', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validaciones
    if (!name || !email || !password || !confirmPassword) {
        showMessage('Por favor, completa todos los campos', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Por favor, ingresa un correo electrónico válido', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Las contraseñas no coinciden', 'error');
        return;
    }
    
    // Verificar si el usuario ya existe
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        showMessage('Ya existe una cuenta con este correo electrónico', 'error');
        return;
    }
    
    // Crear nuevo usuario
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        registeredAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Iniciar sesión automáticamente
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateLoginButton();
    closeLoginModal();
    showMessage(`¡Registro exitoso! Bienvenida, ${newUser.name}!`, 'success');
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function updateLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        if (currentUser) {
            loginBtn.textContent = `Hola, ${currentUser.name}`;
            loginBtn.onclick = function(e) {
                e.preventDefault();
                logout();
            };
        } else {
            loginBtn.textContent = 'Iniciar Sesión';
            loginBtn.onclick = function(e) {
                e.preventDefault();
                showLogin();
            };
        }
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateLoginButton();
    showMessage('Sesión cerrada exitosamente', 'info');
}

function closeLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'none';
    }
}

function handleContact(event) {
    event.preventDefault();
    
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    
    // Validaciones
    if (!name || !email || !subject || !message) {
        showMessage('Por favor, completa todos los campos', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Por favor, ingresa un correo electrónico válido', 'error');
        return;
    }
    
    if (message.length < 10) {
        showMessage('El mensaje debe tener al menos 10 caracteres', 'error');
        return;
    }
    
    // Simular envío del formulario (en una aplicación real se enviaría a un servidor)
    const contactData = {
        id: Date.now(),
        name: name,
        email: email,
        subject: subject,
        message: message,
        timestamp: new Date().toISOString()
    };
    
    // Guardar en localStorage para demostración
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    contacts.push(contactData);
    localStorage.setItem('contacts', JSON.stringify(contacts));
    
    // Limpiar formulario
    document.getElementById('contactForm').reset();
    
    // Mostrar mensaje de éxito
    showMessage('¡Mensaje enviado exitosamente! Te contactaremos pronto.', 'success');
    
    console.log('Mensaje de contacto enviado:', contactData);
}

function showCart() {
    updateCartDisplay();
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'block';
    }
}

function showProductDetail(productId) {
    const product = sampleProducts.find(p => p.id === productId);
    if (!product) return;
    
    const productModal = document.getElementById('productModal');
    const productModalBody = document.getElementById('productModalBody');
    
    if (productModal && productModalBody) {
        productModalBody.innerHTML = `
            <div class="product-detail">
                <div class="product-detail-image">
                    <svg width="100%" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100%" height="100%" fill="#f8f9fa"/>
                        <rect x="50" y="50" width="200" height="200" fill="#e9ecef" stroke="#dee2e6" stroke-width="2" rx="8"/>
                        <circle cx="120" cy="120" r="15" fill="#adb5bd"/>
                        <polygon points="80,220 120,180 160,200 200,160 200,250 80,250" fill="#ced4da"/>
                        <text x="150" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6c757d">${product.name}</text>
                    </svg>
                </div>
                <div class="product-detail-info">
                    <h3>${product.name}</h3>
                    <p class="product-detail-price">${formatPrice(product.price)}</p>
                    <p class="product-detail-description">${product.description}</p>
                    
                    <div class="product-specs">
                        <h4>Especificaciones:</h4>
                        <p><strong>Materiales:</strong> ${product.materials}</p>
                        <p><strong>Tallas disponibles:</strong> ${product.size.join(', ')}</p>
                        <p><strong>Color:</strong> ${product.color}</p>
                        <p><strong>Origen:</strong> ${product.origin}</p>
                        <p><strong>Stock disponible:</strong> ${product.stock} unidades</p>
                    </div>
                    
                    <button class="add-to-cart" onclick="addToCart(${product.id}); closeProductModal();">
                        Añadir al Carrito
                    </button>
                </div>
            </div>
        `;
        productModal.style.display = 'block';
    }
}

function closeProductModal() {
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.style.display = 'none';
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${formatPrice(item.price)} c/u</p>
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})" class="quantity-btn">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})" class="quantity-btn">+</button>
                    <button onclick="removeFromCart(${item.id})" class="remove-btn">🗑️</button>
                </div>
                <div class="cart-item-total">
                    ${formatPrice(itemTotal)}
                </div>
            </div>
        `;
    }).join('');
    
    cartTotal.textContent = formatPrice(total);
}

function updateCartItemQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartCount();
        updateCartDisplay();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    updateCartDisplay();
    showMessage('Producto eliminado del carrito', 'info');
}

function closeCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'none';
    }
}

function clearCart() {
    if (cart.length === 0) {
        showMessage('El carrito ya está vacío', 'info');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        cart = [];
        saveCart();
        updateCartCount();
        updateCartDisplay();
        showMessage('Carrito vaciado', 'info');
    }
}

function checkout() {
    if (cart.length === 0) {
        showMessage('Tu carrito está vacío', 'warning');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showMessage(`Procesando compra por ${formatPrice(total)}...`, 'success');
    
    // Simular proceso de compra
    setTimeout(() => {
        cart = [];
        saveCart();
        updateCartCount();
        updateCartDisplay();
        closeCart();
        showMessage('¡Compra realizada con éxito!', 'success');
    }, 2000);
}

function showMessage(text, type = 'info') {
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    document.body.insertBefore(message, document.body.firstChild);
    
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// Event listeners adicionales
window.addEventListener('hashchange', function() {
    routeTo(window.location.hash);
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal[style*="block"]');
        openModals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
});

console.log('Script main.js cargado completamente');