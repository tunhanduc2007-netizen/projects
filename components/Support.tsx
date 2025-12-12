import React, { useState } from 'react';

const supportItems = [
    {
        icon: 'fas fa-phone-alt',
        title: 'Hotline Hỗ Trợ',
        content: '0913 909 012',
        subtext: 'Thứ 2 - CN: 8:00 - 21:30',
        action: 'tel:0913909012',
        actionText: 'Gọi ngay'
    },
    {
        icon: 'fab fa-facebook-messenger',
        title: 'Chat Facebook',
        content: 'Nhắn tin trực tiếp',
        subtext: 'Phản hồi trong 5 phút',
        action: 'https://m.me/clbbongbanlqd',
        actionText: 'Chat ngay'
    },
    {
        icon: 'fas fa-comments',
        title: 'Zalo',
        content: '0913 909 012',
        subtext: 'Hỗ trợ 24/7',
        action: 'https://zalo.me/0913909012',
        actionText: 'Nhắn Zalo'
    },
    {
        icon: 'fas fa-envelope',
        title: 'Email',
        content: 'clbbongbanlqd@gmail.com',
        subtext: 'Phản hồi trong 24h',
        action: 'mailto:clbbongbanlqd@gmail.com',
        actionText: 'Gửi email'
    }
];

const policies = [
    {
        icon: 'fas fa-shipping-fast',
        title: 'Giao Hàng Nhanh',
        description: 'Miễn phí ship đơn hàng từ 500K. Giao hàng toàn quốc trong 2-5 ngày.'
    },
    {
        icon: 'fas fa-shield-alt',
        title: 'Bảo Hành Chính Hãng',
        description: 'Bảo hành 12 tháng cho cốt vợt, 6 tháng cho mặt vợt. Đổi trả trong 7 ngày.'
    },
    {
        icon: 'fas fa-certificate',
        title: '100% Chính Hãng',
        description: 'Cam kết sản phẩm chính hãng từ nhà phân phối ủy quyền tại Việt Nam.'
    },
    {
        icon: 'fas fa-credit-card',
        title: 'Thanh Toán Linh Hoạt',
        description: 'COD, chuyển khoản, Momo, VNPay. Trả góp 0% qua thẻ tín dụng.'
    }
];

const faqs = [
    {
        question: 'Làm sao để đặt hàng?',
        answer: 'Bạn có thể đặt hàng trực tiếp trên website, gọi hotline 0909 123 456, hoặc nhắn tin qua Facebook/Zalo. Chúng tôi sẽ xác nhận đơn hàng trong vòng 30 phút.'
    },
    {
        question: 'Thời gian giao hàng là bao lâu?',
        answer: 'Nội thành TP.HCM: 1-2 ngày. Các tỉnh thành khác: 3-5 ngày. Đơn hàng trên 2 triệu được giao hàng miễn phí.'
    },
    {
        question: 'Chính sách đổi trả như thế nào?',
        answer: 'Đổi trả miễn phí trong 7 ngày nếu sản phẩm còn nguyên seal, chưa sử dụng. Sản phẩm lỗi do nhà sản xuất được đổi mới 100%.'
    },
    {
        question: 'Làm sao để chọn vợt phù hợp?',
        answer: 'Liên hệ hotline hoặc đến trực tiếp CLB để được tư vấn miễn phí. Chúng tôi sẽ giúp bạn chọn vợt phù hợp với lối chơi và trình độ.'
    },
    {
        question: 'Có hỗ trợ căng mặt vợt không?',
        answer: 'Có! Chúng tôi cung cấp dịch vụ căng mặt vợt chuyên nghiệp với giá ưu đãi cho thành viên CLB.'
    }
];

const Support: React.FC = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <section id="support" className="section support">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">Hỗ Trợ Khách Hàng</span>
                    <h2 className="section-title">
                        Hỗ Trợ <span>Khách Hàng</span>
                    </h2>
                    <p className="section-description">
                        Đội ngũ hỗ trợ tận tâm, sẵn sàng giải đáp mọi thắc mắc của bạn 24/7
                    </p>
                </div>

                {/* Support Channels */}
                <div className="support-channels fade-in">
                    {supportItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.action}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="support-channel"
                        >
                            <div className="support-icon">
                                <i className={item.icon}></i>
                            </div>
                            <div className="support-content">
                                <h3>{item.title}</h3>
                                <p className="support-main">{item.content}</p>
                                <p className="support-sub">{item.subtext}</p>
                            </div>
                            <span className="support-action">
                                {item.actionText} <i className="fas fa-arrow-right"></i>
                            </span>
                        </a>
                    ))}
                </div>

                {/* Policies */}
                <div className="policies-section fade-in">
                    <h3 className="policies-title">
                        <i className="fas fa-hand-holding-heart"></i>
                        Cam Kết Dịch Vụ
                    </h3>
                    <div className="policies-grid">
                        {policies.map((policy, index) => (
                            <div key={index} className="policy-card">
                                <div className="policy-icon">
                                    <i className={policy.icon}></i>
                                </div>
                                <h4>{policy.title}</h4>
                                <p>{policy.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ */}
                <div className="faq-section fade-in">
                    <h3 className="faq-title">
                        <i className="fas fa-question-circle"></i>
                        Câu Hỏi Thường Gặp
                    </h3>
                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`faq-item ${openFaq === index ? 'open' : ''}`}
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            >
                                <div className="faq-question">
                                    <span>{faq.question}</span>
                                    <i className={`fas fa-chevron-${openFaq === index ? 'up' : 'down'}`}></i>
                                </div>
                                <div className="faq-answer">
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Chat CTA */}
                <div className="live-chat-cta fade-in">
                    <div className="chat-cta-content">
                        <h3>Cần hỗ trợ ngay?</h3>
                        <p>Đội ngũ tư vấn viên đang online và sẵn sàng hỗ trợ bạn!</p>
                    </div>
                    <a href="https://zalo.me/0913909012" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-large">
                        <i className="fas fa-headset"></i>
                        Chat Với Chúng Tôi
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Support;
