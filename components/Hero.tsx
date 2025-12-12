import React from 'react';

const Hero: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="hero">
      {/* Background */}
      <div className="hero-bg"></div>

      {/* Animated Shapes */}
      <div className="hero-shapes">
        <div className="hero-shape hero-shape-1"></div>
        <div className="hero-shape hero-shape-2"></div>
        <div className="hero-shape hero-shape-3"></div>
      </div>

      {/* Content */}
      <div className="hero-content">
        <img src="/images/logo.png" alt="LQD Table Tennis Club Logo" className="hero-logo" />

        <span className="hero-badge">
          <i className="fas fa-star" style={{ marginRight: '8px' }}></i>
          Est. 2020 • Professional Training
        </span>

        <h1 className="hero-title">
          TABLE TENNIS CLUB
          <span>LÊ QUÝ ĐÔN</span>
        </h1>

        <p className="hero-slogan">
          "Train Hard, Play Smart, Win Together."
        </p>

        <p className="hero-description">
          Chào mừng bạn đến với CLB Bóng Bàn Lê Quý Đôn - nơi đam mê được nuôi dưỡng và tài năng được phát triển.
          Với đội ngũ huấn luyện viên chuyên nghiệp và cơ sở vật chất hiện đại, chúng tôi cam kết đem đến
          trải nghiệm tập luyện tốt nhất cho mọi lứa tuổi.
        </p>

        <div className="hero-buttons">
          <button className="btn btn-primary btn-large" onClick={() => scrollToSection('contact')}>
            <i className="fas fa-user-plus"></i>
            Đăng Ký Ngay
          </button>
          <button className="btn btn-outline btn-large" onClick={() => scrollToSection('about')}>
            <i className="fas fa-info-circle"></i>
            Tìm Hiểu Thêm
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hero-scroll" onClick={() => scrollToSection('why-join')}>
        <span>Scroll Down</span>
        <i className="fas fa-chevron-down"></i>
      </div>
    </section>
  );
};

export default Hero;
