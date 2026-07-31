// src/pages/Courses.jsx
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import courses from '../data/coursesData';

export default function Courses() {
  const trackRef = useRef(null);
  const scroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  return (
    <section className="courses-v2">
      <div className="courses-v2-header">
        <h2>Explore Featured <span className="accent-text">Courses</span></h2>
        <div className="courses-v2-nav">
          <button onClick={() => scroll(-1)}>←</button>
          <button onClick={() => scroll(1)} className="filled">→</button>
        </div>
      </div>

      <div className="courses-v2-track" ref={trackRef}>
        {courses.map((c) => (
          <div className="course-card-v2" key={c.id}>
            <img src={c.image || '/quran-stand.png'} alt={c.title} />
            <h3>{c.title}</h3>
            <div className="course-v2-price">${c.price ?? '99'}.00</div>
            <div className="course-v2-meta">
              <span>⏱ {c.sessions ? `${c.sessions} sessions` : 'Live Classes'}</span>
              <span>📶 {c.age ?? 'Beginner'}</span>
            </div>
            <div className="course-v2-btns">
              <Link to={`/courses/${c.id}`} className="btn-primary sm">Register Now</Link>
              <Link to={`/courses/${c.id}`} className="btn-secondary-outline sm">See Details</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}