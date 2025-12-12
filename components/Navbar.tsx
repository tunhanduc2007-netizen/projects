import React, { useState, useEffect } from 'react';

interface NavbarProps {
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [clickedSection, setClickedSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      // Reset clicked section after scrolling
      if (clickedSection) {
        setTimeout(() => setClickedSection(null), 1000);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [clickedSection]);

  const navLinks = [
    { id: 'home', label: 'Trang Chủ' },
    { id: 'about', label: 'Giới Thiệu' },
    { id: 'programs', label: 'Bảng Giá' },
    { id: 'shop', label: 'Cửa Hàng' },
    { id: 'support', label: 'Hỗ Trợ' },
    { id: 'gallery', label: 'Hình Ảnh' },
    { id: 'contact', label: 'Liên Hệ' },
  ];

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      setClickedSection(sectionId);
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  // Use clicked section if available, otherwise use active section from scroll
  const currentActive = clickedSection || activeSection;

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <a href="#home" className="navbar-brand" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>
            <img src="/images/logo.png" alt="CLB Bóng Bàn LQD" className="navbar-logo" />
            <span className="navbar-title">BÓNG BÀN LQD</span>
          </a>

          <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            {navLinks.slice(0, -1).map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`navbar-link ${currentActive === link.id ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.id); }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              className="navbar-link navbar-cta"
              onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
            >
              Liên Hệ
            </a>
          </div>

          <button
            className={`navbar-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>
    </>
  );
};

export default Navbar;
