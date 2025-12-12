import React, { useState } from 'react';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        experience: '',
        preferredTime: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            experience: '',
            preferredTime: '',
            message: ''
        });

        // Hide success message after 5 seconds
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <section id="contact" className="section contact">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">Get In Touch</span>
                    <h2 className="section-title">
                        Liên Hệ & <span>Đăng Ký</span>
                    </h2>
                    <p className="section-description">
                        Sẵn sàng bắt đầu hành trình bóng bàn? Liên hệ với chúng tôi ngay!
                    </p>
                </div>

                <div className="contact-grid">
                    <div className="contact-info slide-in-left">
                        <h3>Thông Tin Liên Hệ</h3>
                        <p className="contact-info-text">
                            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Đừng ngần ngại liên hệ qua bất kỳ kênh nào dưới đây.
                        </p>

                        <div className="contact-details">
                            <div className="contact-item">
                                <div className="contact-item-icon">
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <div className="contact-item-content">
                                    <h4>Địa Chỉ</h4>
                                    <p>Trường THPT Lê Quý Đôn<br />123 Đường ABC, Quận XYZ<br />TP. Hồ Chí Minh</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-item-icon">
                                    <i className="fas fa-phone"></i>
                                </div>
                                <div className="contact-item-content">
                                    <h4>Hotline</h4>
                                    <p>0909 123 456</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-item-icon">
                                    <i className="fas fa-envelope"></i>
                                </div>
                                <div className="contact-item-content">
                                    <h4>Email</h4>
                                    <p>contact@clbbongban-lqd.edu.vn</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-item-icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <div className="contact-item-content">
                                    <h4>Giờ Làm Việc</h4>
                                    <p>Thứ 2 - Thứ 6: 17:00 - 21:00<br />Thứ 7 - CN: 08:00 - 18:00</p>
                                </div>
                            </div>
                        </div>

                        <div className="contact-social">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" aria-label="Zalo">
                                <i className="fas fa-comment-dots"></i>
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                                <i className="fab fa-youtube"></i>
                            </a>
                        </div>
                    </div>

                    <div className="contact-form-container slide-in-right">
                        <h3>Đăng Ký Tham Gia</h3>
                        <p>Điền thông tin bên dưới, chúng tôi sẽ liên hệ bạn trong 24h.</p>

                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="fullName">Họ và Tên *</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        className="form-input"
                                        placeholder="Nguyễn Văn A"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="phone">Số Điện Thoại *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        className="form-input"
                                        placeholder="0909 xxx xxx"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="experience">Trình Độ *</label>
                                    <select
                                        id="experience"
                                        name="experience"
                                        className="form-select"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">-- Chọn trình độ --</option>
                                        <option value="beginner">Mới bắt đầu</option>
                                        <option value="basic">Cơ bản</option>
                                        <option value="intermediate">Trung cấp</option>
                                        <option value="advanced">Nâng cao</option>
                                        <option value="pro">Chuyên nghiệp</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="preferredTime">Thời Gian Tập Mong Muốn *</label>
                                <select
                                    id="preferredTime"
                                    name="preferredTime"
                                    className="form-select"
                                    value={formData.preferredTime}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">-- Chọn khung giờ --</option>
                                    <option value="morning">Buổi sáng (8:00 - 12:00)</option>
                                    <option value="afternoon">Buổi chiều (14:00 - 17:00)</option>
                                    <option value="evening">Buổi tối (17:00 - 21:00)</option>
                                    <option value="weekend">Cuối tuần</option>
                                    <option value="flexible">Linh hoạt</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="message">Lời Nhắn</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    className="form-textarea"
                                    placeholder="Cho chúng tôi biết thêm về bạn..."
                                    value={formData.message}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary form-submit">
                                <i className="fas fa-paper-plane"></i>
                                Gửi Đăng Ký
                            </button>

                            <div className={`form-success ${submitted ? 'show' : ''}`}>
                                <i className="fas fa-check-circle"></i> Đăng ký thành công! Chúng tôi sẽ liên hệ bạn sớm nhất.
                            </div>
                        </form>
                    </div>
                </div>

                {/* Google Map */}
                <div className="contact-map fade-in">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4946681007846!2d106.69832831480068!3d10.773374992323456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3e1f0d6f07%3A0x9b7b3f56d36b9d5!2zVHLGsOG7nW5nIFRIUFQgTMOqIFF1w70gxJDDtG4!5e0!3m2!1svi!2s!4v1234567890"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="CLB Bóng Bàn LQD Location"
                    ></iframe>
                </div>
            </div>
        </section>
    );
};

export default Contact;
