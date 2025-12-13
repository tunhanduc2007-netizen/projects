import React, { useState } from 'react';

interface Coach {
    id: number;
    name: string;
    role: string;
    avatar?: string;
    fee: string;
    feeNote: string;
    tableFee?: string;
    phone?: string;
    experience: string;
    students: string;
    rating: string;
    schedule: { day: string; time: string }[];
    badges: string[];
    achievements?: { title: string; rank: string }[];
    isOnline?: boolean;
}

const coaches: Coach[] = [
    {
        id: 1,
        name: 'Võ Hoàng Nhựt Sơn',
        role: 'Huấn Luyện Viên',
        avatar: '/images/coach-son.png',
        fee: '250,000',
        feeNote: '/ giờ',
        tableFee: '50,000',
        phone: '0937298709',
        experience: '7 năm +',
        students: '10+',
        rating: '5.0',
        schedule: [
            { day: 'T2-T5', time: '4:30 PM – 8:00 PM' },
            { day: 'T6', time: '5:30 PM – 6:30 PM' },
            { day: 'T7-CN', time: '9:00 – 11:00, 16:00 – 18:00' }
        ],
        badges: ['Chuyên nghiệp', 'Có chứng chỉ'],
        achievements: [
            { title: 'CLB TP.HCM', rank: 'Hạng 1' },
            { title: 'Cúp VTV8 VII - 2024', rank: 'Hạng 2' },
            { title: 'Cúp Lucky Sport 2023', rank: 'Hạng 2' },
            { title: 'Cúp VTV8 VI - 2023', rank: 'Hạng 3' },
            { title: 'CLB TP.HCM MR 2025', rank: 'Hạng 2' },
            { title: 'Cúp VLOOP 2024', rank: 'Hạng 3' }
        ],
        isOnline: true
    },
    {
        id: 2,
        name: 'Văn Huỳnh Phương Huy',
        role: 'Huấn Luyện Viên',
        avatar: '/images/coach-huy.jpg',
        fee: '230,000',
        feeNote: '/ giờ',
        tableFee: '50,000',
        phone: '0937009075',
        experience: '8 năm +',
        students: '10+',
        rating: '5.0',
        schedule: [
            { day: 'T3', time: '18:00 – 20:00' },
            { day: 'T5', time: '18:00 – 20:00' },
            { day: 'T7', time: '8:00 – 9:00' },
            { day: 'CN', time: '8:00 – 10:30' }
        ],
        badges: ['Chuyên nghiệp', 'Kinh nghiệm'],
        isOnline: true
    }
];

