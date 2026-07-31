import { motion } from 'framer-motion';

const stats = [
  { num: '24+',  label: 'Active Students' },
  { num: '50+',  label: 'Hifz Completed' },
  { num: '10+',  label: 'Years Experience' },
  { num: '100%', label: 'Online Classes' },
];

export default function Stats() {
  return (
    <div className="stats-float-wrap">
      <motion.div
        className="stats stats-floating"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        {stats.map((s, i) => (
          <motion.div
            className="stat"
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="stat-num arabic">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
