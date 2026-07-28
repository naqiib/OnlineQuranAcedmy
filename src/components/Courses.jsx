// src/pages/Courses.jsx
import { Link } from 'react-router-dom';
import courses from '../data/coursesData';

const ACCENT = {
  blue: '#2bb573',
  green: '#059669',
  purple: '#7c3aed',
  amber: '#d97706',
  rose: '#e11d48',
  teal: '#0891b2',
};

export default function Courses() {
  return (
    <section className="courses-page">
      <div className="courses-container">

        {/* Header */}
        <div className="courses-header">
          <span className="section-tag">What We Offer</span>
          <h2 className="section-title">Our Courses</h2>
          <p className="section-sub">
            Click on any course to explore the full curriculum, watch sample lessons,
            and see the detailed learning path.
          </p>
        </div>

        {/* Grid */}
        <div className="courses-grid">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>

        {/* CTA */}
        <div className="courses-cta">
          <Link to="/contact" className="btn-primary">
            Enroll Now — Free Trial Class
          </Link>
        </div>
      </div>
    </section>
  );
}

function CourseCard({ course: c }) {
  const accent = ACCENT[c.color] || ACCENT.blue;

  return (
    <div className="course-card" style={{ '--accent': accent }}>
      <span className="course-card-glow" />
      <span className="course-card-glow course-card-glow--sm" />

      <div className="course-card-badge">{c.icon}</div>

      <span className="course-card-tag">{c.tag}</span>

      <h3 className="course-card-title">{c.title}</h3>
      <p className="course-card-desc">{c.desc}</p>

      <div className="course-card-footer">
        <div className="course-card-icons">
          <span className="course-card-icon-circle" title={`${c.sessions} sessions`}>⏱</span>
          <span className="course-card-icon-circle" title={c.age}></span>
          <span className="course-card-icon-circle" title={`${c.videos.length} video lessons`}></span>
        </div>

        <Link to={`/courses/${c.id}`} className="course-card-viewmore">
          View more
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </Link>
      </div>
    </div>
  );
}