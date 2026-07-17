
const stats = [
  { num: '24+',  label: 'Active Students' },
  { num: '50+',  label: 'Hifz Completed' },
  { num: '10+',  label: 'Years Experience' },
  { num: '100%', label: 'Online Classes' },
];

export default function Stats() {
  return (
    <div className="stats">
      {stats.map(s => (
        <div className="stat" key={s.label}>
          <div className="stat-num arabic">{s.num}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