const CoachTrial: React.FC = () => {
    const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

    const closeModal = () => setSelectedCoach(null);

    return (
        <section id="coach-trial" className="section coaches-section">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">
                        <i className="fas fa-chalkboard-teacher"></i> Đội Ngũ
                    </span>
                    <h2 className="section-title">
                        Huấn Luyện Viên <span>Riêng</span>
                    </h2>
                    <p className="section-description">
                        Đăng ký học với huấn luyện viên để được hướng dẫn 1 kèm 1
                    </p>
                </div>

                <div className="coaches-grid">
                    {coaches.map((coach) => (
                        <div key={coach.id} className="coach-card-compact">
                            {/* Avatar & Status */}
                            <div className="coach-card-header">
                                <div className="coach-avatar-sm">
                                    {coach.avatar ? (
                                        <img src={coach.avatar} alt={coach.name} />
                                    ) : (
                                        <i className="fas fa-user"></i>
                                    )}
                                </div>
                                {coach.isOnline && (
                                    <span className="online-badge">
                                        <span className="pulse-dot"></span>
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="coach-card-body">
                                <h4 className="coach-card-name">{coach.name}</h4>
                                <p className="coach-card-role">{coach.role}</p>

                                {/* Quick Stats */}
                                <div className="coach-mini-stats">
                                    <div className="mini-stat">
                                        <i className="fas fa-star"></i>
                                        <span>{coach.rating}</span>
                                    </div>
                                    <div className="mini-stat">
                                        <i className="fas fa-users"></i>
                                        <span>{coach.students}</span>
                                    </div>
                                    <div className="mini-stat">
                                        <i className="fas fa-briefcase"></i>
                                        <span>{coach.experience}</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="coach-card-price">
                                    <div className="price-row">
                                        <span className="price-label">Học phí:</span>
                                        <span className="price-amount">₫{coach.fee}<span className="price-unit">{coach.feeNote}</span></span>
                                    </div>
                                    {coach.tableFee && (
                                        <div className="price-row table-fee">
                                            <span className="price-label">Thuê bàn:</span>
                                            <span className="price-amount-sm">₫{coach.tableFee}<span className="price-unit">/ giờ</span></span>
                                        </div>
                                    )}
                                </div>

                                {/* Schedule Preview */}
                                <div className="coach-schedule-preview">
                                    {coach.schedule.slice(0, 2).map((s, i) => (
                                        <div key={i} className="schedule-mini">
                                            <span className="day">{s.day}:</span>
                                            <span className="time">{s.time}</span>
                                        </div>
                                    ))}
                                    {coach.schedule.length > 2 && (
                                        <span className="more-schedule">+{coach.schedule.length - 2} lịch khác</span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="coach-card-actions">
                                <button
                                    className="btn-view-detail"
                                    onClick={() => setSelectedCoach(coach)}
                                >
                                    <i className="fas fa-info-circle"></i>
                                    Chi tiết
                                </button>
                                <a href={`tel:${coach.phone || '0913909012'}`} className="btn-contact-coach">
                                    <i className="fas fa-phone-alt"></i>
                                    Gọi ngay
                                </a>
                            </div>
                        </div>
                    ))}

                    {/* Add Coach Placeholder */}
                    <div className="coach-card-placeholder">
                        <div className="placeholder-content">
                            <i className="fas fa-user-plus"></i>
                            <span>Thêm HLV</span>
                            <p>Sắp ra mắt</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for Schedule Detail */}
            {selectedCoach && (
                <div className="coach-modal-overlay" onClick={closeModal}>
                    <div className="coach-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>
                            <i className="fas fa-times"></i>
                        </button>

                        <div className="modal-header">
                            <div className="modal-avatar">
                                {selectedCoach.avatar ? (
                                    <img src={selectedCoach.avatar} alt={selectedCoach.name} />
                                ) : (
                                    <i className="fas fa-user"></i>
                                )}
                            </div>
                            <div className="modal-info">
                                <h3>{selectedCoach.name}</h3>
                                <p>{selectedCoach.role}</p>
                            </div>
                        </div>

                        <div className="modal-body">
                            {/* Thành tích */}
                            {selectedCoach.achievements && selectedCoach.achievements.length > 0 && (
                                <div className="modal-section">
                                    <h4><i className="fas fa-trophy"></i> Thành Tích</h4>
                                    <div className="achievements-list">
                                        {selectedCoach.achievements.map((a, i) => (
                                            <div key={i} className="achievement-item">
                                                <span className={`achievement-rank rank-${a.rank.toLowerCase().replace(' ', '')}`}>
                                                    {a.rank}
                                                </span>
                                                <span className="achievement-title">{a.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="modal-section">
                                <h4><i className="fas fa-calendar-alt"></i> Lịch Tập</h4>
                                <div className="schedule-full-list">
                                    {selectedCoach.schedule.map((s, i) => (
                                        <div key={i} className="schedule-row">
                                            <span className="schedule-day-label">{s.day}</span>
                                            <span className="schedule-time-label">{s.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-section">
                                <h4><i className="fas fa-tag"></i> Chi Phí</h4>
                                <div className="modal-price-list">
                                    <div className="modal-price-row">
                                        <span className="modal-price-label">Học phí:</span>
                                        <div className="modal-price">
                                            <span className="price-big">₫{selectedCoach.fee}</span>
                                            <span className="price-note">{selectedCoach.feeNote}</span>
                                        </div>
                                    </div>
                                    {selectedCoach.tableFee && (
                                        <div className="modal-price-row">
                                            <span className="modal-price-label">Thuê bàn:</span>
                                            <div className="modal-price">
                                                <span className="price-medium">₫{selectedCoach.tableFee}</span>
                                                <span className="price-note">/ giờ</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-badges">
                                {selectedCoach.badges.map((badge, i) => (
                                    <span key={i} className="modal-badge">
                                        <i className="fas fa-check"></i> {badge}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <a href={`tel:${selectedCoach.phone || '0913909012'}`} className="btn btn-primary btn-full" onClick={closeModal}>
                                <i className="fas fa-phone-alt"></i>
                                Gọi: {selectedCoach.phone || '0913909012'}
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default CoachTrial;
