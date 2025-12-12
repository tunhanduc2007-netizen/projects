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
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-about">
            <div className="footer-brand">
              <img src="/images/logo.png" alt="LQD Table Tennis Club" className="footer-logo" />
              <span className="footer-title">TABLE TENNIS LQD</span>
            </div>
            <p className="footer-description">
              CLB Bóng Bàn Lê Quý Đôn - Nơi đam mê được nuôi dưỡng và tài năng được phát triển.
              Train Hard, Play Smart, Win Together.
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
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Trang Chủ</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>Về Chúng Tôi</a></li>
              <li><a href="#programs" onClick={(e) => { e.preventDefault(); scrollToSection('programs'); }}>Chương Trình</a></li>
              <li><a href="#schedule" onClick={(e) => { e.preventDefault(); scrollToSection('schedule'); }}>Lịch Tập</a></li>
              <li><a href="#gallery" onClick={(e) => { e.preventDefault(); scrollToSection('gallery'); }}>Thư Viện Ảnh</a></li>
            </ul>
          </div>

          {/* Programs */}
          <div className="footer-links-section">
            <h4 className="footer-heading">Programs</h4>
            <ul className="footer-links">
              <li><a href="#programs" onClick={(e) => { e.preventDefault(); scrollToSection('programs'); }}>Lớp Cơ Bản</a></li>
              <li><a href="#programs" onClick={(e) => { e.preventDefault(); scrollToSection('programs'); }}>Lớp Trung Cấp</a></li>
              <li><a href="#programs" onClick={(e) => { e.preventDefault(); scrollToSection('programs'); }}>Lớp Thi Đấu</a></li>
              <li><a href="#tournaments" onClick={(e) => { e.preventDefault(); scrollToSection('tournaments'); }}>Giải Đấu</a></li>
              <li><a href="#members" onClick={(e) => { e.preventDefault(); scrollToSection('members'); }}>Thành Viên</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-contact">
            <h4 className="footer-heading">Liên Hệ</h4>
            <div className="footer-contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>Trường THPT Lê Quý Đôn, TP.HCM</span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-phone"></i>
              <span>0909 123 456</span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-envelope"></i>
              <span>contact@clbbongban-lqd.edu.vn</span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-clock"></i>
              <span>T2-T6: 17:00-21:00 | T7-CN: 08:00-18:00</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} CLB Bóng Bàn Lê Quý Đôn. All rights reserved.
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
