import React, { useState } from 'react';

const galleryItems = [
    { id: 1, src: '/images/gallery-1.jpg', category: 'tournament', title: 'Sân thi đấu CLB' },
    { id: 2, src: '/images/gallery-2.jpg', category: 'tournament', title: 'Giải đấu TP.HCM' },
    { id: 3, src: '/images/gallery-3.jpg', category: 'friendly', title: 'Khán giả cổ vũ' },
    { id: 4, src: '/images/gallery-4.jpg', category: 'training', title: 'Không gian tập luyện' },
    { id: 5, src: '/images/gallery-5.jpg', category: 'tournament', title: 'Trận đấu hấp dẫn' },
    { id: 6, src: '/images/gallery-6.png', category: 'tournament', title: 'Bảng điểm Double Fish' },
    { id: 7, src: '/images/gallery-7.png', category: 'training', title: 'Sân tập rộng rãi' },
    { id: 8, src: '/images/gallery-8.png', category: 'tournament', title: 'Lễ khai mạc giải' },
    { id: 9, src: '/images/gallery-9.jpg', category: 'awards', title: 'Trao giải đồng đội' },
    { id: 10, src: '/images/gallery-10.jpg', category: 'friendly', title: 'Ảnh tập thể CLB' },
    { id: 11, src: '/images/gallery-11.jpg', category: 'tournament', title: 'Phát biểu khai mạc' },
    { id: 12, src: '/images/gallery-12.jpg', category: 'training', title: 'Các VĐV xếp hàng' },
    { id: 13, src: '/images/gallery-13.jpg', category: 'awards', title: 'Trao giải Quỹ Xã Hội' },
    { id: 14, src: '/images/gallery-14.jpg', category: 'awards', title: 'Quyên góp từ thiện' },
    { id: 15, src: '/images/gallery-15.jpg', category: 'tournament', title: 'Trận đấu đôi' },
    { id: 16, src: '/images/gallery-16.jpg', category: 'tournament', title: 'Không khí thi đấu' },
    { id: 17, src: '/images/gallery-17.jpg', category: 'awards', title: 'Lễ trao giải' }
];

const categories = [
    { id: 'all', label: 'Tất Cả' },
    { id: 'training', label: 'Tập Luyện' },
    { id: 'tournament', label: 'Giải Đấu' },
    { id: 'friendly', label: 'Giao Hữu' },
    { id: 'awards', label: 'Giải Thưởng' }
];

const Gallery: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const filteredItems = activeCategory === 'all'
        ? galleryItems
        : galleryItems.filter(item => item.category === activeCategory);

    const openLightbox = (index: number) => {
        setCurrentImage(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = '';
    };

    const nextImage = () => {
        setCurrentImage((prev) => (prev + 1) % filteredItems.length);
    };

    const prevImage = () => {
        setCurrentImage((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    };

    // Touch handlers for swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStart - touchEnd > 75) {
            nextImage();
        }
        if (touchEnd - touchStart > 75) {
            prevImage();
        }
    };

    // Keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!lightboxOpen) return;
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, filteredItems.length]);

    return (
        <section id="gallery" className="section gallery">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">Thư Viện Ảnh</span>
                    <h2 className="section-title">
                        Hình Ảnh <span>Hoạt Động</span>
                    </h2>
                    <p className="section-description">
                        Những khoảnh khắc đáng nhớ của CLB Bóng Bàn Lê Quý Đôn
                    </p>
                </div>

                <div className="gallery-filters">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`gallery-filter ${activeCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="gallery-grid">
                    {filteredItems.map((item, index) => (
                        <div
                            key={item.id}
                            className="gallery-item fade-in"
                            onClick={() => openLightbox(index)}
                        >
                            <img src={item.src} alt={item.title} />
                            <div className="gallery-overlay">
                                <i className="fas fa-search-plus"></i>
                                <span>{item.title}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            <div className={`lightbox ${lightboxOpen ? 'active' : ''}`} onClick={closeLightbox}>
                <div
                    className="lightbox-content"
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <button className="lightbox-close" onClick={closeLightbox}>
                        <i className="fas fa-times"></i>
                    </button>
                    <button className="lightbox-nav lightbox-prev" onClick={prevImage}>
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    {filteredItems[currentImage] && (
                        <img src={filteredItems[currentImage].src} alt={filteredItems[currentImage].title} />
                    )}
                    <button className="lightbox-nav lightbox-next" onClick={nextImage}>
                        <i className="fas fa-chevron-right"></i>
                    </button>
                    <div className="lightbox-counter">
                        {currentImage + 1} / {filteredItems.length}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Gallery;
