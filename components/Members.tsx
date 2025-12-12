import React from 'react';

const members = [
    {
        name: 'Nguyễn Hoàng Long',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
        level: 'pro',
        levelLabel: 'Pro Player',
        paddle: 'Butterfly Timo Boll ALC',
        joinYear: 2020
    },
    {
        name: 'Trần Minh Tú',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
        level: 'intermediate',
        levelLabel: 'Intermediate',
        paddle: 'DHS Hurricane 3',
        joinYear: 2021
    },
    {
        name: 'Lê Văn Đức',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
        level: 'pro',
        levelLabel: 'Pro Player',
        paddle: 'Stiga Carbonado 245',
        joinYear: 2019
    },
    {
        name: 'Phạm Thu Hà',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
        level: 'intermediate',
        levelLabel: 'Intermediate',
        paddle: 'Yasaka Ma Lin Carbon',
        joinYear: 2022
    },
    {
        name: 'Võ Minh Khôi',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
        level: 'beginner',
        levelLabel: 'Beginner',
        paddle: 'Palio Expert 2',
        joinYear: 2024
    },
    {
        name: 'Đặng Thùy Linh',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
        level: 'intermediate',
        levelLabel: 'Intermediate',
        paddle: 'Xiom Vega Pro',
        joinYear: 2023
    },
    {
        name: 'Hoàng Anh Tuấn',
        avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&q=80',
        level: 'beginner',
        levelLabel: 'Beginner',
        paddle: 'Joola Carbon Pro',
        joinYear: 2024
    },
    {
        name: 'Ngô Thanh Mai',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80',
        level: 'pro',
        levelLabel: 'Pro Player',
        paddle: 'Tibhar Samsonov Force Pro',
        joinYear: 2020
    }
];

const Members: React.FC = () => {
    return (
        <section id="members" className="section members">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">Our Community</span>
                    <h2 className="section-title">
                        Thành Viên <span>CLB</span>
                    </h2>
                    <p className="section-description">
                        Gặp gỡ những thành viên tuyệt vời của đại gia đình bóng bàn LQD
                    </p>
                </div>

                <div className="members-grid">
                    {members.map((member, index) => (
                        <div key={index} className={`member-card fade-in stagger-${(index % 6) + 1}`}>
                            <img src={member.avatar} alt={member.name} className="member-avatar" />
                            <h3 className="member-name">{member.name}</h3>
                            <span className={`member-level ${member.level}`}>{member.levelLabel}</span>
                            <div className="member-details">
                                <p><i className="fas fa-table-tennis-paddle-ball"></i>{member.paddle}</p>
                                <p><i className="fas fa-calendar"></i>Thành viên từ {member.joinYear}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="join-member-section fade-in">
                    <h3>Trở Thành Thành Viên Ngay Hôm Nay!</h3>
                    <p>Chỉ cần 3 bước đơn giản để gia nhập đại gia đình bóng bàn LQD</p>

                    <div className="join-steps">
                        <div className="join-step">
                            <div className="join-step-number">1</div>
                            <span>Điền Form Đăng Ký</span>
                        </div>
                        <div className="join-step">
                            <div className="join-step-number">2</div>
                            <span>Tham Gia Buổi Test</span>
                        </div>
                        <div className="join-step">
                            <div className="join-step-number">3</div>
                            <span>Bắt Đầu Tập Luyện</span>
                        </div>
                    </div>

                    <button
                        className="btn btn-outline btn-large"
                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <i className="fas fa-user-plus"></i>
                        Đăng Ký Thành Viên
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Members;
