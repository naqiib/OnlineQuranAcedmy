// src/components/Features.jsx
const features = [
  { icon: '📚', title: 'Online Learning Platform', desc: 'Following a structured course plan, your teacher will guide and help you learn faster & correctly.' },
  { icon: '📅', title: 'Flexible Schedule', desc: 'Schedule your Arabic and Quran classes when it works for you! We have teachers available 24/7.' },
  { icon: '🎓', title: 'Live Teachers', desc: 'Following a structured course plan, your teacher will guide and help you learn faster & correctly.' },
  { icon: '🎮', title: 'Games & Activities', desc: 'Our online Activity Center has games, download, worksheets and with learning material specific.' },
];

export default function Features() {
  return (
    <section className="features-v2-wrap">
      <div className="features-v2-header">
        <h2>Creating student <span className="accent-text">success</span><br />with our Al Quran</h2>
        <p>We understand that everyone's schedule is different. That's why we offer flexible learning options</p>
      </div>

      <div className="features-v2-box">
        {features.map((f) => (
          <div className="feature-v2-item" key={f.title}>
            <div className="feature-v2-icon">{f.icon}</div>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}