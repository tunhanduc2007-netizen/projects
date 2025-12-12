import React from 'react';

const Schedule: React.FC = () => {
    return (
        <section id="schedule" className="section schedule">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">Thời Khóa Biểu</span>
                    <h2 className="section-title">
                        Lịch <span>Tập Luyện</span>
                    </h2>
                    <p className="section-description">
                        Lịch tập hàng tuần sẽ được cập nhật sớm
                    </p>
                </div>

                {/* Empty State */}
                <div className="schedule-empty fade-in">
                    <div className="schedule-empty-icon">
                        <i className="fas fa-calendar-alt"></i>
                    </div>
                    <h3>Đang Cập Nhật</h3>
                    <p>Lịch tập luyện chi tiết sẽ được thông báo sau.</p>
                    <p>Vui lòng liên hệ để biết thêm thông tin.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <i className="fas fa-phone"></i>
                        Liên Hệ Ngay
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Schedule;
