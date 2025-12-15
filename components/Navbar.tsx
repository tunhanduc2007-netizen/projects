import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [clickedSection, setClickedSection] = useState<string | null>(null);
  const location = useLocation();

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
    { id: 'home', label: 'TRANG CHỦ', isSection: true },
    { id: 'about', label: 'GIỚI THIỆU', isSection: true },
    { id: 'programs', label: 'BẢNG GIÁ', isSection: true },
    { id: 'support', label: 'HỖ TRỢ', isSection: true },
    { id: 'gallery', label: 'HÌNH ẢNH', isSection: true },
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

  // Check if we're on shop page
  const isShopPage = location.pathname === '/shop';

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="navbar-brand" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/images/logo.png" alt="CLB Bóng Bàn LQD" className="navbar-logo" />
            <span className="navbar-title">BÓNG BÀN LQD</span>
          </Link>

          <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`navbar-link ${currentActive === link.id && !isShopPage ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (isShopPage) {
                    // If on shop page, navigate to home first
                    window.location.href = `/#${link.id}`;
                  } else {
                    scrollToSection(link.id);
                  }
                }}
              >
                {link.label}
              </a>
            ))}

            {/* Shop Link - Separate */}
            <Link
              to="/shop"
              className={`navbar-link navbar-shop-link ${isShopPage ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <i className="fas fa-store"></i>
              SHOP
            </Link>

            <a
              href="#contact"
              className="navbar-link navbar-cta"
              onClick={(e) => {
                e.preventDefault();
                if (isShopPage) {
                  window.location.href = '/#contact';
                } else {
                  scrollToSection('contact');
                }
              }}
            >
              LIÊN HỆ
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
