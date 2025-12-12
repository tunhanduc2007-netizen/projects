import React, { useState } from 'react';

interface Product {
    id: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    reviews: number;
    badge?: string;
    inStock: boolean;
}

const products: Product[] = [
    {
        id: 1,
        name: 'Butterfly Timo Boll ALC',
        brand: 'Butterfly',
        category: 'Cốt vợt',
        price: 3500000,
        originalPrice: 4200000,
        image: 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=400&q=80',
        rating: 5,
        reviews: 128,
        badge: 'Bán chạy',
        inStock: true
    },
    {
        id: 2,
        name: 'Tenergy 05',
        brand: 'Butterfly',
        category: 'Mặt vợt',
        price: 1800000,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
        rating: 5,
        reviews: 256,
        badge: 'Hot',
        inStock: true
    },
    {
        id: 3,
        name: 'Nittaku Premium 3-Star',
        brand: 'Nittaku',
        category: 'Bóng',
        price: 450000,
        originalPrice: 520000,
        image: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=400&q=80',
        rating: 4,
        reviews: 89,
        inStock: true
    },
    {
        id: 4,
        name: 'Yasaka Ma Lin Carbon',
        brand: 'Yasaka',
        category: 'Cốt vợt',
        price: 2800000,
        image: 'https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?w=400&q=80',
        rating: 4,
        reviews: 67,
        badge: 'Mới',
        inStock: true
    },
    {
        id: 5,
        name: 'Butterfly Lezoline',
        brand: 'Butterfly',
        category: 'Giày',
        price: 2200000,
        originalPrice: 2600000,
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80',
        rating: 5,
        reviews: 45,
        inStock: true
    },
    {
        id: 6,
        name: 'DHS Hurricane 3',
        brand: 'DHS',
        category: 'Mặt vợt',
        price: 650000,
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
        rating: 4,
        reviews: 312,
        badge: 'Giảm giá',
        inStock: true
    },
    {
        id: 7,
        name: 'Butterfly Backpack',
        brand: 'Butterfly',
        category: 'Phụ kiện',
        price: 1200000,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
        rating: 4,
        reviews: 34,
        inStock: true
    },
    {
        id: 8,
        name: 'Nittaku Acoustic Carbon',
        brand: 'Nittaku',
        category: 'Cốt vợt',
        price: 4200000,
        originalPrice: 4800000,
        image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80',
        rating: 5,
        reviews: 78,
        badge: 'Cao cấp',
        inStock: false
    }
];

const categories = ['Tất cả', 'Cốt vợt', 'Mặt vợt', 'Bóng', 'Giày', 'Phụ kiện'];
const brands = ['Tất cả', 'Butterfly', 'Nittaku', 'Yasaka', 'DHS'];

