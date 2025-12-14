import React from 'react';
import { Link } from 'react-router-dom';

const ShopCTA: React.FC = () => {
    return (
        <section id="shop-cta" className="section shop-cta-section">
            <div className="container">
                <div className="shop-cta-card">
                    <div className="shop-cta-icon">
                        <i className="fas fa-store"></i>
                    </div>

                    <div className="shop-cta-content">
                        <span className="shop-cta-badge">
                            <i className="fas fa-certificate"></i>
                            Sản phẩm chính hãng
                        </span>

                        <h2 className="shop-cta-title">
                            Dụng Cụ Bóng Bàn <span>CLB Lê Quý Đôn</span>
                        </h2>

                        <p className="shop-cta-description">
                            Vợt, mặt vợt, bóng và phụ kiện được HLV chọn lọc – phù hợp cho người mới và người đang tập.
                            Đặt trước, nhận tại CLB.
                        </p>

                        <div className="shop-cta-features">
                            <div className="shop-feature">
                                <i className="fas fa-check-circle"></i>
                                <span>Sản phẩm chính hãng</span>
                            </div>
                            <div className="shop-feature">
                                <i className="fas fa-check-circle"></i>
                                <span>HLV tư vấn miễn phí</span>
                            </div>
                            <div className="shop-feature">
                                <i className="fas fa-check-circle"></i>
                                <span>Nhận hàng tại CLB</span>
                            </div>
                        </div>

                        <div className="shop-cta-actions">
                            <Link to="/shop" className="btn btn-primary btn-large">
                                <i className="fas fa-shopping-bag"></i>
                                Xem Shop Dụng Cụ
                            </Link>
                            <a href="tel:0913909012" className="btn btn-outline btn-large">
                                <i className="fas fa-phone-alt"></i>
                                Hỏi HLV tư vấn
                            </a>
                        </div>
                    </div>

                    <div className="shop-cta-visual">
                        <div className="shop-preview-items">
                            <div className="preview-item">
                                <img src="/images/products/paddle-icon.png" alt="Vợt" />
                                <span>Vợt</span>
                            </div>
                            <div className="preview-item">
                                <img src="/images/products/rubber-icon.png" alt="Mặt vợt" />
                                <span>Mặt vợt</span>
                            </div>
                            <div className="preview-item">
                                <img src="/images/products/ball-icon.png" alt="Bóng" />
                                <span>Bóng</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShopCTA;
