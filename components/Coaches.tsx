import React from 'react';

const coaches = [
    {
        name: 'Nguyễn Văn Minh',
        role: 'Head Coach',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        bio: 'Cựu tuyển thủ quốc gia với hơn 15 năm kinh nghiệm huấn luyện. Chuyên đào tạo kỹ thuật nâng cao.',
        achievements: ['HCV Quốc gia 2015', 'HLV Xuất sắc 2020', 'Chứng chỉ ITTF']
    },
    {
        name: 'Trần Thị Hương',
        role: 'Assistant Coach',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
        bio: 'Vận động viên trẻ đầy triển vọng, chuyên hướng dẫn các lớp cơ bản và trẻ em.',
        achievements: ['Giải trẻ 2018', 'Top 10 VN', 'Chứng chỉ PTI']
    },
    {
        name: 'Lê Hoàng Nam',
        role: 'Technical Coach',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
        bio: 'Chuyên gia phân tích kỹ thuật và chiến thuật, giúp học viên nâng cao trình độ thi đấu.',
        achievements: ['Giải đôi 2019', 'HLV kỹ thuật', '10 năm kinh nghiệm']
    }
];

const Coaches: React.FC = () => {
    return (
        <section id="coaches" className="section coaches">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">Our Team</span>
                    <h2 className="section-title">
                        Đội Ngũ <span>Huấn Luyện Viên</span>
                    </h2>
                    <p className="section-description">
                        Huấn luyện viên giàu kinh nghiệm, tận tâm đồng hành cùng bạn trên con đường chinh phục bóng bàn
                    </p>
                </div>

                <div className="coaches-grid">
                    {coaches.map((coach, index) => (
                        <div key={index} className={`coach-card fade-in stagger-${index + 1}`}>
                            <img src={coach.image} alt={coach.name} className="coach-image" />
                            <div className="coach-info">
                                <h3 className="coach-name">{coach.name}</h3>
                                <span className="coach-role">{coach.role}</span>
                                <p className="coach-bio">{coach.bio}</p>
                                <div className="coach-achievements">
                                    {coach.achievements.map((achievement, i) => (
                                        <span key={i} className="coach-badge">{achievement}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Coaches;
