import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Shop from '../components/Shop';

const ShopPage: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="shop-page">
            {/* Shop Header */}
            <header className={`shop-page-header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="container">
                    <div className="shop-header-content">
                        <Link to="/" className="shop-back-btn">
                            <i className="fas fa-arrow-left"></i>
                            <span>Quay lại CLB</span>
                        </Link>

                        <div className="shop-header-brand">
                            <img src="/images/logo.png" alt="CLB Bóng Bàn LQD" className="shop-header-logo" />
                            <div className="shop-header-title">
                                <span className="shop-title-main">Shop Dụng Cụ</span>
                                <span className="shop-title-sub">CLB Lê Quý Đôn</span>
                            </div>
                        </div>

                        <a href="tel:0937009075" className="shop-header-contact">
                            <i className="fas fa-phone-alt"></i>
                            <span>0937 009 075</span>
                        </a>
                    </div>
                </div>
            </header>

            {/* Shop Content */}
            <main className="shop-page-main">
                <Shop />
            </main>

            {/* Shop Footer */}
            <footer className="shop-page-footer">
                <div className="container">
                    <div className="shop-footer-content">
                        <div className="shop-footer-info">
                            <div className="shop-footer-brand">
                                <img src="/images/logo.png" alt="CLB Bóng Bàn LQD" />
                                <span>Shop CLB Lê Quý Đôn</span>
                            </div>
                            <p>Dụng cụ bóng bàn chính hãng, được HLV kiểm chứng và chọn lọc phù hợp cho học viên.</p>
                        </div>

                        <div className="shop-footer-contact">
                            <h4>Liên hệ đặt hàng</h4>
                            <div className="shop-contact-item">
                                <i className="fas fa-phone-alt"></i>
                                <span>0937 009 075</span>
                            </div>
                            <div className="shop-contact-item">
                                <i className="fas fa-map-marker-alt"></i>
                                <span>3B Lê Quý Đôn, Phú Nhuận, TP.HCM</span>
                            </div>
                            <div className="shop-contact-item">
                                <i className="fas fa-clock"></i>
                                <span>Nhận hàng: T2-CN, 08:00-21:30</span>
                            </div>
                        </div>

                        <div className="shop-footer-source">
                            <h4>Thương hiệu</h4>
                            <p className="source-note">Sản phẩm chính hãng Butterfly, Nittaku, Yasaka</p>
                        </div>
                    </div>

                    <div className="shop-footer-bottom">
                        <p>© 2022-{new Date().getFullYear()} CLB Bóng Bàn Lê Quý Đôn. Shop nội bộ CLB.</p>
                        <Link to="/" className="back-to-clb">
                            <i className="fas fa-arrow-left"></i>
                            Quay lại trang CLB
                        </Link>
                    </div>
                </div>
            </footer>

            {/* Mobile FAB */}
            <a href="tel:0937009075" className="shop-mobile-fab" aria-label="Gọi đặt hàng">
                <i className="fas fa-phone-alt"></i>
            </a>
        </div>
    );
};

export default ShopPage;
