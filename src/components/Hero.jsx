import { Link } from 'react-router-dom';

const coursePills = [
  'Noorani Qaida',
  'Nazira Quran',
  'Hifz ul Quran',
  'Tajweed ul Quran',
  'Islamic Studies',
];

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-glow hero-glow--tr" />
      <div className="hero-glow hero-glow--bl" />

      <div className="hero-left">
        <div className="hero-tag">Certified Quran Teaching</div>
        <p className="hero-arabic arabic">تعلّم القرآن الكريم</p>
        <h1 className="hero-title">
          Learn Quran with<br />
          <span className="hero-title--accent">Expert Teachers</span><br />
          from Home
        </h1>
        <p className="hero-subtitle">
          Learn Quran online with <strong>Hafiz Safeer Khan</strong> &amp;{' '}
          <strong>Shahana Safir</strong> — experienced, certified teachers with
          over 15 combined years of online &amp; physical teaching.
        </p>
        <div className="hero-btns">
          <Link to="/contact" className="btn-primary">Register Free Trial</Link>
          <Link to="/courses" className="btn-secondary">View Courses</Link>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-card">
          <div className="hero-card-title">Our Courses</div>
          {coursePills.map(c => (
            <div className="course-pill" key={c}>
              <div className="course-dot" />
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
