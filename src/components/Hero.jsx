// src/components/Hero.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

const quranImg = "https://plus.unsplash.com/premium_photo-1677587536653-0d02efbb70ee?fm=jpg&q=60&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0";

const featuredCourses = [
  { title: 'Reading Quran Basics', price: '$99.00', duration: 'Live Classes', level: 'Beginner' },
  { title: 'Quran & Tajweed', price: '$35.00', duration: 'Live Classes', level: 'Beginner' },
  { title: 'Quran Recitation', price: '$70.00', duration: 'Live Classes', level: 'Beginner' },
];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const course = featuredCourses[index];

  const next = () => setIndex((i) => (i + 1) % featuredCourses.length);
  const prev = () => setIndex((i) => (i - 1 + featuredCourses.length) % featuredCourses.length);

  return (
    <section className="hero-v2">
      <div className="hero-v2-glow" />

      <motion.div
        className="hero-v2-left"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="hero-v2-title">
          Recite the <span className="accent-text">Quran</span> in an
          orderly and clear manner
          <span className="hero-v2-verse"> (Surah Muzammil: Verse 4)</span>
        </h1>

        <p className="hero-v2-sub">
          Comprehensive Arabic, Quran, and Islamic studies courses suitable
          for all ages and skill levels online.
        </p>

        <div className="hero-v2-btns">
          <Link to="/courses" className="btn-primary">Find your course</Link>
          <Link to="/contact" className="btn-secondary-outline">Sign up for Free</Link>
        </div>
      </motion.div>

      <motion.div
        className="hero-v2-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <img src={quranImg} alt={course.title} className="hero-v2-card-img" />
        <div className="hero-v2-card-body">
          <h3>{course.title}</h3>
          <div className="hero-v2-price">{course.price}</div>
          <div className="hero-v2-meta">
            <span>⏱ {course.duration}</span>
            <span>📶 {course.level}</span>
          </div>
          <div className="hero-v2-card-btns">
            <Link to="/courses" className="btn-primary sm">Register Now</Link>
            <Link to="/courses" className="btn-secondary-outline sm">See Details</Link>
          </div>
        </div>

        <button className="hero-v2-arrow left" onClick={prev}>←</button>
        <button className="hero-v2-arrow right" onClick={next}>→</button>
      </motion.div>
    </section>
  );
}