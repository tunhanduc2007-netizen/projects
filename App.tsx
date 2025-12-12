import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhyJoinUs from './components/WhyJoinUs';
import About from './components/About';
import Programs from './components/Programs';
import Schedule from './components/Schedule';
import Gallery from './components/Gallery';
import Tournaments from './components/Tournaments';
import Contact from './components/Contact';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    // Scroll animation observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Update active section for navigation
            const sectionId = entry.target.getAttribute('id');
            if (sectionId) {
              setActiveSection(sectionId);
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

    return () => observer.disconnect();
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
        <Gallery />
        <Tournaments />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default App;
