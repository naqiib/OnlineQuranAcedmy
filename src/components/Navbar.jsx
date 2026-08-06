// src/components/Navbar.jsx
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import FeesModal from './FeesModal';
import logo from '../assets/logo.png';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [feesOpen, setFeesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'student' | 'faculty' | null

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

  // Listen for auth state to show profile buttons
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setUserRole(null);
      if (user) {
        try {
          const stu = await getDoc(doc(db, 'students', user.uid));
          if (stu.exists()) { setUserRole('student'); return; }
          const fac = await getDoc(doc(db, 'faculty', user.uid));
          if (fac.exists()) { setUserRole('faculty'); return; }
        } catch (e) {
          console.error('Role detection error', e);
        }
      }
    });
    return () => unsub();
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
            {/* If logged in, show profile quick links; otherwise show portal/login links */}
            {currentUser && userRole === 'student' ? (
              <Link to="/dashboard" className="portal-btn">My Profile</Link>
            ) : (
              <Link to="/portal" className="portal-btn">Student Portal</Link>
            )}

            {currentUser && userRole === 'faculty' ? (
              <Link to="/faculty-dashboard" className="faculty-portal-btn">Faculty Panel</Link>
            ) : (
              <Link to="/faculty-login" className="faculty-portal-btn">Faculty Portal</Link>
            )}
          </nav>

          {/* Small profile icons visible on mobile when navbar-links are hidden */}
          <div className="nav-profile">
            {currentUser && userRole === 'student' && (
              <Link to="/dashboard" className="nav-avatar">Profile</Link>
            )}
            {currentUser && userRole === 'faculty' && (
              <Link to="/faculty-dashboard" className="nav-avatar">Faculty</Link>
            )}
          
            {!currentUser && (
              <>
                <Link to="/portal" className="nav-avatar">Student</Link>
                <Link to="/faculty-login" className="nav-avatar">Faculty</Link>
              </>
            )}
          </div>

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