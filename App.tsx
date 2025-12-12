import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhyJoinUs from './components/WhyJoinUs';
import About from './components/About';
import Programs from './components/Programs';
import Schedule from './components/Schedule';
import Support from './components/Support';
import Gallery from './components/Gallery';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check if user is at bottom of page (for footer/contact)
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // If near bottom of page (within 200px), set contact as active
      if (scrollTop + windowHeight >= documentHeight - 200) {
        setActiveSection('contact');
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Scroll animation observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Update active section for navigation (except when at bottom)
            const sectionId = entry.target.getAttribute('id');
            if (sectionId && sectionId !== 'contact') {
              // Check if not at bottom
              const scrollTop = window.scrollY;
              const windowHeight = window.innerHeight;
              const documentHeight = document.documentElement.scrollHeight;
              if (scrollTop + windowHeight < documentHeight - 200) {
                setActiveSection(sectionId);
              }
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    // Observe all animated elements
    document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in').forEach((el) => {
      observer.observe(el);
    });

    // Observe sections for navigation highlighting
    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    // Also observe footer
    const footer = document.getElementById('contact');
    if (footer) {
      observer.observe(footer);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  return (
    <>
      <Navbar activeSection={activeSection} />
      <main>
        <Hero />
        <WhyJoinUs />
        <About />
        <Programs />
        <Schedule />
        <Support />
        <Gallery />
      </main>
      <Footer />

      {/* Mobile Bottom Navigation - Chỉ hiển thị trên mobile */}
      {isMobile && (
        <>
          <nav className="mobile-bottom-nav">
            <a
              href="#home"
              className={activeSection === 'home' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}
            >
              <i className="fas fa-home"></i>
              <span>Trang chủ</span>
            </a>
            <a
              href="#programs"
              className={activeSection === 'programs' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); scrollToSection('programs'); }}
            >
              <i className="fas fa-tags"></i>
              <span>Bảng giá</span>
            </a>
            <a
              href="#about"
              className={activeSection === 'about' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
            >
              <i className="fas fa-info-circle"></i>
              <span>Giới thiệu</span>
            </a>
            <a
              href="#gallery"
              className={activeSection === 'gallery' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); scrollToSection('gallery'); }}
            >
              <i className="fas fa-images"></i>
              <span>Hình ảnh</span>
            </a>
            <a
              href="#contact"
              className={activeSection === 'contact' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
            >
              <i className="fas fa-phone-alt"></i>
              <span>Liên hệ</span>
            </a>
          </nav>

          {/* FAB Call Button */}
          <a href="tel:0977991490" className="mobile-fab" aria-label="Gọi ngay">
            <i className="fas fa-phone-alt"></i>
          </a>
        </>
      )}
    </>
  );
};

export default App;

