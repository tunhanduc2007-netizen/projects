import React from 'react';

const scheduleData = [
    { time: '17:00 - 18:30', mon: 'Beginner', tue: '', wed: 'Beginner', thu: '', fri: 'Beginner', sat: '', sun: '' },
    { time: '18:30 - 20:00', mon: 'Intermediate', tue: 'Intermediate', wed: 'Intermediate', thu: 'Intermediate', fri: 'Intermediate', sat: 'Free Play', sun: '' },
    { time: '20:00 - 21:30', mon: 'Advanced', tue: '', wed: 'Advanced', thu: '', fri: 'Advanced', sat: 'Tournament', sun: '' },
    { time: '08:00 - 10:00', mon: '', tue: '', wed: '', thu: '', fri: '', sat: 'Beginner', sun: 'Free Play' },
    { time: '10:00 - 12:00', mon: '', tue: '', wed: '', thu: '', fri: '', sat: 'Intermediate', sun: 'Free Play' },
    { time: '14:00 - 16:00', mon: '', tue: '', wed: '', thu: '', fri: '', sat: 'Advanced', sun: 'Tournament' },
];

const getClassStyle = (classType: string) => {
    if (!classType) return '';
    if (classType.toLowerCase().includes('beginner') || classType.toLowerCase().includes('free')) {
        return 'beginner';
    }
    if (classType.toLowerCase().includes('intermediate')) {
        return 'intermediate';
    }
    if (classType.toLowerCase().includes('advanced') || classType.toLowerCase().includes('tournament')) {
        return 'advanced';
    }
    return '';
};

const Schedule: React.FC = () => {
    return (
        <section id="schedule" className="section schedule">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">Training Schedule</span>
                    <h2 className="section-title">
                        Lịch <span>Tập Luyện</span>
                    </h2>
                    <p className="section-description">
                        Lịch tập hàng tuần được thiết kế linh hoạt, phù hợp với mọi đối tượng
                    </p>
                </div>

                <div className="schedule-table-container fade-in">
                    <table className="schedule-table">
                        <thead>
                            <tr>
                                <th>Thời Gian</th>
                                <th>Thứ 2</th>
                                <th>Thứ 3</th>
                                <th>Thứ 4</th>
                                <th>Thứ 5</th>
                                <th>Thứ 6</th>
                                <th>Thứ 7</th>
                                <th>CN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scheduleData.map((row, index) => (
                                <tr key={index}>
                                    <td><strong>{row.time}</strong></td>
                                    <td>{row.mon && <span className={`schedule-class ${getClassStyle(row.mon)}`}>{row.mon}</span>}</td>
                                    <td>{row.tue && <span className={`schedule-class ${getClassStyle(row.tue)}`}>{row.tue}</span>}</td>
                                    <td>{row.wed && <span className={`schedule-class ${getClassStyle(row.wed)}`}>{row.wed}</span>}</td>
                                    <td>{row.thu && <span className={`schedule-class ${getClassStyle(row.thu)}`}>{row.thu}</span>}</td>
                                    <td>{row.fri && <span className={`schedule-class ${getClassStyle(row.fri)}`}>{row.fri}</span>}</td>
                                    <td>{row.sat && <span className={`schedule-class ${getClassStyle(row.sat)}`}>{row.sat}</span>}</td>
                                    <td>{row.sun && <span className={`schedule-class ${getClassStyle(row.sun)}`}>{row.sun}</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="schedule-buttons">
                    <button
                        className="btn btn-primary"
                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <i className="fas fa-calendar-plus"></i>
                        Đăng Ký Tập Luyện
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <i className="fas fa-table-tennis-paddle-ball"></i>
                        Đặt Bàn
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Schedule;
