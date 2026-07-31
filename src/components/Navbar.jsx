// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import FeesModal from './FeesModal';
import logo from '../assets/logo.png';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [feesOpen, setFeesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect with smooth transition
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      // Trigger after scrolling 50px (adjust as needed)
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">

          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <img src={logo} alt="Safeer Quran Academy" className="logo-img" />
          </Link>

          {/* Desktop nav */}
          <nav className="navbar-links">
            <NavLink to="/" className="nav-link" end>Home</NavLink>
            <NavLink to="/about" className="nav-link">About</NavLink>
            <NavLink to="/courses" className="nav-link">Courses</NavLink>
            <NavLink to="/contact" className="nav-link">Contact</NavLink>

            <button className="fees-btn" onClick={() => setFeesOpen(true)}>
              Fee Structure
            </button>

            <Link to="/contact" className="navbar-cta">Free Trial</Link>
            <Link to="/portal" className="portal-btn">Student Portal</Link>
            <Link to="/faculty-login" className="faculty-portal-btn">Faculty Portal</Link>
          </nav>

          {/* Mobile */}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="mobile-menu">
            <NavLink to="/" onClick={closeMenu}>Home</NavLink>
            <NavLink to="/about" onClick={closeMenu}>About</NavLink>
            <NavLink to="/courses" onClick={closeMenu}>Courses</NavLink>
            <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>

            <button onClick={() => { setFeesOpen(true); closeMenu(); }}>
              Fee Structure
            </button>

            <Link to="/contact" onClick={closeMenu}>Free Trial</Link>
            <Link to="/portal" onClick={closeMenu} className="portal-btn-mobile">
              Student Portal
            </Link>
            <Link to="/faculty-login" onClick={closeMenu} className="mobile-faculty-btn">
              Faculty Portal
            </Link>
          </div>
        )}
      </header>

      {/* Fees Modal */}
      {feesOpen && <FeesModal onClose={() => setFeesOpen(false)} />}
    </>
  );
}