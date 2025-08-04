// ===== THEMARKET4ALL - MAIN JAVASCRIPT =====

// Global variables
let cart = [];
let cartTotal = 0;
let isSearchOpen = false;
let products = [];
let currentProduct = null;
let API_BASE_URL = 'http://localhost:3000/api';

// DOM elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('.nav-menu');
const searchInput = document.querySelector('.search-bar input');
const searchButton = document.querySelector('.search-bar button');
const cartIcon = document.querySelector('.cart-icon');
const cartCount = document.querySelector('.cart-count');
const header = document.querySelector('.header');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadCartFromStorage();
    createScrollToTopButton();
    setupIntersectionObserver();
});

// ===== APP INITIALIZATION =====
function initializeApp() {
    console.log('TheMarket4All - Initializing...');
    
    // Add loading animation to elements
    const elementsToAnimate = document.querySelectorAll('.category-card, .product-card');
    elementsToAnimate.forEach((element, index) => {
        element.classList.add('loading');
        setTimeout(() => {
            element.classList.add('loaded');
        }, index * 100);
    });
}

// ===== EVENT LISTENERS SETUP =====
function setupEventListeners() {
    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Navigation smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });

    // Add to cart functionality
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });

    // Search functionality
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', handleSearchKeypress);
        searchInput.addEventListener('input', handleSearchInput);
    }

    // Header scroll effect
    window.addEventListener('scroll', handleScroll);

    // Cart icon click
    if (cartIcon) {
        cartIcon.addEventListener('click', showCartModal);
    }

    // Category card clicks
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', handleCategoryClick);
    });

    // Product card clicks
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', handleProductClick);
    });

            // Logo click
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Load products from API
        loadProductsFromAPI();
    }

// ===== MOBILE MENU FUNCTIONALITY =====
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    
    // Change hamburger icon
    const icon = mobileMenuBtn.querySelector('i');
    if (navMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

// ===== SMOOTH SCROLLING =====
function handleSmoothScroll(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const target = document.querySelector(targetId);
    
    if (target) {
        const headerHeight = header.offsetHeight;
        const targetPosition = target.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Close mobile menu if open
        if (navMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    }
}

// ===== CART FUNCTIONALITY =====
function handleAddToCart(e) {
    e.stopPropagation();
    
    const productCard = this.closest('.product-card');
    const productTitle = productCard.querySelector('.product-title').textContent;
    const productPrice = productCard.querySelector('.product-price').textContent;
    const productImage = productCard.querySelector('.product-image i').className;
    
    // Add to cart
    addToCart({
        id: Date.now(),
        name: productTitle,
        price: productPrice,
        image: productImage,
        quantity: 1
    });
    
    // Visual feedback
    showAddToCartAnimation(this);
    
    // Update cart count
    updateCartCount();
    
    // Save to localStorage
    saveCartToStorage();
    
    // Show notification
    showNotification(`${productTitle} added to cart!`, 'success');
}

function addToCart(product) {
    const existingItem = cart.find(item => item.name === product.name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(product);
    }
    
    cartTotal = cart.reduce((total, item) => {
        const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
        return total + (price * item.quantity);
    }, 0);
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Add animation
    cartCount.style.animation = 'none';
    setTimeout(() => {
        cartCount.style.animation = 'pulse 0.6s ease';
    }, 10);
}

function showAddToCartAnimation(button) {
    button.textContent = 'Added!';
    button.classList.add('added');
    
    setTimeout(() => {
        button.textContent = 'Add to Cart';
        button.classList.remove('added');
    }, 1000);
}

// ===== SEARCH FUNCTIONALITY =====
function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        performSearch(query);
    } else {
        showNotification('Please enter a search term', 'warning');
    }
}

function handleSearchKeypress(e) {
    if (e.key === 'Enter') {
        handleSearch();
    }
}

function handleSearchInput(e) {
    const query = e.target.value.trim();
    
    // Real-time search suggestions (if query is long enough)
    if (query.length >= 2) {
        showSearchSuggestions(query);
    } else {
        hideSearchSuggestions();
    }
}

