import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section className="cta">
      <div className="cta-glow" />
      <div className="cta-content">
        <div className="section-tag">Start Today</div>
        <h2 className="cta-title arabic">Start Your Free Trial Class</h2>
        <p className="cta-sub">
          Join 24+ active students learning Quran from anywhere in the world.<br />
          First class is completely free — no commitment required.
        </p>
        <div className="cta-btns">
          <Link to="/contact" className="cta-btn-primary">Book Free Trial</Link>
          <Link to="/about"   className="cta-btn-ghost">Learn More</Link>
        </div>
      </div>
    </section>
  );
}
