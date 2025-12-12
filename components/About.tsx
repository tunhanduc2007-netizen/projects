import React from 'react';

const About: React.FC = () => {
  const values = [
    { icon: 'fas fa-check-circle', text: 'Chuyên nghiệp & Tận tâm' },
    { icon: 'fas fa-check-circle', text: 'Đổi mới & Sáng tạo' },
    { icon: 'fas fa-check-circle', text: 'Đoàn kết & Hợp tác' },
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
              <strong>5+</strong>
              <span>Năm Kinh Nghiệm</span>
            </div>
          </div>

          <div className="about-content slide-in-right">
            <span className="section-subtitle">About Us</span>
            <h2>
              Câu Lạc Bộ Bóng Bàn <span className="text-gradient">Lê Quý Đôn</span>
            </h2>

            <p className="about-text">
              CLB Bóng Bàn Lê Quý Đôn được thành lập với sứ mệnh phát triển phong trào bóng bàn
              trong cộng đồng học sinh, sinh viên và người yêu thể thao. Chúng tôi tin rằng bóng bàn
              không chỉ là môn thể thao rèn luyện thể chất mà còn giúp phát triển tư duy chiến thuật,
              khả năng tập trung và tinh thần đồng đội.
            </p>

            <p className="about-text">
              <strong>Tầm nhìn:</strong> Trở thành CLB bóng bàn hàng đầu trong khu vực, đào tạo ra
              những vận động viên xuất sắc và lan tỏa niềm đam mê bóng bàn đến với mọi người.
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
              Liên Hệ Với Chúng Tôi
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;