function performSearch(query) {
    console.log(`Searching for: ${query}`);
    
    // Simulate search results
    const products = document.querySelectorAll('.product-card');
    let foundProducts = 0;
    
    products.forEach(product => {
        const title = product.querySelector('.product-title').textContent.toLowerCase();
        if (title.includes(query.toLowerCase())) {
            product.style.display = 'block';
            product.style.animation = 'fadeIn 0.5s ease';
            foundProducts++;
        } else {
            product.style.display = 'none';
        }
    });
    
    if (foundProducts === 0) {
        showNotification('No products found for your search', 'info');
    } else {
        showNotification(`Found ${foundProducts} product(s)`, 'success');
    }
}

function showSearchSuggestions(query) {
    // This would typically fetch from an API
    const suggestions = ['apples', 'bread', 'milk', 'cheese', 'chicken'];
    const filtered = suggestions.filter(s => s.includes(query.toLowerCase()));
    
    // Create suggestions dropdown
    let suggestionsHTML = '';
    filtered.forEach(suggestion => {
        suggestionsHTML += `<div class="suggestion-item">${suggestion}</div>`;
    });
    
    // You could create a suggestions dropdown here
    console.log('Suggestions:', filtered);
}

function hideSearchSuggestions() {
    // Hide suggestions dropdown
}

// ===== SCROLL EFFECTS =====
function handleScroll() {
    const scrollY = window.scrollY;
    
    // Header background effect
    if (scrollY > 100) {
        header.style.background = 'rgba(102, 126, 234, 0.95)';
    } else {
        header.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    // Scroll to top button
    const scrollToTopBtn = document.querySelector('.scroll-to-top');
    if (scrollToTopBtn) {
        if (scrollY > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    }
    
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
}

// ===== INTERSECTION OBSERVER =====
function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const elementsToObserve = document.querySelectorAll('.category-card, .product-card, .section-title');
    elementsToObserve.forEach(el => observer.observe(el));
}

// ===== CART MODAL =====
function showCartModal() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'info');
        return;
    }
    
    // Create modal HTML
    const modalHTML = `
        <div class="cart-modal-overlay">
            <div class="cart-modal">
                <div class="cart-modal-header">
                    <h3>Shopping Cart</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="cart-items">
                    ${generateCartItemsHTML()}
                </div>
                <div class="cart-total">
                    <strong>Total: $${cartTotal.toFixed(2)}</strong>
                </div>
                <div class="cart-actions">
                    <button class="clear-cart">Clear Cart</button>
                    <button class="checkout-btn">Checkout</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners
    setupCartModalEvents();
    
    // Add CSS for modal
    addCartModalStyles();
}

function generateCartItemsHTML() {
    return cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <i class="${item.image}"></i>
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>${item.price}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-item" data-id="${item.id}">&times;</button>
        </div>
    `).join('');
}

function setupCartModalEvents() {
    const modal = document.querySelector('.cart-modal-overlay');
    const closeBtn = modal.querySelector('.close-modal');
    const clearBtn = modal.querySelector('.clear-cart');
    const checkoutBtn = modal.querySelector('.checkout-btn');
    
    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Clear cart
    clearBtn.addEventListener('click', () => {
        cart = [];
        cartTotal = 0;
        updateCartCount();
        saveCartToStorage();
        modal.remove();
        showNotification('Cart cleared', 'success');
    });
    
    // Checkout
    checkoutBtn.addEventListener('click', () => {
        modal.remove();
        showPaymentModal();
    });
    
    // Quantity controls
    modal.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', handleQuantityChange);
    });
    
    // Remove items
    modal.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', handleRemoveItem);
    });
}

