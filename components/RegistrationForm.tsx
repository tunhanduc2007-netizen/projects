import React, { useState } from 'react';

interface FormData {
    name: string;
    phone: string;
    email: string;
    age: string;
    level: string;
    message: string;
}

const RegistrationForm: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        phone: '',
        email: '',
        age: '',
        level: 'beginner',
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
            // Gửi email qua FormSubmit (free service)
            const response = await fetch('https://formsubmit.co/ajax/clbbongbanlqd@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    _subject: `[CLB Bóng Bàn LQD] Đăng ký tập thử - ${formData.name}`,
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    age: formData.age,
                    level: formData.level === 'beginner' ? 'Mới bắt đầu' :
                        formData.level === 'intermediate' ? 'Trung bình' : 'Nâng cao',
                    message: formData.message || 'Không có ghi chú'
                })
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    age: '',
                    level: 'beginner',
                    message: ''
                });
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
        <section id="register" className="section registration">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">Đăng Ký</span>
                    <h2 className="section-title">
                        Đăng Ký <span>Tập Thử Miễn Phí</span>
                    </h2>
                    <p className="section-description">
                        Điền thông tin để được tư vấn và trải nghiệm buổi tập thử miễn phí tại CLB
                    </p>
                </div>

                <div className="registration-container fade-in">
                    <div className="registration-benefits">
                        <h3>Quyền Lợi Khi Đăng Ký</h3>
                        <ul>
                            <li>
                                <i className="fas fa-check-circle"></i>
                                <span>1 buổi tập thử miễn phí</span>
                            </li>
                            <li>
                                <i className="fas fa-check-circle"></i>
                                <span>Được HLV hướng dẫn trực tiếp</span>
                            </li>
                            <li>
                                <i className="fas fa-check-circle"></i>
                                <span>Mượn vợt và bóng miễn phí</span>
                            </li>
                            <li>
                                <i className="fas fa-check-circle"></i>
                                <span>Tư vấn chọn vợt phù hợp</span>
                            </li>
                            <li>
                                <i className="fas fa-check-circle"></i>
                                <span>Giảm 10% gói tháng khi đăng ký</span>
                            </li>
                        </ul>

                        <div className="registration-contact">
                            <p>Hoặc liên hệ trực tiếp:</p>
                            <a href="tel:0913909012" className="btn btn-outline-dark">
                                <i className="fas fa-phone"></i>
                                0913 909 012
                            </a>
                        </div>
                    </div>

                    <form className="registration-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Họ và Tên <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nguyễn Văn A"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Số Điện Thoại <span className="required">*</span></label>
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
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
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
                                <label htmlFor="age">Độ Tuổi</label>
                                <input
                                    type="text"
                                    id="age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    placeholder="VD: 25 tuổi"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="level">Trình Độ Hiện Tại</label>
                            <select
                                id="level"
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                            >
                                <option value="beginner">Mới bắt đầu / Chưa biết chơi</option>
                                <option value="intermediate">Trung bình / Đã biết cơ bản</option>
                                <option value="advanced">Nâng cao / Đã thi đấu</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Ghi Chú Thêm</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Thời gian bạn muốn đến tập, hoặc câu hỏi khác..."
                                rows={3}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-large btn-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane"></i>
                                    Đăng Ký Ngay
                                </>
                            )}
                        </button>

                        {submitStatus === 'success' && (
                            <div className="form-message success">
                                <i className="fas fa-check-circle"></i>
                                Đăng ký thành công! Chúng tôi sẽ liên hệ bạn sớm nhất.
                            </div>
                        )}

                        {submitStatus === 'error' && (
                            <div className="form-message error">
                                <i className="fas fa-exclamation-circle"></i>
                                Có lỗi xảy ra. Vui lòng thử lại hoặc gọi trực tiếp 0913 909 012.
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
};

export default RegistrationForm;
