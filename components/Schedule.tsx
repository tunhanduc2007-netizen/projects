import React from 'react';

const Schedule: React.FC = () => {
    // Dữ liệu lịch tập - để trống cho người dùng tự điền
    const scheduleData = [
        { day: 'Thứ 2', morning: '', afternoon: '', evening: '' },
        { day: 'Thứ 3', morning: '', afternoon: '', evening: '' },
        { day: 'Thứ 4', morning: '', afternoon: '', evening: '' },
        { day: 'Thứ 5', morning: '', afternoon: '', evening: '' },
        { day: 'Thứ 6', morning: '', afternoon: '', evening: '' },
        { day: 'Thứ 7', morning: '', afternoon: '', evening: '' },
        { day: 'Chủ Nhật', morning: '', afternoon: '', evening: '' },
    ];

    return (
        <section id="schedule" className="section schedule">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">Thời Khóa Biểu</span>
                    <h2 className="section-title">
                        Lịch <span>Tập Luyện</span>
                    </h2>
                    <p className="section-description">
                        Lịch tập hàng tuần tại CLB Bóng Bàn Lê Quý Đôn
                    </p>
                </div>

                {/* Bảng lịch tập luyện */}
                <div className="schedule-table-wrapper fade-in">
                    <table className="schedule-table">
                        <thead>
                            <tr>
                                <th className="schedule-day-header">Ngày</th>
                                <th className="schedule-time-header">
                                    <i className="fas fa-sun"></i>
                                    <span>Sáng</span>
                                    <small>08:00 - 12:00</small>
                                </th>
                                <th className="schedule-time-header">
                                    <i className="fas fa-cloud-sun"></i>
                                    <span>Chiều</span>
                                    <small>14:00 - 17:00</small>
                                </th>
                                <th className="schedule-time-header">
                                    <i className="fas fa-moon"></i>
                                    <span>Tối</span>
                                    <small>18:00 - 21:30</small>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {scheduleData.map((row, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'schedule-row-even' : 'schedule-row-odd'}>
                                    <td className="schedule-day-cell">{row.day}</td>
                                    <td className="schedule-cell">
                                        {row.morning || <span className="schedule-empty-cell">—</span>}
                                    </td>
                                    <td className="schedule-cell">
                                        {row.afternoon || <span className="schedule-empty-cell">—</span>}
                                    </td>
                                    <td className="schedule-cell">
                                        {row.evening || <span className="schedule-empty-cell">—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Ghi chú */}
                <div className="schedule-notes fade-in">
                    <div className="schedule-note">
                        <i className="fas fa-info-circle"></i>
                        <span>Lịch tập có thể thay đổi theo tuần. Vui lòng liên hệ để xác nhận.</span>
                    </div>
                    <div className="schedule-note">
                        <i className="fas fa-phone"></i>
                        <span>Hotline: <strong>0913 909 012</strong></span>
                    </div>
                </div>

                {/* CTA */}
                <div className="schedule-cta fade-in">
                    <button
                        className="btn btn-primary"
                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <i className="fas fa-calendar-check"></i>
                        Đăng Ký Tập Ngay
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Schedule;
