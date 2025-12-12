import React from 'react';

const contactChannels = [
    {
        icon: 'fas fa-phone-alt',
        title: 'Hotline Hỗ Trợ',
        content: '0913 909 012',
        subtext: 'Thứ 2 – CN: 8:00 – 21:30',
        action: 'tel:0913909012',
        actionText: 'Gọi ngay',
        btnClass: 'btn-red',
        iconClass: 'icon-red'
    },
    {
        icon: 'fab fa-facebook-messenger',
        title: 'Chat Facebook',
        content: 'Nhắn tin trực tiếp',
        subtext: 'Phản hồi trong 5 phút',
        action: 'https://m.me/clbbongbanlqd',
        actionText: 'Chat ngay',
        btnClass: 'btn-blue',
        iconClass: 'icon-blue'
    },
    {
        icon: 'fas fa-comments',
        title: 'Zalo',
        content: '0913 909 012',
        subtext: 'Hỗ trợ 24/7',
        action: 'https://zalo.me/0913909012',
        actionText: 'Nhắn Zalo',
        btnClass: 'btn-zalo',
        iconClass: 'icon-zalo'
    },
    {
        icon: 'fas fa-envelope',
        title: 'Email',
        content: 'clbbongbanlqd@gmail.com',
        subtext: 'Phản hồi trong 24h',
        action: 'mailto:clbbongbanlqd@gmail.com',
        actionText: 'Gửi email',
        btnClass: 'btn-gradient',
        iconClass: 'icon-gradient'
    }
];

const Support: React.FC = () => {
    return (
        <section id="support" className="section support-contact">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">Liên Hệ</span>
                    <h2 className="section-title">
                        Kênh <span>Hỗ Trợ</span>
                    </h2>
                    <p className="section-description">
                        Liên hệ với chúng tôi qua các kênh dưới đây. Đội ngũ hỗ trợ luôn sẵn sàng!
                    </p>
                </div>

                {/* Contact Channels Grid */}
                <div className="contact-channels-grid fade-in">
                    {contactChannels.map((item, index) => (
                        <a
                            key={index}
                            href={item.action}
                            target={item.action.startsWith('http') ? '_blank' : undefined}
                            rel={item.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className={`contact-channel-card ${item.btnClass}-hover`}
                        >
                            <div className={`channel-icon ${item.iconClass}`}>
                                <i className={item.icon}></i>
                            </div>
                            <div className="channel-content">
                                <h3 className="channel-title">{item.title}</h3>
                                <p className="channel-main">{item.content}</p>
                                <p className="channel-sub">{item.subtext}</p>
                            </div>
                            <span className={`channel-action ${item.btnClass}`}>
                                {item.actionText} <i className="fas fa-arrow-right"></i>
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Support;
