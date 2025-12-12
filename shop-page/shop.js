// =====================================================
// SHOP PAGE - JavaScript
// CLB Bóng Bàn Lê Quý Đôn
// =====================================================

// Product Data
const products = [
    {
        id: 1,
        name: 'Vợt Butterfly Timo Boll ALC',
        category: 'rackets',
        price: 2850000,
        originalPrice: 3200000,
        image: 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=400&q=80',
        badge: 'Bán Chạy',
        badgeType: 'hot'
    },
    {
        id: 2,
        name: 'Bóng Nittaku Premium 3 Sao (6 quả)',
        category: 'balls',
        price: 180000,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
        badge: 'Mới',
        badgeType: 'new'
    },
    {
        id: 3,
        name: 'Mặt Vợt Tenergy 05',
        category: 'rubbers',
        price: 1650000,
        originalPrice: 1900000,
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80',
        badge: 'Giảm 13%',
        badgeType: 'sale'
    },
    {
        id: 4,
        name: 'Túi Đựng Vợt Butterfly Premium',
        category: 'accessories',
        price: 450000,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
        badge: null,
        badgeType: null
    },
    {
        id: 5,
        name: 'Vợt DHS Hurricane Long V',
        category: 'rackets',
        price: 1950000,
        originalPrice: 2200000,
        image: 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=400&q=80',
        badge: 'Giảm 11%',
        badgeType: 'sale'
    },
    {
        id: 6,
        name: 'Bóng DHS D40+ 3 Sao (10 quả)',
        category: 'balls',
        price: 250000,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
        badge: null,
        badgeType: null
    },
    {
        id: 7,
        name: 'Mặt Vợt Rakza 7',
        category: 'rubbers',
        price: 980000,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80',
        badge: 'Mới',
        badgeType: 'new'
    },
    {
        id: 8,
        name: 'Băng Cuốn Cán Vợt (5 cuộn)',
        category: 'accessories',
        price: 85000,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
        badge: null,
        badgeType: null
    },
    {
        id: 9,
        name: 'Vợt Yasaka Ma Lin Extra Offensive',
        category: 'rackets',
        price: 1580000,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=400&q=80',
        badge: null,
        badgeType: null
    },
    {
        id: 10,
        name: 'Keo Dán Mặt Vợt Butterfly',
        category: 'accessories',
        price: 120000,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
        badge: null,
        badgeType: null
    },
    {
        id: 11,
        name: 'Mặt Vợt Hurricane 3 Neo',
        category: 'rubbers',
        price: 750000,
        originalPrice: 850000,
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80',
        badge: 'Bán Chạy',
        badgeType: 'hot'
    },
    {
        id: 12,
        name: 'Bóng Joola Flash 3 Sao (12 quả)',
        category: 'balls',
        price: 320000,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
        badge: null,
        badgeType: null
    }
];

// Cart State
let cart = JSON.parse(localStorage.getItem('lqd_shop_cart')) || [];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const categoryBtns = document.querySelectorAll('.category-btn');
const navbar = document.getElementById('navbar');
const navbarToggle = document.getElementById('navbarToggle');
const navbarMenu = document.getElementById('navbarMenu');

// Format Price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

// Render Products
function renderProducts(category = 'all') {
    const filteredProducts = category === 'all'
        ? products
        : products.filter(p => p.category === category);

    productsGrid.innerHTML = filteredProducts.map(product => `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.badge ? `<span class="product-badge ${product.badgeType}">${product.badge}</span>` : ''}
      </div>
      <div class="product-content">
        <span class="product-category">${getCategoryName(product.category)}</span>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-price">
          <span class="current">${formatPrice(product.price)}</span>
          ${product.originalPrice ? `<span class="original">${formatPrice(product.originalPrice)}</span>` : ''}
        </div>
        <div class="product-actions">
          <button class="btn-add-cart" onclick="addToCart(${product.id})">
            <i class="fas fa-cart-plus"></i> Thêm vào giỏ
          </button>
          <button class="btn-wishlist" onclick="toggleWishlist(${product.id})">
            <i class="far fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Get Category Name
function getCategoryName(category) {
    const names = {
        rackets: 'Vợt',
        balls: 'Bóng',
        rubbers: 'Mặt Vợt',
        accessories: 'Phụ Kiện'
    };
    return names[category] || category;
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    openCart();

    // Animation feedback
    const btn = document.querySelector(`[data-product-id="${productId}"] .btn-add-cart`);
    if (btn) {
        btn.innerHTML = '<i class="fas fa-check"></i> Đã thêm!';
        btn.style.background = '#2e7d32';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-cart-plus"></i> Thêm vào giỏ';
            btn.style.background = '';
        }, 1500);
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// Update Quantity
function updateQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart();
    updateCartUI();
}

// Save Cart to LocalStorage
function saveCart() {
    localStorage.setItem('lqd_shop_cart', JSON.stringify(cart));
}

// Update Cart UI
function updateCartUI() {
    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update items list
    if (cart.length === 0) {
        cartItems.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-cart"></i>
        <p>Giỏ hàng trống</p>
      </div>
    `;
    } else {
        cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.name}</h4>
          <p class="cart-item-price">${formatPrice(item.price)}</p>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');
    }

    // Update total
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = formatPrice(totalPrice);
}

// Open/Close Cart
function openCart() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Toggle Wishlist (placeholder)
function toggleWishlist(productId) {
    const btn = document.querySelector(`[data-product-id="${productId}"] .btn-wishlist i`);
    if (btn) {
        btn.classList.toggle('far');
        btn.classList.toggle('fas');
        if (btn.classList.contains('fas')) {
            btn.style.color = '#d32f2f';
        } else {
            btn.style.color = '';
        }
    }
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const message = `Xin chào! Tôi muốn đặt hàng:\n\n${cart.map(item =>
        `- ${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`
    ).join('\n')}\n\nTổng cộng: ${formatPrice(total)}`;

    // Open Zalo with message
    const zaloNumber = '0977991490';
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://zalo.me/${zaloNumber}?text=${encodedMessage}`, '_blank');
}

// Category Filter
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderProducts(btn.dataset.category);
    });
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
navbarToggle.addEventListener('click', () => {
    navbarMenu.classList.toggle('active');
    navbarToggle.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navbarMenu.contains(e.target) && !navbarToggle.contains(e.target)) {
        navbarMenu.classList.remove('active');
        navbarToggle.classList.remove('active');
    }
});

// Event Listeners
cartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openCart();
});

cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
checkoutBtn.addEventListener('click', checkout);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();
});