const Shop: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [selectedBrand, setSelectedBrand] = useState('Tất cả');
    const [cart, setCart] = useState<{ product: Product, quantity: number }[]>([]);
    const [showCart, setShowCart] = useState(false);

    const filteredProducts = products.filter(product => {
        const categoryMatch = selectedCategory === 'Tất cả' || product.category === selectedCategory;
        const brandMatch = selectedBrand === 'Tất cả' || product.brand === selectedBrand;
        return categoryMatch && brandMatch;
    });

    const addToCart = (product: Product) => {
        const existingItem = cart.find(item => item.product.id === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.product.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { product, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };

    const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
    const getTotalPrice = () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <i key={i} className={`fas fa-star ${i < rating ? 'star-filled' : 'star-empty'}`}></i>
        ));
    };

    return (
        <section id="shop" className="section shop">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">Cửa Hàng</span>
                    <h2 className="section-title">
                        Dụng Cụ <span>Bóng Bàn</span>
                    </h2>
                    <p className="section-description">
                        Sản phẩm chính hãng từ các thương hiệu hàng đầu thế giới: Butterfly, Nittaku, Yasaka, DHS
                    </p>
                </div>

                {/* Filters */}
                <div className="shop-filters fade-in">
                    <div className="filter-group">
                        <label>Danh mục:</label>
                        <div className="filter-buttons">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="filter-group">
                        <label>Thương hiệu:</label>
                        <div className="filter-buttons">
                            {brands.map(brand => (
                                <button
                                    key={brand}
                                    className={`filter-btn ${selectedBrand === brand ? 'active' : ''}`}
                                    onClick={() => setSelectedBrand(brand)}
                                >
                                    {brand}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cart Button */}
                <button className="cart-floating-btn" onClick={() => setShowCart(!showCart)}>
                    <i className="fas fa-shopping-cart"></i>
                    {getTotalItems() > 0 && <span className="cart-badge">{getTotalItems()}</span>}
                </button>

                {/* Cart Drawer */}
                {showCart && (
                    <div className="cart-drawer">
                        <div className="cart-header">
                            <h3><i className="fas fa-shopping-cart"></i> Giỏ Hàng ({getTotalItems()})</h3>
                            <button className="cart-close" onClick={() => setShowCart(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="cart-items">
                            {cart.length === 0 ? (
                                <p className="cart-empty">Giỏ hàng trống</p>
                            ) : (
                                cart.map(item => (
                                    <div key={item.product.id} className="cart-item">
                                        <img src={item.product.image} alt={item.product.name} />
                                        <div className="cart-item-info">
                                            <h4>{item.product.name}</h4>
                                            <p>{formatPrice(item.product.price)} x {item.quantity}</p>
                                        </div>
                                        <button className="cart-item-remove" onClick={() => removeFromCart(item.product.id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        {cart.length > 0 && (
                            <div className="cart-footer">
                                <div className="cart-total">
                                    <span>Tổng cộng:</span>
                                    <strong>{formatPrice(getTotalPrice())}</strong>
                                </div>
                                <button className="btn btn-primary cart-checkout">
                                    <i className="fas fa-credit-card"></i>
                                    Thanh Toán
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Products Grid */}
                <div className="products-grid">
                    {filteredProducts.map((product, index) => (
                        <div key={product.id} className={`product-card fade-in stagger-${(index % 4) + 1}`}>
                            {product.badge && (
                                <span className={`product-badge badge-${product.badge.toLowerCase().replace(/\s+/g, '')}`}>
                                    {product.badge}
                                </span>
                            )}
                            <div className="product-image">
                                <img src={product.image} alt={product.name} />
                                {!product.inStock && <div className="out-of-stock">Hết hàng</div>}
                            </div>
                            <div className="product-info">
                                <span className="product-brand">{product.brand}</span>
                                <h3 className="product-name">{product.name}</h3>
                                <div className="product-rating">
                                    {renderStars(product.rating)}
                                    <span>({product.reviews} đánh giá)</span>
                                </div>
                                <div className="product-price">
                                    <span className="current-price">{formatPrice(product.price)}</span>
                                    {product.originalPrice && (
                                        <span className="original-price">{formatPrice(product.originalPrice)}</span>
                                    )}
                                </div>
                                <button
                                    className={`btn ${product.inStock ? 'btn-primary' : 'btn-disabled'} product-add-btn`}
                                    onClick={() => product.inStock && addToCart(product)}
                                    disabled={!product.inStock}
                                >
                                    <i className="fas fa-cart-plus"></i>
                                    {product.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Brands Banner */}
                <div className="brands-banner fade-in">
                    <h3>Đối Tác Thương Hiệu</h3>
                    <div className="brands-logos">
                        <div className="brand-logo">
                            <span>BUTTERFLY</span>
                        </div>
                        <div className="brand-logo">
                            <span>NITTAKU</span>
                        </div>
                        <div className="brand-logo">
                            <span>YASAKA</span>
                        </div>
                        <div className="brand-logo">
                            <span>DHS</span>
                        </div>
                        <div className="brand-logo">
                            <span>STIGA</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Shop;