function handleQuantityChange(e) {
    const itemId = parseInt(e.target.dataset.id);
    const item = cart.find(item => item.id === itemId);
    const isPlus = e.target.classList.contains('plus');
    
    if (isPlus) {
        item.quantity++;
    } else if (item.quantity > 1) {
        item.quantity--;
    }
    
    // Update cart total
    cartTotal = cart.reduce((total, item) => {
        const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
        return total + (price * item.quantity);
    }, 0);
    
    // Update display
    updateCartCount();
    saveCartToStorage();
    
    // Refresh modal
    const modal = document.querySelector('.cart-modal-overlay');
    if (modal) {
        modal.querySelector('.cart-items').innerHTML = generateCartItemsHTML();
        modal.querySelector('.cart-total strong').textContent = `Total: $${cartTotal.toFixed(2)}`;
        setupCartModalEvents();
    }
}

function handleRemoveItem(e) {
    const itemId = parseInt(e.target.dataset.id);
    cart = cart.filter(item => item.id !== itemId);
    
    cartTotal = cart.reduce((total, item) => {
        const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
        return total + (price * item.quantity);
    }, 0);
    
    updateCartCount();
    saveCartToStorage();
    
    // Refresh modal
    const modal = document.querySelector('.cart-modal-overlay');
    if (modal) {
        modal.querySelector('.cart-items').innerHTML = generateCartItemsHTML();
        modal.querySelector('.cart-total strong').textContent = `Total: $${cartTotal.toFixed(2)}`;
        setupCartModalEvents();
    }
}

// ===== CATEGORY & PRODUCT CLICKS =====
function handleCategoryClick(e) {
    const categoryName = this.querySelector('h3').textContent;
    showNotification(`Browsing ${categoryName}`, 'info');
    
    // You could implement category filtering here
    console.log('Category clicked:', categoryName);
}

function handleProductClick(e) {
    if (!e.target.classList.contains('add-to-cart')) {
        const productName = this.querySelector('.product-title').textContent;
        showNotification(`Viewing details for ${productName}`, 'info');
        
        // You could implement product detail modal here
        console.log('Product clicked:', productName);
    }
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add styles
    addNotificationStyles();
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

// ===== SCROLL TO TOP BUTTON =====
function createScrollToTopButton() {
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    document.body.appendChild(scrollToTopBtn);
}

// ===== LOCAL STORAGE =====
function saveCartToStorage() {
    localStorage.setItem('themarket4all_cart', JSON.stringify(cart));
    localStorage.setItem('themarket4all_cartTotal', cartTotal.toString());
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('themarket4all_cart');
    const savedTotal = localStorage.getItem('themarket4all_cartTotal');
    
    if (savedCart) {
        cart = JSON.parse(savedCart);
        cartTotal = parseFloat(savedTotal) || 0;
        updateCartCount();
    }
}

// ===== STYLES INJECTION =====
function addCartModalStyles() {
    const styles = `
        .cart-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease;
        }
        
        .cart-modal {
            background: white;
            border-radius: 15px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        
        .cart-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .close-modal {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
            transition: color 0.3s ease;
        }
        
        .close-modal:hover {
            color: #ff4757;
        }
        
        .cart-item {
            display: flex;
            align-items: center;
            padding: 1rem 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .cart-item-image {
            width: 50px;
            height: 50px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            margin-right: 1rem;
        }
        
        .cart-item-details {
            flex: 1;
        }
        
        .cart-item-details h4 {
            margin: 0 0 0.5rem 0;
            color: #333;
        }
        
        .cart-item-details p {
            margin: 0;
            color: #667eea;
            font-weight: bold;
        }
        
        .quantity-controls {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        
        .quantity-btn {
            background: #667eea;
            color: white;
            border: none;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        
        .quantity-btn:hover {
            background: #5a6fd8;
        }
        
        .quantity {
            font-weight: bold;
            min-width: 20px;
            text-align: center;
        }
        
        .remove-item {
            background: #ff4757;
            color: white;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        
        .remove-item:hover {
            background: #e74c3c;
        }
        
        .cart-total {
            text-align: right;
            font-size: 1.2rem;
            margin: 1.5rem 0;
            padding-top: 1rem;
            border-top: 2px solid #f0f0f0;
        }
        
        .cart-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
        }
        
        .clear-cart, .checkout-btn {
            padding: 0.8rem 1.5rem;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .clear-cart {
            background: #95a5a6;
            color: white;
        }
        
        .clear-cart:hover {
            background: #7f8c8d;
        }
        
        .checkout-btn {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
        }
        
        .checkout-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }
    `;
    
    injectStyles(styles);
}

function addNotificationStyles() {
    const styles = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 10px;
            padding: 1rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 3000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .notification-message {
            flex: 1;
            margin-right: 1rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: #666;
            transition: color 0.3s ease;
        }
        
        .notification-close:hover {
            color: #ff4757;
        }
        
        .notification-info {
            border-left: 4px solid #3498db;
        }
        
        .notification-success {
            border-left: 4px solid #27ae60;
        }
        
        .notification-warning {
            border-left: 4px solid #f39c12;
        }
        
        .notification-error {
            border-left: 4px solid #e74c3c;
        }
    `;
    
    injectStyles(styles);
}

function injectStyles(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// ===== API INTEGRATION =====
async function loadProductsFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products. Please try again later.', 'error');
        // Fallback to static products
        loadFallbackProducts();
    }
}

function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <i class="${product.image}"></i>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">$${product.price}/${product.unit}</p>
                <div class="product-rating">
                    <i class="fas fa-star"></i>
                    <span>${product.rating} (${product.reviews} reviews)</span>
                </div>
                <button class="add-to-cart">Add to Cart</button>
            </div>
        </div>
    `).join('');

    // Re-attach event listeners
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', handleProductClick);
    });
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });
}

