import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-about">
            <div className="footer-brand">
              <img src="/images/logo.png" alt="CLB Bóng Bàn LQD" className="footer-logo" />
              <span className="footer-title">BÓNG BÀN LQD</span>
            </div>
            <p className="footer-description">
              CLB Bóng Bàn Lê Quý Đôn - Nơi đam mê được nuôi dưỡng và tài năng được phát triển.
              Tập Chăm Chỉ, Chơi Thông Minh, Chiến Thắng Cùng Nhau.
            </p>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" aria-label="Zalo">
                <i className="fas fa-comment-dots"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <i className="fab fa-tiktok"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-section">
            <ul className="footer-links">
              <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Trang Chủ</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>Giới Thiệu</a></li>
              <li><a href="#programs" onClick={(e) => { e.preventDefault(); scrollToSection('programs'); }}>Khóa Học</a></li>
              <li><a href="#schedule" onClick={(e) => { e.preventDefault(); scrollToSection('schedule'); }}>Lịch Tập</a></li>
              <li><a href="#gallery" onClick={(e) => { e.preventDefault(); scrollToSection('gallery'); }}>Hình Ảnh</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-links-section">
            <ul className="footer-links">
              <li><a href="#programs" onClick={(e) => { e.preventDefault(); scrollToSection('programs'); }}>Bảng Giá</a></li>
              <li><a href="#support" onClick={(e) => { e.preventDefault(); scrollToSection('support'); }}>Hỗ Trợ</a></li>
              <li><a href="#gallery" onClick={(e) => { e.preventDefault(); scrollToSection('gallery'); }}>Hình Ảnh</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Liên Hệ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-contact">
            <div className="footer-contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>3B Lê Quý Đôn, Phú Nhuận, TP.HCM</span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-phone"></i>
              <span>0913 909 012</span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-envelope"></i>
              <span>clbbongbanlqd@gmail.com</span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-clock"></i>
              <span>T2-CN: 08:00-21:30</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2020-{currentYear} CLB Bóng Bàn Lê Quý Đôn. Bảo lưu mọi quyền.
          </p>
          <div className="footer-legal">
            <a href="#privacy">Chính sách bảo mật</a>
            <a href="#terms">Điều khoản sử dụng</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
