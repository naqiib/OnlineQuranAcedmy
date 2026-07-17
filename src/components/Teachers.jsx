import { Link } from 'react-router-dom';

const teachers = [
  {
    initial: 'س',
    name: 'Safeer Khan',
    role: 'Lead Quran Teacher',
    badge: 'Hafiz-e-Quran',
    exp: '10+ Years',
    points: [
      'Specialist in Tajweed & Hifz',
      'Students from across the world',
    ],
  },
  {
    initial: 'ش',
    name: 'Shahana Safir',
    role: 'Female Quran Teacher',
    badge: 'Quran Educator',
    exp: '5+ Years',
    points: [
      'Specialist for female & kids',
      'Nazira & Tajweed expert',
    ],
  },
];

export default function Teachers() {
  return (
    <section className="teachers">
      <div className="section-header">
        <div className="section-tag">Meet Our Teachers</div>
        <h2 className="section-title arabic">Learn from the Best</h2>
      </div>

      <div className="teachers-grid">
        {teachers.map(t => (
          <div className="teacher-card" key={t.name}>

            {/* LEFT — Avatar */}
            <div className="teacher-left">
              <div className="teacher-avatar arabic">{t.initial}</div>
              <div className="exp-badge">{t.exp}</div>
            </div>

            {/* MIDDLE — Info */}
            <div className="teacher-middle">
              <div className="teacher-name-row">
                <h3>{t.name}</h3>
                <span className="teacher-badge">{t.badge}</span>
              </div>
              <p className="teacher-role">{t.role}</p>
              <div className="teacher-points">
                {t.points.map(p => (
                  <div className="teacher-point" key={p}>
                    <span className="point-dot" />
                    {p}
                  </div>
                ))}
              </div>
              <div className="stars">★★★★★</div>
            </div>

            {/* RIGHT — Button */}
            <div className="teacher-right">
              <Link to="/about" className="btn-more-detail">
                More Details →
              </Link>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}