function loadFallbackProducts() {
    // Static fallback products
    products = [
        {
            id: 'apple-organic',
            name: 'Fresh Organic Apples',
            price: 2.99,
            unit: 'lb',
            image: 'fas fa-apple-alt',
            description: 'Sweet and crisp organic apples, perfect for snacking or baking.',
            rating: 4.8,
            reviews: 124
        },
        {
            id: 'chicken-breast',
            name: 'Chicken Breast',
            price: 8.99,
            unit: 'lb',
            image: 'fas fa-drumstick-bite',
            description: 'Boneless, skinless chicken breast - perfect for healthy meals.',
            rating: 4.6,
            reviews: 89
        }
        // Add more fallback products as needed
    ];
    renderProducts();
}

// ===== PRODUCT MODAL FUNCTIONALITY =====
function setupModalEventListeners() {
    // Product modal
    const productModal = document.getElementById('product-modal');
    const closeModal = document.getElementById('close-modal');
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentModal = document.getElementById('close-payment-modal');
    const cancelPayment = document.getElementById('cancel-payment');
    const processPayment = document.getElementById('process-payment');

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            productModal.style.display = 'none';
        });
    }

    if (closePaymentModal) {
        closePaymentModal.addEventListener('click', () => {
            paymentModal.style.display = 'none';
        });
    }

    if (cancelPayment) {
        cancelPayment.addEventListener('click', () => {
            paymentModal.style.display = 'none';
        });
    }

    if (processPayment) {
        processPayment.addEventListener('click', handlePayment);
    }

    // Tab functionality
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', handleTabClick);
    });

    // Quantity controls
    const qtyDecrease = document.getElementById('qty-decrease');
    const qtyIncrease = document.getElementById('qty-increase');
    const qtyInput = document.getElementById('product-quantity');

    if (qtyDecrease) {
        qtyDecrease.addEventListener('click', () => {
            const currentValue = parseInt(qtyInput.value);
            if (currentValue > 1) {
                qtyInput.value = currentValue - 1;
            }
        });
    }

    if (qtyIncrease) {
        qtyIncrease.addEventListener('click', () => {
            const currentValue = parseInt(qtyInput.value);
            if (currentValue < 99) {
                qtyInput.value = currentValue + 1;
            }
        });
    }

    // Modal add to cart
    const modalAddToCart = document.getElementById('modal-add-to-cart');
    if (modalAddToCart) {
        modalAddToCart.addEventListener('click', handleModalAddToCart);
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.style.display = 'none';
        }
        if (e.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });
}

