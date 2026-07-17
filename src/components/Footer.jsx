import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon arabic">ق</div>
            <div>
              <div className="footer-logo-name">Safeer Quran Academy</div>
              <div className="footer-logo-sub">Online Islamic Learning</div>
            </div>
          </div>
          <p className="footer-desc">
            Helping students worldwide learn the Quran with certified, 
            experienced teachers — from the comfort of home.
          </p>
        </div>

        <div className="footer-links-group">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-links-group">
          <h4>Courses</h4>
          <span>Noorani Qaida</span>
          <span>Nazira Quran</span>
          <span>Hifz ul Quran</span>
          <span>Tajweed ul Quran</span>
        </div>

        <div className="footer-links-group">
          <h4>Contact</h4>
          <span>info@safeerquran.com</span>
          <span>+92 XXX XXXXXXX</span>
          <span>Worldwide Online</span>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Safeer Quran Academy. All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/">Privacy</Link>
          <Link to="/">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
