// src/pages/Courses.jsx
import { Link } from 'react-router-dom';
import courses from '../data/coursesData';

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
  return (
    <div className={`course-card card-${c.color}`}>
      <div className={`card-banner banner-${c.color}`} />

      <div className="card-body">
        <div className="card-top-row">
          <div className={`course-icon icon-${c.color}`}>{c.icon}</div>
          <div className="card-info">
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </div>
        </div>

        <div className="card-tags">
          <span className={`tag tag-${c.tagColor}`}>{c.tag}</span>
          <span className="tag tag-gray">{c.duration}</span>
        </div>

        <div className="card-stats">
          <div className="stat-pill">
            <span className="pill-icon">⏱</span>
            <strong>{c.sessions}</strong>
          </div>
          <div className="stat-pill">
            <span className="pill-icon"></span>
            <strong>{c.age}</strong>
          </div>
          <div className="stat-pill">
            <span className="pill-icon"></span>
            <strong>{c.videos.length} lessons</strong>
          </div>
        </div>

        <Link to={`/courses/${c.id}`} className="card-btn">
          View Full Course →
        </Link>
      </div>
    </div>
  );
}