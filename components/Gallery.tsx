import React, { useState } from 'react';

const galleryItems = [
    { id: 1, src: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=600&q=80', category: 'training', title: 'Buổi tập luyện' },
    { id: 2, src: 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=600&q=80', category: 'tournament', title: 'Giải đấu nội bộ' },
    { id: 3, src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', category: 'training', title: 'Kỹ thuật giao bóng' },
    { id: 4, src: 'https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?w=600&q=80', category: 'friendly', title: 'Giao hữu CLB' },
    { id: 5, src: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=600&q=80', category: 'awards', title: 'Trao giải thưởng' },
    { id: 6, src: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80', category: 'training', title: 'Tập đánh đôi' },
    { id: 7, src: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&q=80', category: 'tournament', title: 'Chung kết 2024' },
    { id: 8, src: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80', category: 'friendly', title: 'Team building' },
    { id: 9, src: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80', category: 'training', title: 'Lớp cơ bản' },
    { id: 10, src: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80', category: 'tournament', title: 'Bảng đấu' },
    { id: 11, src: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80', category: 'friendly', title: 'Picnic thường niên' },
    { id: 12, src: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80', category: 'awards', title: 'Vinh danh VĐV' }
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
                <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
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
                </div>
            </div>
        </section>
    );
};

export default Gallery;
