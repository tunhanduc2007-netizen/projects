import React from 'react';
import { Link } from 'react-router-dom';

const ShopCTA: React.FC = () => {
    return (
        <section id="shop-cta" className="section shop-cta-section">
            <div className="container">
                <div className="shop-cta-card">
                    {/* Left Side: Content */}
                    <div className="shop-cta-content">
                        <span className="shop-cta-badge">
                            <i className="fas fa-bolt"></i>
                            Dụng cụ chính hãng
                        </span>

                        <h2 className="shop-cta-title">
                            Nâng tầm kỹ năng với <br />
                            <span className="highlight-text">Trang bị chuẩn thi đấu</span>
                        </h2>

                        <p className="shop-cta-description">
                            Sở hữu ngay vợt, mặt vợt và phụ kiện bóng bàn chất lượng cao.
                            Được HLV CLB Lê Quý Đôn trực tiếp tuyển chọn và tư vấn.
                        </p>

                        <div className="shop-cta-actions">
                            <Link to="/shop" className="btn btn-shop-primary">
                                <span className="btn-text">Xem Shop Ngay</span>
                                <i className="fas fa-arrow-right"></i>
                            </Link>
                            <a href="tel:0913909012" className="btn btn-shop-outline">
                                <i className="fas fa-headset"></i>
                                Tư vấn: 0913 909 012
                            </a>
                        </div>
                    </div>

                    {/* Right Side: Categories */}
                    <div className="shop-cta-visual">
                        <div className="category-list">
                            <div className="category-card">
                                <div className="category-img">
                                    <img src="https://images.unsplash.com/photo-1534158914592-0796504b2752?q=80&w=160&auto=format&fit=crop" alt="Vợt bóng bàn" />
                                </div>
                                <div className="category-info">
                                    <h4>Vợt Bóng Bàn</h4>
                                    <span>Cốt vợt & Combo</span>
                                </div>
                                <i className="fas fa-chevron-right arrow-icon"></i>
                            </div>

                            <div className="category-card">
                                <div className="category-img">
                                    <img src="https://images.unsplash.com/photo-1549646875-f725a32e737e?q=80&w=160&auto=format&fit=crop" alt="Mặt vợt" />
                                </div>
                                <div className="category-info">
                                    <h4>Mặt Vợt</h4>
                                    <span>Tacky & Tension</span>
                                </div>
                                <i className="fas fa-chevron-right arrow-icon"></i>
                            </div>

                            <div className="category-card">
                                <div className="category-img">
                                    <img src="https://images.unsplash.com/photo-1519861531473-92002639313a?q=80&w=160&auto=format&fit=crop" alt="Bóng bàn" />
                                </div>
                                <div className="category-info">
                                    <h4>Phụ Kiện</h4>
                                    <span>Bóng, Keo, Bao vợt</span>
                                </div>
                                <i className="fas fa-chevron-right arrow-icon"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShopCTA;
