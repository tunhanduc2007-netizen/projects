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

  useEffect(() => {
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
    };
  }, []);

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
    </>
  );
};

export default App;
