import React from 'react';

const pricingOptions = [
    {
        icon: 'fas fa-table-tennis-paddle-ball',
        title: 'CHƠI THEO LƯỢT',
        price: '35K',
        period: '/lượt',
        description: 'Phù hợp cho người chơi thỉnh thoảng, đến khi nào chơi khi đó.',
        features: [
            'Không cần đăng ký trước',
            'Đến là chơi ngay',
            'Tự do chọn giờ tập'
        ],
        highlighted: false,
        ctaText: 'ĐẾN LÀ CHƠI!'
    },
    {
        icon: 'fas fa-calendar-check',
        title: 'GÓI THÁNG',
        price: '500K',
        period: '/tháng',
        description: 'Tiết kiệm hơn cho ai chơi thường xuyên. Chơi thoải mái cả tháng!',
        features: [
            'Chơi không giới hạn lượt',
            'Ưu tiên đặt bàn',
            'Không cần đăng ký trước',
            'Đến là chơi ngay',
            'Tự do chọn giờ tập'
        ],
        highlighted: true,
        ctaText: 'ĐĂNG KÝ NGAY!'
    },
    {
        icon: 'fas fa-user-shield',
        title: 'THUÊ BÀN RIÊNG',
        price: '50K',
        period: '/người',
        description: 'Dành cho nhóm bạn hoặc cá nhân muốn không gian tập luyện riêng tư.',
        features: [
            'Bao trọn bàn tập',
            'Không gian riêng tư',
            'Thoải mái tập luyện',
            'Đặt bàn trước qua hotline'
        ],
        highlighted: false,
        ctaText: 'ĐẶT BÀN NGAY'
    }
];

const Programs: React.FC = () => {
    return (
        <section id="programs" className="section programs">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">BẢNG GIÁ</span>
                    <h2 className="section-title">
                        GIÁ <span>TẬP LUYỆN</span>
                    </h2>
                    <p className="section-description">
                        Đến là chơi - không cần đăng ký hội viên. Chọn hình thức phù hợp với bạn!
                    </p>
                </div>

                <div className="pricing-grid">
                    {pricingOptions.map((option, index) => (
                        <div
                            key={index}
                            className={`pricing-card fade-in stagger-${index + 1} ${option.highlighted ? 'highlighted' : ''}`}
                        >
                            {option.highlighted && <span className="pricing-badge">TIẾT KIỆM</span>}
                            <div className="pricing-icon">
                                <i className={option.icon}></i>
                            </div>
                            <h3 className="pricing-title">{option.title}</h3>
                            <div className="pricing-price">
                                {option.price}<span>{option.period}</span>
                            </div>
                            <p className="pricing-description">{option.description}</p>

                            <ul className="pricing-features">
                                {option.features.map((feature, i) => (
                                    <li key={i} className="pricing-feature">
                                        <i className="fas fa-check"></i>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`btn ${option.highlighted ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                {option.ctaText}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Note */}
                <div className="pricing-note fade-in">
                    <i className="fas fa-info-circle"></i>
                    <p>
                        <strong>Lưu ý:</strong> Giờ hoạt động từ 08:00 - 21:30 (Thứ 2 - Chủ Nhật).
                        Vui lòng đến trực tiếp hoặc gọi điện để biết tình trạng bàn trống.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Programs;
