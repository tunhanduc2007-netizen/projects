import React, { useState, useEffect } from 'react';

interface NavbarProps {
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'programs', label: 'Programs' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' },
  ];

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <a href="#home" className="navbar-brand" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>
            <img src="/images/logo.png" alt="LQD Table Tennis Club" className="navbar-logo" />
            <span className="navbar-title">TABLE TENNIS LQD</span>
          </a>

          <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`navbar-link ${activeSection === link.id ? 'active' : ''}`}
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
              Join Now
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
