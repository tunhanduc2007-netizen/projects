import React, { useState } from 'react';

const contactChannels = [
    {
        icon: 'fas fa-phone-alt',
        title: 'HOTLINE HỖ TRỢ',
        content: '0913 909 012',
        subtext: 'Thứ 2 – CN: 8:00 – 21:30',
        action: 'tel:0913909012',
        actionText: 'GỌI NGAY',
        btnClass: 'btn-red',
        iconClass: 'icon-red'
    },
    {
        icon: 'fab fa-facebook-messenger',
        title: 'CHAT FACEBOOK',
        content: 'Nhắn tin trực tiếp',
        subtext: 'Phản hồi trong 5 phút',
        action: 'https://www.facebook.com/clbbongbanlequydon',
        actionText: 'CHAT NGAY',
        btnClass: 'btn-blue',
        iconClass: 'icon-blue'
    },
    {
        icon: 'fas fa-comments',
        title: 'ZALO',
        content: '0913 909 012',
        subtext: 'Hỗ trợ 24/7',
        action: 'https://zalo.me/0913909012',
        actionText: 'NHẮN ZALO',
        btnClass: 'btn-zalo',
        iconClass: 'icon-zalo'
    },
    {
        icon: 'fas fa-envelope',
        title: 'EMAIL',
        content: 'tunhanluan1971@gmail.com',
        subtext: 'Phản hồi trong 24h',
        action: 'mailto:tunhanluan1971@gmail.com',
        actionText: 'GỬI EMAIL',
        btnClass: 'btn-gradient',
        iconClass: 'icon-gradient'
    }
];

const Support: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        subject: 'Đăng ký tập thử',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const form = e.target as HTMLFormElement;
            const formDataToSend = new FormData(form);

            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formDataToSend as any).toString()
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({ name: '', phone: '', email: '', subject: 'Đăng ký tập thử', message: '' });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSubmitStatus('idle'), 5000);
        }
    };

    return (
        <section id="support" className="section support-contact">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">LIÊN HỆ</span>
                    <h2 className="section-title">
                        KÊNH <span>HỖ TRỢ</span>
                    </h2>
                    <p className="section-description">
                        Liên hệ với chúng tôi qua các kênh dưới đây hoặc gửi tin nhắn trực tiếp. Đội ngũ hỗ trợ luôn sẵn sàng!
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

                {/* Divider */}
                <div className="support-divider fade-in">
                    <span>HOẶC GỬI TIN NHẮN</span>
                </div>

                {/* Contact Form Section */}
                <div className="support-form-wrapper fade-in">
                    <form
                        name="contact"
                        method="POST"
                        data-netlify="true"
                        netlify-honeypot="bot-field"
                        onSubmit={handleSubmit}
                        className="support-contact-form"
                    >
                        {/* Netlify required hidden inputs */}
                        <input type="hidden" name="form-name" value="contact" />
                        <p style={{ display: 'none' }}>
                            <label>
                                Don't fill this out if you're human: <input name="bot-field" />
                            </label>
                        </p>

                        <div className="support-form-grid">
                            <div className="form-group">
                                <label htmlFor="name">
                                    <i className="fas fa-user"></i>
                                    Họ và tên <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nhập họ và tên của bạn"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">
                                    <i className="fas fa-phone"></i>
                                    Số điện thoại <span className="required">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="0912 345 678"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">
                                    <i className="fas fa-envelope"></i>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">
                                    <i className="fas fa-tag"></i>
                                    Chủ đề
                                </label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                >
                                    <option value="Đăng ký tập thử">Đăng ký tập thử miễn phí</option>
                                    <option value="Hỏi về khóa học">Hỏi về khóa học</option>
                                    <option value="Đặt lịch với HLV">Đặt lịch với huấn luyện viên</option>
                                    <option value="Hỏi về thiết bị">Hỏi về thiết bị/dụng cụ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>

                            <div className="form-group form-group-full">
                                <label htmlFor="message">
                                    <i className="fas fa-comment-alt"></i>
                                    Tin nhắn <span className="required">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Nhập nội dung tin nhắn của bạn..."
                                    rows={4}
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`support-submit-btn ${isSubmitting ? 'submitting' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>ĐANG GỬI...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane"></i>
                                    <span>GỬI TIN NHẮN</span>
                                </>
                            )}
                        </button>

                        {/* Success/Error Messages */}
                        {submitStatus === 'success' && (
                            <div className="form-message success">
                                <i className="fas fa-check-circle"></i>
                                <span>Gửi thành công! Chúng tôi sẽ liên hệ bạn sớm.</span>
                            </div>
                        )}
                        {submitStatus === 'error' && (
                            <div className="form-message error">
                                <i className="fas fa-exclamation-circle"></i>
                                <span>Có lỗi xảy ra. Vui lòng thử lại hoặc gọi trực tiếp.</span>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Support;
