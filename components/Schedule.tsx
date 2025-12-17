import React, { useState, useRef, useEffect } from 'react';

interface TimeSlot {
    time: string;
    coach: string;
}

interface DaySchedule {
    day: string;
    shortDay: string;
    slots: TimeSlot[];
}

const Schedule: React.FC = () => {
    // Get current day of week (0 = Sunday, 1 = Monday, etc.)
    const today = new Date().getDay();
    const todayIndex = today === 0 ? 6 : today - 1; // Convert to our array index (0 = Monday)

    const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex);
    const [selectedCoach, setSelectedCoach] = useState<string>('all');
    const contentRef = useRef<HTMLDivElement>(null);

    // Lịch dạy cố định của HLV
    const coachSchedule: DaySchedule[] = [
        {
            day: 'Thứ 2',
            shortDay: 'T2',
            slots: [
                { time: '07:00 – 08:00', coach: 'HLV Thơ' },
                { time: '08:30 – 09:30', coach: 'HLV Thơ' },
                { time: '16:30 – 20:00', coach: 'HLV Sơn' },
                { time: '17:30 – 20:30', coach: 'HLV Long' }
            ]
        },
        {
            day: 'Thứ 3',
            shortDay: 'T3',
            slots: [
                { time: '16:30 – 20:00', coach: 'HLV Sơn' },
                { time: '18:00 – 20:00', coach: 'HLV Huy' }
            ]
        },
        {
            day: 'Thứ 4',
            shortDay: 'T4',
            slots: [
                { time: '07:00 – 08:00', coach: 'HLV Thơ' },
                { time: '08:30 – 09:30', coach: 'HLV Thơ' },
                { time: '16:30 – 20:00', coach: 'HLV Sơn' },
                { time: '17:30 – 20:30', coach: 'HLV Long' }
            ]
        },
        {
            day: 'Thứ 5',
            shortDay: 'T5',
            slots: [
                { time: '06:15 – 07:15', coach: 'HLV Thơ' },
                { time: '16:30 – 20:00', coach: 'HLV Sơn' },
                { time: '18:00 – 20:00', coach: 'HLV Huy' }
            ]
        },
        {
            day: 'Thứ 6',
            shortDay: 'T6',
            slots: [
                { time: '07:00 – 08:00', coach: 'HLV Thơ' },
                { time: '08:30 – 09:30', coach: 'HLV Thơ' },
                { time: '17:30 – 18:30', coach: 'HLV Sơn' },
                { time: '17:30 – 20:30', coach: 'HLV Long' }
            ]
        },
        {
            day: 'Thứ 7',
            shortDay: 'T7',
            slots: [
                { time: '06:15 – 07:15', coach: 'HLV Thơ' },
                { time: '08:00 – 09:00', coach: 'HLV Huy' },
                { time: '09:00 – 11:00', coach: 'HLV Sơn' },
                { time: '13:30 – 16:30', coach: 'HLV Long' },
                { time: '16:00 – 18:00', coach: 'HLV Sơn' }
            ]
        },
        {
            day: 'Chủ Nhật',
            shortDay: 'CN',
            slots: [
                { time: '08:00 – 10:30', coach: 'HLV Huy' },
                { time: '09:00 – 11:00', coach: 'HLV Sơn' },
                { time: '14:00 – 15:00', coach: 'HLV Long' },
                { time: '16:00 – 18:00', coach: 'HLV Sơn' }
            ]
        }
    ];

    // Get all unique coaches
    const allCoaches = ['all', ...new Set(coachSchedule.flatMap(d => d.slots.map(s => s.coach)))];

    // Filter slots by selected coach
    const getFilteredSlots = (slots: TimeSlot[]) => {
        if (selectedCoach === 'all') return slots;
        return slots.filter(slot => slot.coach === selectedCoach);
    };

    // Get selected day data
    const selectedDay = coachSchedule[selectedDayIndex];
    const filteredSlots = getFilteredSlots(selectedDay.slots);

    // Handle day selection - scroll to top
    const handleDaySelect = (index: number) => {
        setSelectedDayIndex(index);
        // Scroll content to top smoothly
        if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // Also scroll the section into view
        document.getElementById('schedule')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Scroll to today button
    const scrollToToday = () => {
        handleDaySelect(todayIndex);
    };

    // Handle swipe on mobile
    const handleSwipe = (direction: 'left' | 'right') => {
        if (direction === 'left' && selectedDayIndex < coachSchedule.length - 1) {
            handleDaySelect(selectedDayIndex + 1);
        } else if (direction === 'right' && selectedDayIndex > 0) {
            handleDaySelect(selectedDayIndex - 1);
        }
    };

    // Touch handling for swipe
    const touchStartX = useRef(0);
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX;
        if (Math.abs(diff) > 50) {
            handleSwipe(diff > 0 ? 'left' : 'right');
        }
    };

    return (
        <section id="schedule" className="schedule-section">
            {/* Header */}
            <div className="schedule-header">
                <div className="schedule-header-content">
                    <div className="schedule-title-group">
                        <span className="schedule-subtitle">
                            <i className="fas fa-calendar-alt"></i>
                            LỊCH TẬP
                        </span>
                        <h2 className="schedule-title">LỊCH DẠY CỦA HLV</h2>
                    </div>
                    <button className="btn-today" onClick={scrollToToday}>
                        <i className="fas fa-calendar-day"></i>
                        HÔM NAY
                    </button>
                </div>
            </div>

            {/* Day Selector Pills */}
            <div className="day-selector-wrapper">
                <div className="day-selector">
                    {coachSchedule.map((day, index) => (
                        <button
                            key={index}
                            className={`day-pill ${selectedDayIndex === index ? 'active' : ''} ${index === todayIndex ? 'is-today' : ''}`}
                            onClick={() => handleDaySelect(index)}
                        >
                            <span className="day-pill-short">{day.shortDay}</span>
                            <span className="day-pill-slots">{getFilteredSlots(day.slots).length} lớp</span>
                            {index === todayIndex && <span className="today-dot"></span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Coach Filter */}
            <div className="coach-filter">
                <span className="filter-label">
                    <i className="fas fa-filter"></i>
                    Lọc theo HLV:
                </span>
                <div className="filter-buttons">
                    {allCoaches.map((coach) => (
                        <button
                            key={coach}
                            className={`filter-btn ${selectedCoach === coach ? 'active' : ''}`}
                            onClick={() => setSelectedCoach(coach)}
                        >
                            {coach === 'all' ? 'Tất cả' : coach.replace('HLV ', '')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Schedule Content - SINGLE DAY VIEW ONLY */}
            <div className="schedule-content" ref={contentRef}>
                <div
                    className="single-day-view"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Day Card - Shows ONLY the selected day */}
                    <div className={`day-card-single ${selectedDayIndex === todayIndex ? 'is-today' : ''}`}>
                        {/* Day Header with Navigation */}
                        <div className="day-card-header-single">
                            <button
                                className="nav-btn"
                                onClick={() => handleSwipe('right')}
                                disabled={selectedDayIndex === 0}
                                aria-label="Ngày trước"
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>

                            <div className="day-header-info">
                                <h3 className="day-title">{selectedDay.day}</h3>
                                <span className="day-slot-count">
                                    {filteredSlots.length} lớp học
                                    {selectedDayIndex === todayIndex && (
                                        <span className="today-tag">Hôm nay</span>
                                    )}
                                </span>
                            </div>

                            <button
                                className="nav-btn"
                                onClick={() => handleSwipe('left')}
                                disabled={selectedDayIndex === coachSchedule.length - 1}
                                aria-label="Ngày sau"
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>

                        {/* Time Slots List */}
                        <div className="day-card-slots">
                            {filteredSlots.length > 0 ? (
                                filteredSlots.map((slot, slotIndex) => (
                                    <div key={slotIndex} className="slot-item">
                                        <div className="slot-indicator"></div>
                                        <div className="slot-main">
                                            <div className="slot-time-row">
                                                <i className="fas fa-clock"></i>
                                                <span className="slot-time-text">{slot.time}</span>
                                            </div>
                                            <div className="slot-detail-row">
                                                <span className="slot-coach-name">
                                                    <i className="fas fa-user"></i>
                                                    {slot.coach}
                                                </span>
                                                <span className="slot-status-badge">
                                                    <span className="status-dot-green"></span>
                                                    Có lớp
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-slots-message">
                                    <i className="fas fa-calendar-times"></i>
                                    <p>Không có lớp trong ngày này</p>
                                    <span>
                                        {selectedCoach !== 'all'
                                            ? `HLV ${selectedCoach.replace('HLV ', '')} không có lịch dạy. Thử chọn "Tất cả" hoặc ngày khác.`
                                            : 'Vui lòng chọn ngày khác hoặc liên hệ CLB.'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Swipe Hint - Mobile */}
                        <div className="swipe-hint-bar">
                            <i className="fas fa-hand-point-left"></i>
                            <span>Vuốt hoặc nhấn mũi tên để xem ngày khác</span>
                            <i className="fas fa-hand-point-right"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Notes */}
            <div className="schedule-notes">
                <div className="note-card">
                    <div className="note-icon">
                        <i className="fas fa-info-circle"></i>
                    </div>
                    <div className="note-content">
                        <strong>Lịch dạy cố định hàng tuần</strong>
                        <p>Liên hệ CLB để đăng ký học với HLV</p>
                    </div>
                </div>
                <div className="note-card">
                    <div className="note-icon phone">
                        <i className="fas fa-phone-alt"></i>
                    </div>
                    <div className="note-content">
                        <strong>Hotline: 0913 909 012</strong>
                        <p>Sắp xếp lịch học riêng ngoài giờ trên</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Schedule;
