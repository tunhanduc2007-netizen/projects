import React from 'react';

interface TimeSlot {
    time: string;
    coach: string;
}

interface DaySchedule {
    day: string;
    slots: TimeSlot[];
}

const Schedule: React.FC = () => {
    // Khung giờ hoạt động của CLB
    const operatingHours = '08:00 - 21:30';

    // Lịch dạy cố định của HLV
    const coachSchedule: DaySchedule[] = [
        {
            day: 'Thứ 2',
            slots: [
                { time: '16:30 – 20:00', coach: 'HLV Sơn' }
            ]
        },
        {
            day: 'Thứ 3',
            slots: [
                { time: '16:30 – 20:00', coach: 'HLV Sơn' },
                { time: '18:00 – 20:00', coach: 'HLV Huy' }
            ]
        },
        {
            day: 'Thứ 4',
            slots: [
                { time: '16:30 – 20:00', coach: 'HLV Sơn' }
            ]
        },
        {
            day: 'Thứ 5',
            slots: [
                { time: '16:30 – 20:00', coach: 'HLV Sơn' },
                { time: '18:00 – 20:00', coach: 'HLV Huy' }
            ]
        },
        {
            day: 'Thứ 6',
            slots: [
                { time: '17:30 – 18:30', coach: 'HLV Sơn' }
            ]
        },
        {
            day: 'Thứ 7',
            slots: [
                { time: '08:00 – 09:00', coach: 'HLV Huy' },
                { time: '09:00 – 11:00', coach: 'HLV Sơn' },
                { time: '16:00 – 18:00', coach: 'HLV Sơn' }
            ]
        },
        {
            day: 'Chủ Nhật',
            slots: [
                { time: '08:00 – 10:30', coach: 'HLV Huy' },
                { time: '09:00 – 11:00', coach: 'HLV Sơn' },
                { time: '16:00 – 18:00', coach: 'HLV Sơn' }
            ]
        }
    ];

    return (
        <section id="schedule" className="section schedule">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">
                        <i className="fas fa-clock"></i> Thời Gian
                    </span>
                    <h2 className="section-title">
                        Lịch <span>Dạy Của HLV</span>
                    </h2>
                    <p className="section-description">
                        Các khung giờ HLV có mặt tại CLB để dạy
                    </p>
                </div>

                <div className="schedule-content fade-in">
                    {/* Operating Hours Banner */}
                    <div className="operating-hours-banner">
                        <div className="hours-icon">
                            <i className="fas fa-store"></i>
                        </div>
                        <div className="hours-info">
                            <h4>CLB mở cửa hàng ngày</h4>
                            <p><strong>{operatingHours}</strong> (Thứ 2 - Chủ Nhật)</p>
                        </div>
                    </div>

                    {/* Coach Schedule Grid */}
                    <div className="coach-schedule-grid">
                        {coachSchedule.map((day, index) => (
                            <div key={index} className="schedule-day-card">
                                <div className="day-header">
                                    <span className="day-name">{day.day}</span>
                                    <span className="slot-count">{day.slots.length} lớp</span>
                                </div>
                                <div className="day-slots">
                                    {day.slots.map((slot, slotIndex) => (
                                        <div key={slotIndex} className="time-slot">
                                            <div className="slot-info">
                                                <span className="slot-time">{slot.time}</span>
                                                <span className="slot-coach">{slot.coach}</span>
                                            </div>
                                            <span className="status-badge status-teaching">Có lớp</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Legend & Notes */}
                    <div className="schedule-notes-box">
                        <div className="note-item note-highlight">
                            <i className="fas fa-calendar-check"></i>
                            <div>
                                <strong>Lịch dạy cố định</strong>
                                <p>Đây là các khung giờ HLV CÓ DẠY hàng tuần tại CLB. Liên hệ để đăng ký học.</p>
                            </div>
                        </div>
                        <div className="note-item note-info">
                            <i className="fas fa-phone-alt"></i>
                            <div>
                                <strong>Muốn học ngày/giờ khác?</strong>
                                <p>Ngoài lịch trên, bạn có thể liên hệ HLV để sắp xếp lịch học riêng phù hợp.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Schedule;
