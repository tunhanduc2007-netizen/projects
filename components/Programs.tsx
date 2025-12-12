import React from 'react';

const programs = [
    {
        level: 'Beginner',
        title: 'Lớp Cơ Bản',
        price: '500K',
        period: '/tháng',
        description: 'Dành cho người mới bắt đầu, học các kỹ thuật cơ bản và luật chơi.',
        features: [
            'Kỹ thuật cầm vợt đúng cách',
            'Các đường đánh cơ bản',
            'Footwork và di chuyển',
            'Quy tắc và luật thi đấu',
            '4 buổi / tuần (60 phút)',
            'Vợt và bóng được cung cấp'
        ],
        featured: false
    },
    {
        level: 'Intermediate',
        title: 'Lớp Trung Cấp',
        price: '800K',
        period: '/tháng',
        description: 'Nâng cao kỹ thuật, học chiến thuật và chuẩn bị thi đấu.',
        features: [
            'Kỹ thuật spin nâng cao',
            'Chiến thuật tấn công & phòng thủ',
            'Phân tích đối thủ',
            'Tập luyện với máy bắn bóng',
            '5 buổi / tuần (90 phút)',
            'Tham gia giải nội bộ'
        ],
        featured: true
    },
    {
        level: 'Advanced',
        title: 'Lớp Thi Đấu',
        price: '1.2M',
        period: '/tháng',
        description: 'Dành cho VĐV muốn tham gia các giải đấu chuyên nghiệp.',
        features: [
            'Chương trình cá nhân hóa',
            'Phân tích video kỹ thuật',
            'Chuẩn bị tâm lý thi đấu',
            'Tham gia giải đấu bên ngoài',
            '6 buổi / tuần (120 phút)',
            'HLV 1-1 chuyên biệt'
        ],
        featured: false
    }
];

const Programs: React.FC = () => {
    return (
        <section id="programs" className="section programs">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">Training Programs</span>
                    <h2 className="section-title">
                        Chương Trình <span>Huấn Luyện</span>
                    </h2>
                    <p className="section-description">
                        Lựa chọn chương trình phù hợp với trình độ và mục tiêu của bạn
                    </p>
                </div>

                <div className="programs-grid">
                    {programs.map((program, index) => (
                        <div
                            key={index}
                            className={`program-card fade-in stagger-${index + 1} ${program.featured ? 'featured' : ''}`}
                        >
                            <span className="program-level">{program.level}</span>
                            <h3 className="program-title">{program.title}</h3>
                            <div className="program-price">
                                {program.price}<span>{program.period}</span>
                            </div>
                            <p className="program-description">{program.description}</p>

                            <ul className="program-features">
                                {program.features.map((feature, i) => (
                                    <li key={i} className="program-feature">
                                        <i className="fas fa-check"></i>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`btn ${program.featured ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Đăng Ký Ngay
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Programs;
