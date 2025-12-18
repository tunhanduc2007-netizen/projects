import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { shopAPI } from '../services/api';

// ===== INTERFACES =====
interface Product {
    id: string;
    name: string;
    slug: string;
    brand: string;
    category: string;
    price: number;
    original_price?: number;
    image_url: string;
    description: string;
    short_description?: string;
    suitable_for: string[];
    coach_review: string;
    availability: 'in-stock' | 'pre-order' | 'out-of-stock';
    is_recommended?: boolean;
    specs?: { label: string; value: string }[];
    stock?: number;
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface OrderData {
    customer_name: string;
    customer_phone: string;
    customer_note: string;
    payment_method: 'qr' | 'bank';
}

interface OrderResult {
    order_code: string;
    total_amount: number;
    transfer_content: string;
    qr_code_url: string;
    bank: {
        bank_name: string;
        account_number: string;
        account_holder: string;
    };
    items: any[];
}

type CategoryKey = 'all' | 'vot-hoan-chinh' | 'cot-vot' | 'mat-vot' | 'bong' | 'phu-kien';
type ViewMode = 'products' | 'product-detail' | 'checkout' | 'order-result' | 'lookup';

// ===== CATEGORY DATA =====
const categories: { key: CategoryKey; label: string; icon: string }[] = [
    { key: 'all', label: 'Tất cả', icon: 'fa-th-large' },
    { key: 'vot-hoan-chinh', label: 'Vợt hoàn chỉnh', icon: 'fa-table-tennis-paddle-ball' },
    { key: 'cot-vot', label: 'Cốt vợt', icon: 'fa-grip-lines' },
    { key: 'mat-vot', label: 'Mặt vợt', icon: 'fa-circle' },
    { key: 'bong', label: 'Bóng', icon: 'fa-baseball' },
    { key: 'phu-kien', label: 'Phụ kiện', icon: 'fa-bag-shopping' },
];

// ===== HELPER FUNCTIONS =====
const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

const getStatusLabel = (status: string): { label: string; color: string } => {
    const statusMap: Record<string, { label: string; color: string }> = {
        'pending': { label: 'CHỜ THANH TOÁN', color: '#f59e0b' },
        'paid': { label: 'ĐÃ THANH TOÁN', color: '#3b82f6' },
        'confirmed': { label: 'ĐÃ XÁC NHẬN', color: '#10b981' },
        'new': { label: 'MỚI', color: '#6366f1' },
        'processing': { label: 'ĐANG XỬ LÝ', color: '#3b82f6' },
        'done': { label: 'HOÀN TẤT', color: '#10b981' },
        'cancelled': { label: 'ĐÃ HUỶ', color: '#ef4444' },
    };
    return statusMap[status] || { label: status.toUpperCase(), color: '#6b7280' };
};

// ===== MAIN COMPONENT =====
const Shop: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // State
    const [viewMode, setViewMode] = useState<ViewMode>('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cart state
    const [cart, setCart] = useState<CartItem[]>([]);
    const [quantity, setQuantity] = useState(1);

    // Order form state
    const [orderData, setOrderData] = useState<OrderData>({
        customer_name: '',
        customer_phone: '',
        customer_note: '',
        payment_method: 'qr'
    });
    const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Lookup state
    const [lookupCode, setLookupCode] = useState('');
    const [lookupPhone, setLookupPhone] = useState('');
    const [lookupResult, setLookupResult] = useState<any>(null);
    const [lookupError, setLookupError] = useState<string | null>(null);

    // Refs
    const topRef = useRef<HTMLDivElement>(null);

    // ===== EFFECTS =====
    useEffect(() => {
        loadProducts();
    }, [selectedCategory]);

    useEffect(() => {
        const productSlug = searchParams.get('product');
        if (productSlug && products.length > 0) {
            const product = products.find(p => p.slug === productSlug);
            if (product) {
                setSelectedProduct(product);
                setViewMode('product-detail');
            }
        }
    }, [searchParams, products]);

    // ===== API CALLS =====
    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await shopAPI.getProducts({
                category: selectedCategory === 'all' ? undefined : selectedCategory
            });
            setProducts(response.data || []);
        } catch (err: any) {
            setError('Không thể tải danh sách sản phẩm');
            console.error('Error loading products:', err);
        } finally {
            setLoading(false);
        }
    };

    const submitOrder = async () => {
        if (!selectedProduct) return;

        // Validate
        if (!orderData.customer_name.trim()) {
            alert('Vui lòng nhập họ tên');
            return;
        }
        if (!orderData.customer_phone.match(/^(0[1-9])[0-9]{8}$/)) {
            alert('Số điện thoại không hợp lệ (VD: 0912345678)');
            return;
        }

        try {
            setSubmitting(true);
            const response = await shopAPI.createOrder({
                ...orderData,
                items: [{
                    product_id: selectedProduct.id,
                    product_name: selectedProduct.name,
                    product_brand: selectedProduct.brand,
                    price: selectedProduct.price,
                    product_image: selectedProduct.image_url,
                    quantity: quantity
                }]
            });

            setOrderResult(response.data);
            setViewMode('order-result');
            scrollToTop();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi đặt hàng. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const lookupOrder = async () => {
        if (!lookupCode.trim() || !lookupPhone.trim()) {
            setLookupError('Vui lòng nhập đủ mã đơn và số điện thoại');
            return;
        }

        try {
            setLookupError(null);
            const response = await shopAPI.lookupOrder(lookupCode, lookupPhone);
            setLookupResult(response.data);
        } catch (err: any) {
            setLookupError(err.message || 'Không tìm thấy đơn hàng');
            setLookupResult(null);
        }
    };

    // ===== HANDLERS =====
    const scrollToTop = () => {
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const selectProduct = (product: Product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setViewMode('product-detail');
        setSearchParams({ product: product.slug });
        scrollToTop();
    };

    const goBack = () => {
        if (viewMode === 'product-detail') {
            setViewMode('products');
            setSelectedProduct(null);
            setSearchParams({});
        } else if (viewMode === 'checkout') {
            setViewMode('product-detail');
        } else if (viewMode === 'order-result') {
            // Reset everything
            setViewMode('products');
            setSelectedProduct(null);
            setOrderResult(null);
            setQuantity(1);
            setOrderData({
                customer_name: '',
                customer_phone: '',
                customer_note: '',
                payment_method: 'qr'
            });
            setSearchParams({});
        } else if (viewMode === 'lookup') {
            setViewMode('products');
            setLookupResult(null);
            setLookupError(null);
        }
        scrollToTop();
    };

    const proceedToCheckout = () => {
        if (!selectedProduct) return;
        setViewMode('checkout');
        scrollToTop();
    };

    // ===== RENDER FUNCTIONS =====

    // Product Card
    const renderProductCard = (product: Product) => (
        <div
            key={product.id}
            className="shop-product-card"
            onClick={() => selectProduct(product)}
        >
            <div className="product-image">
                <img
                    src={product.image_url || '/images/products/placeholder.jpg'}
                    alt={product.name}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg';
                    }}
                />
                {product.is_recommended && (
                    <span className="badge recommended">
                        <i className="fas fa-star"></i> Đề xuất
                    </span>
                )}
                {product.availability === 'pre-order' && (
                    <span className="badge preorder">Đặt trước</span>
                )}
            </div>
            <div className="product-info">
                <span className="product-brand">{product.brand}</span>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">{formatPrice(product.price)}</p>
                {product.original_price && product.original_price > product.price && (
                    <p className="product-original-price">{formatPrice(product.original_price)}</p>
                )}
            </div>
        </div>
    );

    // Products List View
    const renderProductsList = () => (
        <div className="shop-products-view">
            {/* Categories */}
            <div className="shop-categories">
                {categories.map(cat => (
                    <button
                        key={cat.key}
                        className={`category-btn ${selectedCategory === cat.key ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.key)}
                    >
                        <i className={`fas ${cat.icon}`}></i>
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Lookup Button */}
            <div className="shop-actions">
                <button className="lookup-btn" onClick={() => setViewMode('lookup')}>
                    <i className="fas fa-search"></i> Tra cứu đơn hàng
                </button>
            </div>

            {/* Loading / Error */}
            {loading && (
                <div className="shop-loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Đang tải sản phẩm...</span>
                </div>
            )}

            {error && (
                <div className="shop-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{error}</span>
                    <button onClick={loadProducts}>Thử lại</button>
                </div>
            )}

            {/* Products Grid */}
            {!loading && !error && (
                <div className="shop-products-grid">
                    {products.length > 0 ? (
                        products.map(renderProductCard)
                    ) : (
                        <div className="shop-no-products">
                            <i className="fas fa-box-open"></i>
                            <h3>Chưa có sản phẩm</h3>
                            <p>Admin chưa cập nhật sản phẩm. Vui lòng quay lại sau!</p>
                            <a href="tel:0913909012" className="contact-link">
                                <i className="fas fa-phone"></i> Liên hệ: 0913 909 012
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // Product Detail View
    const renderProductDetail = () => {
        if (!selectedProduct) return null;

        return (
            <div className="shop-product-detail">
                <button className="back-btn" onClick={goBack}>
                    <i className="fas fa-arrow-left"></i> Quay lại
                </button>

                <div className="product-detail-content">
                    <div className="product-image-section">
                        <img
                            src={selectedProduct.image_url || '/images/products/placeholder.jpg'}
                            alt={selectedProduct.name}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg';
                            }}
                        />
                        {selectedProduct.is_recommended && (
                            <span className="badge recommended">
                                <i className="fas fa-star"></i> HLV đề xuất
                            </span>
                        )}
                    </div>

                    <div className="product-info-section">
                        <span className="product-brand">{selectedProduct.brand}</span>
                        <h1 className="product-name">{selectedProduct.name}</h1>

                        <div className="product-price-section">
                            <span className="product-price">{formatPrice(selectedProduct.price)}</span>
                            {selectedProduct.original_price && selectedProduct.original_price > selectedProduct.price && (
                                <span className="product-original-price">{formatPrice(selectedProduct.original_price)}</span>
                            )}
                        </div>

                        <div className={`product-availability ${selectedProduct.availability}`}>
                            {selectedProduct.availability === 'in-stock' ? (
                                <><i className="fas fa-check-circle"></i> Còn hàng</>
                            ) : selectedProduct.availability === 'pre-order' ? (
                                <><i className="fas fa-clock"></i> Đặt trước (2-5 ngày)</>
                            ) : (
                                <><i className="fas fa-times-circle"></i> Hết hàng</>
                            )}
                        </div>

                        {/* Specs */}
                        {selectedProduct.specs && selectedProduct.specs.length > 0 && (
                            <div className="product-specs">
                                <h3>Thông số kỹ thuật</h3>
                                <div className="specs-grid">
                                    {selectedProduct.specs.map((spec, idx) => (
                                        <div key={idx} className="spec-item">
                                            <span className="spec-label">{spec.label}</span>
                                            <span className="spec-value">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="product-description">
                            <h3>Mô tả</h3>
                            <p>{selectedProduct.description}</p>
                        </div>

                        {/* Suitable For */}
                        {selectedProduct.suitable_for && selectedProduct.suitable_for.length > 0 && (
                            <div className="product-suitable">
                                <h3>Phù hợp với</h3>
                                <ul>
                                    {selectedProduct.suitable_for.map((item, idx) => (
                                        <li key={idx}><i className="fas fa-check"></i> {item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Coach Review */}
                        {selectedProduct.coach_review && (
                            <div className="product-coach-review">
                                <h3><i className="fas fa-user-tie"></i> Nhận xét của HLV</h3>
                                <p>"{selectedProduct.coach_review}"</p>
                            </div>
                        )}

                        {/* Quantity & Order */}
                        <div className="product-order-section">
                            <div className="quantity-selector">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                    <i className="fas fa-minus"></i>
                                </button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(Math.min(99, quantity + 1))}>
                                    <i className="fas fa-plus"></i>
                                </button>
                            </div>
                            <div className="total-price">
                                Tổng: <strong>{formatPrice(selectedProduct.price * quantity)}</strong>
                            </div>
                            <button
                                className="order-btn"
                                onClick={proceedToCheckout}
                                disabled={selectedProduct.availability === 'out-of-stock'}
                            >
                                <i className="fas fa-shopping-cart"></i>
                                ĐẶT HÀNG NGAY
                            </button>
                        </div>

                        {/* Hotline */}
                        <div className="product-hotline">
                            <i className="fas fa-phone"></i>
                            <span>Cần tư vấn? Gọi ngay: <a href="tel:0937009075">0937 009 075</a></span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Checkout View
    const renderCheckout = () => {
        if (!selectedProduct) return null;

        return (
            <div className="shop-checkout">
                <button className="back-btn" onClick={goBack}>
                    <i className="fas fa-arrow-left"></i> Quay lại
                </button>

                <h1 className="checkout-title">THÔNG TIN ĐẶT HÀNG</h1>

                {/* Order Summary */}
                <div className="checkout-summary">
                    <div className="summary-item">
                        <img
                            src={selectedProduct.image_url || '/images/products/placeholder.jpg'}
                            alt={selectedProduct.name}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg';
                            }}
                        />
                        <div className="summary-info">
                            <h3>{selectedProduct.name}</h3>
                            <p>{selectedProduct.brand}</p>
                            <p className="summary-price">{formatPrice(selectedProduct.price)} x {quantity}</p>
                        </div>
                    </div>
                    <div className="summary-total">
                        <span>Tổng cộng:</span>
                        <strong>{formatPrice(selectedProduct.price * quantity)}</strong>
                    </div>
                </div>

                {/* Customer Info Form */}
                <div className="checkout-form">
                    <div className="form-group">
                        <label>
                            <i className="fas fa-user"></i> Họ và tên *
                        </label>
                        <input
                            type="text"
                            placeholder="Nhập họ và tên"
                            value={orderData.customer_name}
                            onChange={(e) => setOrderData({ ...orderData, customer_name: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <i className="fas fa-phone"></i> Số điện thoại *
                        </label>
                        <input
                            type="tel"
                            placeholder="VD: 0912345678"
                            value={orderData.customer_phone}
                            onChange={(e) => setOrderData({ ...orderData, customer_phone: e.target.value.replace(/\D/g, '') })}
                            maxLength={10}
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <i className="fas fa-sticky-note"></i> Ghi chú (tuỳ chọn)
                        </label>
                        <textarea
                            placeholder="Ghi chú thêm về đơn hàng..."
                            value={orderData.customer_note}
                            onChange={(e) => setOrderData({ ...orderData, customer_note: e.target.value })}
                            rows={3}
                        />
                    </div>

                    {/* Payment Method */}
                    <div className="form-group payment-method">
                        <label>
                            <i className="fas fa-credit-card"></i> Phương thức thanh toán
                        </label>
                        <div className="payment-options">
                            <button
                                className={`payment-option ${orderData.payment_method === 'qr' ? 'active' : ''}`}
                                onClick={() => setOrderData({ ...orderData, payment_method: 'qr' })}
                            >
                                <i className="fas fa-qrcode"></i>
                                <span>QR Code</span>
                                <small>Quét mã thanh toán</small>
                            </button>
                            <button
                                className={`payment-option ${orderData.payment_method === 'bank' ? 'active' : ''}`}
                                onClick={() => setOrderData({ ...orderData, payment_method: 'bank' })}
                            >
                                <i className="fas fa-university"></i>
                                <span>Chuyển khoản</span>
                                <small>Nhập thủ công</small>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    className="submit-order-btn"
                    onClick={submitOrder}
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-check"></i>
                            XÁC NHẬN ĐẶT HÀNG
                        </>
                    )}
                </button>

                <p className="checkout-note">
                    <i className="fas fa-info-circle"></i>
                    Sau khi đặt hàng, bạn sẽ nhận được hướng dẫn thanh toán chi tiết
                </p>
            </div>
        );
    };

    // Order Result View (Payment Instructions)
    const renderOrderResult = () => {
        if (!orderResult) return null;

        return (
            <div className="shop-order-result">
                <div className="order-success-header">
                    <i className="fas fa-check-circle"></i>
                    <h1>ĐẶT HÀNG THÀNH CÔNG!</h1>
                    <p>Mã đơn hàng của bạn là:</p>
                    <div className="order-code">{orderResult.order_code}</div>
                </div>

                <div className="payment-instructions">
                    <h2><i className="fas fa-credit-card"></i> HƯỚNG DẪN THANH TOÁN</h2>

                    <div className="payment-amount">
                        <span>Số tiền cần thanh toán:</span>
                        <strong>{formatPrice(orderResult.total_amount)}</strong>
                    </div>

                    {/* QR Code */}
                    <div className="qr-section">
                        <h3>Quét mã QR để thanh toán</h3>
                        <div className="qr-code-wrapper">
                            <img
                                src={orderResult.qr_code_url}
                                alt="QR Code thanh toán"
                                className="qr-code-image"
                            />
                        </div>
                        <p className="qr-note">Mở app ngân hàng → Quét mã QR → Xác nhận thanh toán</p>
                    </div>

                    {/* Bank Info */}
                    <div className="bank-info-section">
                        <h3>Hoặc chuyển khoản thủ công</h3>
                        <div className="bank-info">
                            <div className="bank-row">
                                <span>Ngân hàng:</span>
                                <strong>{orderResult.bank.bank_name}</strong>
                            </div>
                            <div className="bank-row">
                                <span>Số tài khoản:</span>
                                <strong className="copyable" onClick={() => {
                                    navigator.clipboard.writeText(orderResult.bank.account_number);
                                    alert('Đã copy số tài khoản!');
                                }}>
                                    {orderResult.bank.account_number}
                                    <i className="fas fa-copy"></i>
                                </strong>
                            </div>
                            <div className="bank-row">
                                <span>Chủ tài khoản:</span>
                                <strong>{orderResult.bank.account_holder}</strong>
                            </div>
                            <div className="bank-row important">
                                <span>Nội dung CK:</span>
                                <strong className="copyable" onClick={() => {
                                    navigator.clipboard.writeText(orderResult.transfer_content);
                                    alert('Đã copy nội dung chuyển khoản!');
                                }}>
                                    {orderResult.transfer_content}
                                    <i className="fas fa-copy"></i>
                                </strong>
                            </div>
                        </div>

                        <div className="warning-box">
                            <i className="fas fa-exclamation-triangle"></i>
                            <p><strong>QUAN TRỌNG:</strong> Vui lòng ghi đúng nội dung chuyển khoản <code>{orderResult.transfer_content}</code> để đơn hàng được xử lý nhanh chóng!</p>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="order-status-section">
                        <div className="status-item pending">
                            <i className="fas fa-clock"></i>
                            <span>Trạng thái: <strong>CHỜ THANH TOÁN</strong></span>
                        </div>
                        <p>Đơn hàng sẽ được xác nhận sau khi CLB nhận được thanh toán.</p>
                    </div>

                    {/* Contact */}
                    <div className="contact-section">
                        <p>Cần hỗ trợ? Liên hệ Hotline:</p>
                        <a href="tel:0937009075" className="hotline">
                            <i className="fas fa-phone"></i>
                            0937 009 075
                        </a>
                    </div>
                </div>

                <button className="done-btn" onClick={goBack}>
                    <i className="fas fa-home"></i>
                    TIẾP TỤC MUA SẮM
                </button>
            </div>
        );
    };

    // Lookup View
    const renderLookup = () => (
        <div className="shop-lookup">
            <button className="back-btn" onClick={goBack}>
                <i className="fas fa-arrow-left"></i> Quay lại
            </button>

            <h1 className="lookup-title">
                <i className="fas fa-search"></i>
                TRA CỨU ĐƠN HÀNG
            </h1>

            <div className="lookup-form">
                <div className="form-group">
                    <label>Mã đơn hàng</label>
                    <input
                        type="text"
                        placeholder="VD: 20231218ABCD"
                        value={lookupCode}
                        onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                    />
                </div>
                <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                        type="tel"
                        placeholder="VD: 0912345678"
                        value={lookupPhone}
                        onChange={(e) => setLookupPhone(e.target.value.replace(/\D/g, ''))}
                        maxLength={10}
                    />
                </div>
                <button className="lookup-submit-btn" onClick={lookupOrder}>
                    <i className="fas fa-search"></i>
                    TRA CỨU
                </button>
            </div>

            {lookupError && (
                <div className="lookup-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {lookupError}
                </div>
            )}

            {lookupResult && (
                <div className="lookup-result">
                    <h2>THÔNG TIN ĐƠN HÀNG</h2>

                    <div className="result-header">
                        <div className="result-code">
                            <span>Mã đơn:</span>
                            <strong>{lookupResult.order_code}</strong>
                        </div>
                        <div
                            className="result-status"
                            style={{ backgroundColor: getStatusLabel(lookupResult.payment_status).color }}
                        >
                            {getStatusLabel(lookupResult.payment_status).label}
                        </div>
                    </div>

                    <div className="result-info">
                        <div className="info-row">
                            <span>Khách hàng:</span>
                            <strong>{lookupResult.customer_name}</strong>
                        </div>
                        <div className="info-row">
                            <span>Tổng tiền:</span>
                            <strong>{formatPrice(lookupResult.total_amount)}</strong>
                        </div>
                        <div className="info-row">
                            <span>Ngày đặt:</span>
                            <strong>{new Date(lookupResult.created_at).toLocaleString('vi-VN')}</strong>
                        </div>
                        <div className="info-row">
                            <span>Trạng thái đơn:</span>
                            <strong style={{ color: getStatusLabel(lookupResult.order_status).color }}>
                                {getStatusLabel(lookupResult.order_status).label}
                            </strong>
                        </div>
                    </div>

                    {lookupResult.items && lookupResult.items.length > 0 && (
                        <div className="result-items">
                            <h3>Sản phẩm</h3>
                            {lookupResult.items.map((item: any, idx: number) => (
                                <div key={idx} className="result-item">
                                    <span>{item.product_name}</span>
                                    <span>{item.quantity} x {formatPrice(item.product_price)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {lookupResult.payment_status === 'pending' && (
                        <div className="result-payment-action">
                            <p>Đơn hàng chưa được thanh toán. Quét mã QR bên dưới:</p>
                            <img
                                src={lookupResult.qr_code_url}
                                alt="QR Code"
                                className="result-qr"
                            />
                            <p className="transfer-content">
                                Nội dung CK: <code>{lookupResult.transfer_content}</code>
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // ===== MAIN RENDER =====
    return (
        <section id="shop" className="shop-section" ref={topRef}>
            <div className="shop-container">
                {/* Header */}
                {viewMode === 'products' && (
                    <div className="shop-header">
                        <h1>CỬA HÀNG DỤNG CỤ</h1>
                        <p>Sản phẩm chính hãng - Tư vấn bởi HLV chuyên nghiệp</p>
                    </div>
                )}

                {/* Content based on view mode */}
                {viewMode === 'products' && renderProductsList()}
                {viewMode === 'product-detail' && renderProductDetail()}
                {viewMode === 'checkout' && renderCheckout()}
                {viewMode === 'order-result' && renderOrderResult()}
                {viewMode === 'lookup' && renderLookup()}
            </div>
        </section>
    );
};

export default Shop;
