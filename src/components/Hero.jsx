import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroCanvas from './HeroCanvas';

const coursePills = [
  'Noorani Qaida',
  'Nazira Quran',
  'Hifz ul Quran',
  'Tajweed ul Quran',
  'Islamic Studies',
];

const contentDelay = 0.15;
const step = 0.1;

const fadeUp = (delay) => ({
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] } },
});

const fadeIn = (delay) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, delay } },
});

const cardVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.6, delay: contentDelay + step * 5, ease: [0.16, 1, 0.3, 1] },
  },
};

const pillContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: contentDelay + step * 6 },
  },
};

const pillVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Hero() {
  return (
    <section className="hero">
      <HeroCanvas />
      <div className="hero-fade-overlay" />

      <div className="hero-glow hero-glow--tr" />
      <div className="hero-glow hero-glow--bl" />

      <div className="hero-left">
        <motion.div className="hero-tag" initial="hidden" animate="visible" variants={fadeUp(contentDelay)}>
          Certified Quran Teaching
        </motion.div>

        <motion.p
          className="hero-arabic arabic"
          initial="hidden"
          animate="visible"
          variants={fadeIn(contentDelay + step)}
        >
          تعلّم القرآن الكريم
        </motion.p>

        <motion.h1 className="hero-title" initial="hidden" animate="visible" variants={fadeUp(contentDelay + step * 2)}>
          Learn Quran with<br />
          <span className="hero-title--accent">Expert Teachers</span><br />
          from Home
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial="hidden"
          animate="visible"
          variants={fadeUp(contentDelay + step * 3)}
        >
          Learn Quran online with <strong>Hafiz Safeer Khan</strong> &amp;{' '}
          <strong>Shahana Safir</strong> — experienced, certified teachers with
          over 15 combined years of online &amp; physical teaching.
        </motion.p>

        <motion.div
          className="hero-btns"
          initial="hidden"
          animate="visible"
          variants={fadeUp(contentDelay + step * 4)}
        >
          <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link to="/contact" className="btn-primary">Register Free Trial</Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link to="/courses" className="btn-secondary">View Courses</Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.div className="hero-right" initial="hidden" animate="visible" variants={cardVariants}>
        <div className="hero-card">
          <div className="hero-card-title">Our Courses</div>
          <motion.div initial="hidden" animate="visible" variants={pillContainerVariants}>
            {coursePills.map((c) => (
              <motion.div className="course-pill" key={c} variants={pillVariants}>
                <div className="course-dot" />
                <span>{c}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