function handleProductClick(e) {
    const productCard = e.currentTarget;
    const productId = productCard.dataset.productId;
    
    if (!productId) return;
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentProduct = product;
    showProductModal(product);
}

function showProductModal(product) {
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    // Update modal content
    document.getElementById('modal-product-title').textContent = product.name;
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-product-price').textContent = `$${product.price}/${product.unit}`;
    document.getElementById('modal-product-description').textContent = product.description;
    
    const imageElement = document.getElementById('modal-product-image');
    if (imageElement) {
        imageElement.innerHTML = `<i class="${product.image}"></i>`;
    }

    // Update rating
    const ratingElement = document.getElementById('modal-product-rating');
    if (ratingElement) {
        ratingElement.innerHTML = `
            <i class="fas fa-star"></i>
            <span>${product.rating} (${product.reviews} reviews)</span>
        `;
    }

    // Update stock status
    const stockElement = document.getElementById('modal-product-stock');
    if (stockElement) {
        const stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock';
        const stockIcon = product.stock > 0 ? 'fas fa-check-circle' : 'fas fa-times-circle';
        const stockColor = product.stock > 0 ? '#27ae60' : '#e74c3c';
        
        stockElement.innerHTML = `
            <i class="${stockIcon}" style="color: ${stockColor}"></i>
            <span>${stockStatus}</span>
        `;
    }

    // Load tab content
    loadProductTabs(product);

    // Show modal
    modal.style.display = 'block';
}

function loadProductTabs(product) {
    // Description tab (already loaded)
    
    // Nutrition tab
    if (product.details && product.details.nutrition) {
        const nutritionInfo = document.getElementById('nutrition-info');
        if (nutritionInfo) {
            nutritionInfo.innerHTML = Object.entries(product.details.nutrition)
                .map(([key, value]) => `
                    <div class="nutrition-item">
                        <div class="label">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
                        <div class="value">${value}</div>
                    </div>
                `).join('');
        }
    }

    // Details tab
    if (product.details) {
        const detailsList = document.getElementById('product-details');
        if (detailsList) {
            const details = [
                { label: 'Ingredients', value: product.details.ingredients?.join(', ') || 'N/A' },
                { label: 'Allergens', value: product.details.allergens?.join(', ') || 'None' },
                { label: 'Storage', value: product.details.storage || 'N/A' },
                { label: 'Origin', value: product.details.origin || 'N/A' },
                { label: 'Certifications', value: product.details.certifications?.join(', ') || 'N/A' }
            ];

            detailsList.innerHTML = details.map(detail => `
                <div class="detail-item">
                    <span class="label">${detail.label}:</span>
                    <span class="value">${detail.value}</span>
                </div>
            `).join('');
        }
    }

    // Reviews tab
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
        const averageRating = document.getElementById('average-rating');
        if (averageRating) {
            averageRating.innerHTML = `
                <span class="rating-number">${product.rating}</span>
                <div class="stars">
                    ${generateStars(product.rating)}
                </div>
                <span class="total-reviews">${product.reviews} reviews</span>
            `;
        }

        // Generate mock reviews
        const reviewsList = document.getElementById('reviews-list');
        if (reviewsList) {
            const mockReviews = generateMockReviews(product.reviews);
            reviewsList.innerHTML = mockReviews.map(review => `
                <div class="review-item">
                    <div class="review-header">
                        <div class="reviewer-name">${review.name}</div>
                        <div class="review-rating">
                            ${generateStars(review.rating)}
                        </div>
                    </div>
                    <div class="review-text">${review.text}</div>
                    <div class="review-date">${review.date}</div>
                </div>
            `).join('');
        }
    }
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    return stars;
}

function generateMockReviews(count) {
    const names = ['John D.', 'Sarah M.', 'Mike R.', 'Lisa K.', 'David P.', 'Emma W.', 'Tom H.', 'Anna L.'];
    const reviews = [
        'Great quality product! Highly recommend.',
        'Fresh and delicious. Will buy again.',
        'Excellent value for money.',
        'Perfect for my needs.',
        'Fast delivery and good quality.',
        'Love this product!',
        'Good price and quality.',
        'Exactly what I was looking for.'
    ];

    const mockReviews = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
        mockReviews.push({
            name: names[i % names.length],
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            text: reviews[i % reviews.length],
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        });
    }
    return mockReviews;
}

