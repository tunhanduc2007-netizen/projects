import React from 'react';

const tournaments = [
    {
        icon: 'fas fa-trophy',
        title: 'Giải Vô Địch LQD Thường Niên',
        description: 'Giải đấu lớn nhất trong năm, quy tụ tất cả thành viên CLB thi đấu tranh ngôi vô địch. Giải thưởng hấp dẫn và cơ hội khẳng định bản thân.',
        date: 'Tháng 6 hàng năm',
        participants: '50+ VĐV'
    },
    {
        icon: 'fas fa-ranking-star',
        title: 'Giải Xếp Hạng Hàng Tháng',
        description: 'Hệ thống xếp hạng liên tục được cập nhật qua các giải đấu nhỏ hàng tháng. Cơ hội thăng hạng và cải thiện thứ hạng của bạn.',
        date: 'Cuối mỗi tháng',
        participants: '30+ VĐV'
    },
    {
        icon: 'fas fa-handshake',
        title: 'Giao Hữu Liên CLB',
        description: 'Các trận giao hữu với CLB bạn, mở rộng mối quan hệ và học hỏi phong cách chơi đa dạng từ các đối thủ mới.',
        date: 'Hàng quý',
        participants: '20+ VĐV'
    },
    {
        icon: 'fas fa-users',
        title: 'Giải Đôi Mở Rộng',
        description: 'Thi đấu theo cặp đôi, rèn luyện kỹ năng phối hợp và tinh thần đồng đội. Dành cho mọi trình độ.',
        date: 'Tháng 9',
        participants: '32 cặp đôi'
    }
];

const Tournaments: React.FC = () => {
    return (
        <section id="tournaments" className="section tournaments">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">Cuộc Thi</span>
                    <h2 className="section-title">
                        Các <span>Giải Đấu</span>
                    </h2>
                    <p className="section-description">
                        Cơ hội thi đấu và thể hiện bản thân qua các giải đấu hấp dẫn
                    </p>
                </div>

                <div className="tournaments-grid">
                    {tournaments.map((tournament, index) => (
                        <div key={index} className={`tournament-card fade-in stagger-${index + 1}`}>
                            <div className="tournament-icon">
                                <i className={tournament.icon}></i>
                            </div>
                            <h3 className="tournament-title">{tournament.title}</h3>
                            <p className="tournament-description">{tournament.description}</p>
                            <div className="tournament-meta">
                                <div className="tournament-meta-item">
                                    <i className="fas fa-calendar"></i>
                                    <span>{tournament.date}</span>
                                </div>
                                <div className="tournament-meta-item">
                                    <i className="fas fa-users"></i>
                                    <span>{tournament.participants}</span>
                                </div>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Đăng Ký Tham Gia
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Tournaments;
