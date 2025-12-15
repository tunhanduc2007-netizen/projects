import React from 'react';

const About: React.FC = () => {
  const values = [
    { icon: 'fas fa-check-circle', text: 'Chuyên nghiệp & tận tâm' },
    { icon: 'fas fa-check-circle', text: 'Đổi mới & sáng tạo' },
    { icon: 'fas fa-check-circle', text: 'Đoàn kết & hợp tác' },
    { icon: 'fas fa-check-circle', text: 'Không ngừng phát triển' },
  ];

  return (
    <section id="about" className="section about">
      <div className="container">
        <div className="about-grid">
          <div className="about-image-container slide-in-left">
            <img
              src="/images/logo.png"
              alt="CLB Bóng Bàn LQD"
              className="about-image"
            />
            <div className="about-image-badge">
              <strong>3+</strong>
              <span>Năm kinh nghiệm</span>
            </div>
          </div>

          <div className="about-content slide-in-right">
            <span className="section-subtitle">VỀ CHÚNG TÔI</span>
            <h2>
              CÂU LẠC BỘ BÓNG BÀN <span className="text-gradient">LÊ QUÝ ĐÔN</span>
            </h2>

            <p className="about-text">
              CLB bóng bàn Lê Quý Đôn được thành lập với sứ mệnh phát triển phong trào bóng bàn
              trong cộng đồng học sinh, sinh viên và người yêu thể thao. Bóng bàn không chỉ rèn luyện
              thể chất mà còn phát triển tư duy chiến thuật, khả năng tập trung và tinh thần đồng đội.
            </p>

            <p className="about-text">
              <strong>Tầm nhìn:</strong> Trở thành CLB bóng bàn hàng đầu trong thành phố Hồ Chí Minh,
              đào tạo vận động viên xuất sắc và lan tỏa niềm đam mê bóng bàn đến mọi người.
            </p>

            <div className="about-values">
              {values.map((value, index) => (
                <div key={index} className="about-value">
                  <i className={value.icon}></i>
                  <span>{value.text}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
              <i className="fas fa-envelope"></i>
              LIÊN HỆ VỚI CHÚNG TÔI
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;