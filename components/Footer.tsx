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
    <footer id="footer" className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-about">
            <div className="footer-brand">
              <img src="/images/logo.png" alt="CLB Bóng Bàn LQD" className="footer-logo" />
              <span className="footer-title">BÓNG BÀN LQD</span>
            </div>
            <p className="footer-description">
              CLB bóng bàn Lê Quý Đôn - nơi đam mê được nuôi dưỡng và tài năng được phát triển.
              Tập chăm chỉ, chơi thông minh, chiến thắng cùng nhau.
            </p>
            <div className="footer-social">
              <a
                href="https://www.facebook.com/clbbongbanlequydon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="social-btn social-facebook"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://zalo.me/0913909012"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Zalo"
                className="social-btn social-zalo"
              >
                <span className="zalo-icon">Z</span>
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&to=tunhanluan1971@gmail.com&su=Liên%20hệ%20CLB%20Bóng%20Bàn%20LQD"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gmail"
                className="social-btn social-gmail"
              >
                <i className="fas fa-envelope"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-section">
            <ul className="footer-links">
              <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>TRANG CHỦ</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>GIỚI THIỆU</a></li>
              <li><a href="#programs" onClick={(e) => { e.preventDefault(); scrollToSection('programs'); }}>KHÓA HỌC</a></li>
              <li><a href="#schedule" onClick={(e) => { e.preventDefault(); scrollToSection('schedule'); }}>LỊCH TẬP</a></li>
              <li><a href="#gallery" onClick={(e) => { e.preventDefault(); scrollToSection('gallery'); }}>HÌNH ẢNH</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-links-section">
            <ul className="footer-links">
              <li><a href="#programs" onClick={(e) => { e.preventDefault(); scrollToSection('programs'); }}>BẢNG GIÁ</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>HỖ TRỢ</a></li>
              <li><a href="#shop" onClick={(e) => { e.preventDefault(); scrollToSection('shop'); }}>SHOP DỤNG CỤ</a></li>
              <li><a href="#gallery" onClick={(e) => { e.preventDefault(); scrollToSection('gallery'); }}>HÌNH ẢNH</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>LIÊN HỆ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-contact">
            <div className="footer-contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>3B Lê Quý Đôn, Phường Phú Nhuận, TP. Hồ Chí Minh</span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-phone"></i>
              <span>0913 909 012</span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-envelope"></i>
              <span>tunhanluan1971@gmail.com</span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-clock"></i>
              <span>T2-CN: 08:00-21:30</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2022-{currentYear} CLB bóng bàn Lê Quý Đôn. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
