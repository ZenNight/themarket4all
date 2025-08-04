// ===== THEMARKET4ALL - MAIN JAVASCRIPT =====

// Global variables
let cart = [];
let cartTotal = 0;
let isSearchOpen = false;

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
        showNotification('Checkout functionality coming soon!', 'info');
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
