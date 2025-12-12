import React from 'react';

const Contact: React.FC = () => {
    return (
        <section id="contact" className="section contact">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">Liên Hệ</span>
                    <h2 className="section-title">
                        Thông Tin <span>Liên Hệ</span>
                    </h2>
                    <p className="section-description">
                        Đến trực tiếp hoặc gọi điện để biết tình trạng bàn trống. Chúng tôi luôn sẵn sàng đón tiếp bạn!
                    </p>
                </div>

                <div className="contact-info-grid">
                    {/* Contact Cards */}
                    <div className="contact-card fade-in">
                        <div className="contact-card-icon">
                            <i className="fas fa-map-marker-alt"></i>
                        </div>
                        <h3>Địa Chỉ</h3>
                        <p className="contact-highlight">3B Lê Quý Đôn</p>
                        <p>Phường 11, Quận Phú Nhuận</p>
                        <p>TP. Hồ Chí Minh</p>
                        <p><small>(Gần THCS Đào Duy Anh)</small></p>
                    </div>

                    <div className="contact-card fade-in stagger-2">
                        <div className="contact-card-icon">
                            <i className="fas fa-phone"></i>
                        </div>
                        <h3>Điện Thoại</h3>
                        <p className="contact-highlight">0909 123 456</p>
                        <p>Gọi để hỏi tình trạng bàn</p>
                        <a href="tel:0909123456" className="btn btn-primary btn-small">
                            <i className="fas fa-phone"></i> Gọi Ngay
                        </a>
                    </div>

                    <div className="contact-card fade-in stagger-3">
                        <div className="contact-card-icon">
                            <i className="fas fa-clock"></i>
                        </div>
                        <h3>Giờ Mở Cửa</h3>
                        <p><strong>Thứ 2 - Chủ Nhật:</strong></p>
                        <p className="contact-highlight">08:00 - 21:30</p>
                    </div>

                    <div className="contact-card fade-in stagger-4">
                        <div className="contact-card-icon">
                            <i className="fas fa-money-bill-wave"></i>
                        </div>
                        <h3>Giá Cả</h3>
                        <p className="contact-highlight">35K / lượt</p>
                        <p>hoặc</p>
                        <p className="contact-highlight">500K / tháng</p>
                    </div>
                </div>

                {/* Social & Zalo */}
                <div className="contact-social-section fade-in">
                    <h3>Kết Nối Với Chúng Tôi</h3>
                    <div className="contact-social-buttons">
                        <a href="https://zalo.me/0909123456" target="_blank" rel="noopener noreferrer" className="social-btn zalo">
                            <i className="fas fa-comment-dots"></i>
                            Nhắn Zalo
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-btn facebook">
                            <i className="fab fa-facebook-f"></i>
                            Facebook
                        </a>
                        <a href="https://m.me/clbbongbanlqd" target="_blank" rel="noopener noreferrer" className="social-btn messenger">
                            <i className="fab fa-facebook-messenger"></i>
                            Messenger
                        </a>
                    </div>
                </div>

                {/* Google Map - 3B Lê Quý Đôn, Phú Nhuận (gần THCS Đào Duy Anh) */}
                <div className="contact-map fade-in">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d979.8077647082776!2d106.6803346!3d10.7916501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528d8a66b555b%3A0x123456789abcdef!2s3B%20L%C3%AA%20Qu%C3%BD%20%C4%90%C3%B4n%2C%20Ph%C6%B0%E1%BB%9Dng%2011%2C%20Ph%C3%BA%20Nhu%E1%BA%ADn%2C%20Th%C3%A0nh%20ph%E1%BB%91%20H%E1%BB%93%20Ch%C3%AD%20Minh!5e0!3m2!1svi!2s!4v1702400000000!5m2!1svi!2s"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="CLB Bóng Bàn LQD - 3B Lê Quý Đôn, Phú Nhuận (gần THCS Đào Duy Anh)"
                    ></iframe>
                </div>
            </div>
        </section>
    );
};

export default Contact;
