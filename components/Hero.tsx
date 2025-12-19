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
        <img
          src="/images/logo.png"
          alt="CLB Bóng Bàn Hoa Lư"
          className="hero-logo"
          loading="eager"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x150?text=LQD';
          }}
        />

        <span className="hero-badge">
          <i className="fas fa-star" style={{ marginRight: '8px' }}></i>
          Thành lập 2022 • Đào tạo chuyên nghiệp
        </span>

        <h1 className="hero-title">
          CLB BÓNG BÀN <span>HOA LƯ</span>
        </h1>

        <p className="hero-slogan">
          "Tập chăm chỉ, chơi thông minh, chiến thắng cùng nhau"
        </p>

        <p className="hero-description">
          Chào mừng bạn đến với CLB bóng bàn Hoa Lư - nơi đam mê được nuôi dưỡng và tài năng được phát triển.
          Với đội ngũ huấn luyện viên chuyên nghiệp và cơ sở vật chất hiện đại, chúng tôi cam kết đem đến
          trải nghiệm tập luyện tốt nhất cho mọi lứa tuổi.
        </p>

        <div className="hero-buttons">
          <button className="btn btn-primary btn-large" onClick={() => scrollToSection('programs')}>
            <i className="fas fa-table-tennis-paddle-ball"></i>
            XEM BẢNG GIÁ
          </button>
          <button className="btn btn-outline btn-large" onClick={() => scrollToSection('about')}>
            <i className="fas fa-info-circle"></i>
            TÌM HIỂU THÊM
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