function handleTabClick(e) {
    const tabBtn = e.currentTarget;
    const tabName = tabBtn.dataset.tab;
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    // Add active class to clicked tab
    tabBtn.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function handleModalAddToCart() {
    if (!currentProduct) return;
    
    const quantity = parseInt(document.getElementById('product-quantity').value);
    
    addToCart({
        id: currentProduct.id,
        name: currentProduct.name,
        price: `$${currentProduct.price}/${currentProduct.unit}`,
        image: currentProduct.image,
        quantity: quantity
    });
    
    updateCartCount();
    saveCartToStorage();
    showNotification(`${currentProduct.name} added to cart!`, 'success');
    
    // Close modal
    document.getElementById('product-modal').style.display = 'none';
}

// ===== PAYMENT FUNCTIONALITY =====
function handlePayment() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    // Validate forms
    const customerForm = document.getElementById('customer-form');
    const paymentForm = document.getElementById('payment-form');
    
    if (!customerForm.checkValidity() || !paymentForm.checkValidity()) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }

    // Collect form data
    const customerInfo = {
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };

    const paymentInfo = {
        cardNumber: document.getElementById('card-number').value,
        expiry: document.getElementById('expiry').value,
        cvv: document.getElementById('cvv').value,
        cardName: document.getElementById('card-name').value
    };

    // Process payment
    processPaymentAPI(customerInfo, paymentInfo);
}

async function processPaymentAPI(customerInfo, paymentInfo) {
    try {
        // Create order
        const orderResponse = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: cart,
                customerInfo: customerInfo,
                totalAmount: cartTotal
            })
        });

        if (!orderResponse.ok) {
            throw new Error('Failed to create order');
        }

        const orderData = await orderResponse.json();

        // Process payment
        const paymentResponse = await fetch(`${API_BASE_URL}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: orderData.orderId,
                paymentMethod: 'credit_card',
                cardInfo: paymentInfo,
                amount: cartTotal
            })
        });

        if (!paymentResponse.ok) {
            throw new Error('Failed to process payment');
        }

        const paymentData = await paymentResponse.json();

        // Show processing message
        showNotification('Processing payment...', 'info');

        // Check payment status after delay
        setTimeout(async () => {
            try {
                const statusResponse = await fetch(`${API_BASE_URL}/payments/${paymentData.paymentId}`);
                const statusData = await statusResponse.json();

                if (statusData.status === 'completed') {
                    showNotification('Payment successful! Your order has been placed.', 'success');
                    // Clear cart
                    cart = [];
                    cartTotal = 0;
                    updateCartCount();
                    saveCartToStorage();
                    document.getElementById('payment-modal').style.display = 'none';
                } else {
                    showNotification('Payment failed. Please try again.', 'error');
                }
            } catch (error) {
                showNotification('Error checking payment status.', 'error');
            }
        }, 3000);

    } catch (error) {
        console.error('Payment error:', error);
        showNotification('Payment processing failed. Please try again.', 'error');
    }
}

function showPaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (!modal) return;

    // Update order summary
    const cartItemsSummary = document.getElementById('cart-items-summary');
    const orderTotalAmount = document.getElementById('order-total-amount');

    if (cartItemsSummary) {
        cartItemsSummary.innerHTML = cart.map(item => `
            <div class="cart-item-summary">
                <span>${item.name} x${item.quantity}</span>
                <span>$${(parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
    }

    if (orderTotalAmount) {
        orderTotalAmount.textContent = `$${cartTotal.toFixed(2)}`;
    }

    modal.style.display = 'block';
}

// ===== EXPORT FOR GLOBAL ACCESS =====
window.TheMarket4All = {
    cart,
    cartTotal,
    addToCart,
    updateCartCount,
    showNotification,
    performSearch
};

console.log('TheMarket4All - JavaScript loaded successfully! 🛒✨');
