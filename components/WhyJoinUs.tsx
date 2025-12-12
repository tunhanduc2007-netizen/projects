import React from 'react';

const features = [
    {
        icon: 'fas fa-trophy',
        title: 'Huấn Luyện Chuyên Nghiệp',
        description: 'Đội ngũ HLV có chứng chỉ quốc tế với kinh nghiệm thi đấu và huấn luyện nhiều năm.'
    },
    {
        icon: 'fas fa-users',
        title: 'Cộng Đồng Năng Động',
        description: 'Giao lưu, kết bạn với những người có cùng đam mê bóng bàn từ mọi lứa tuổi.'
    },
    {
        icon: 'fas fa-table-tennis-paddle-ball',
        title: 'Trang Thiết Bị Hiện Đại',
        description: 'Bàn tập chuẩn quốc tế, vợt chất lượng cao và khu vực tập luyện thoáng mát.'
    },
    {
        icon: 'fas fa-calendar-check',
        title: 'Lịch Tập Linh Hoạt',
        description: 'Đa dạng khung giờ tập luyện phù hợp với lịch học tập và công việc của bạn.'
    },
    {
        icon: 'fas fa-medal',
        title: 'Cơ Hội Thi Đấu',
        description: 'Tham gia các giải đấu nội bộ và giao hữu để rèn luyện bản lĩnh thi đấu.'
    },
    {
        icon: 'fas fa-heart',
        title: 'Rèn Luyện Sức Khỏe',
        description: 'Bóng bàn giúp cải thiện phản xạ, tập trung và sức khỏe toàn diện.'
    }
];

const WhyJoinUs: React.FC = () => {
    return (
        <section id="why-join" className="section why-join">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">Why Choose Us</span>
                    <h2 className="section-title">
                        Tại Sao Chọn <span>CLB Bóng Bàn LQD?</span>
                    </h2>
                    <p className="section-description">
                        Chúng tôi cung cấp môi trường tập luyện tốt nhất để bạn phát triển kỹ năng và đam mê bóng bàn
                    </p>
                </div>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`feature-card fade-in stagger-${index + 1}`}
                        >
                            <div className="feature-icon">
                                <i className={feature.icon}></i>
                            </div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyJoinUs;
