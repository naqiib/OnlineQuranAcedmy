// src/components/Hero.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import quranImg from '../assets/quran.avif';
import courses from '../data/coursesData';

// Feature the first three courses and use their computed price ranges
const featuredCourses = [
  {
    id: courses[0].id,
    title: courses[0].title,
    price: courses[0].price,
    duration: courses[0].duration,
    level: courses[0].level,
    description: courses[0].desc,
  },
  {
    id: courses[1].id,
    title: courses[1].title,
    price: courses[1].price,
    duration: courses[1].duration,
    level: courses[1].level,
    description: courses[1].desc,
  },
  {
    id: courses[2].id,
    title: courses[2].title,
    price: courses[2].price,
    duration: courses[2].duration,
    level: courses[2].level,
    description: courses[2].desc,
  },
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredCourses.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredCourses.length) % featuredCourses.length);
  };

  const currentCourse = featuredCourses[currentIndex];

  return (
    <section className="hero-v2">
      <div className="hero-v2-left">
        <motion.h1 
          className="hero-v2-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Learn Quran Online with <span className="accent-text">Expert Teachers</span>
        </motion.h1>
        <motion.p 
          className="hero-v2-verse"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          "Read! In the name of your Lord who created"
        </motion.p>
        <motion.p 
          className="hero-v2-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Join thousands of students learning Quran, Arabic, and Islamic studies
          from the comfort of your home. Our qualified teachers provide personalized
          attention to help you achieve your learning goals.
        </motion.p>
        <motion.div 
          className="hero-v2-btns"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <a href="/courses" className="btn-primary">Start Learning</a>
          <a href="/contact" className="btn-secondary-outline">Free Trial</a>
        </motion.div>
      </div>

      <motion.div 
        className="hero-v2-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <button className="hero-v2-arrow left" onClick={prevSlide}>←</button>
        <button className="hero-v2-arrow right" onClick={nextSlide}>→</button>
        
        {/* Image with AVIF support and fallback */}
        <div className="hero-v2-card-img-wrapper">
          {!imageError ? (
            <picture>
              {/* AVIF is supported in modern browsers */}
              <source srcSet={quranImg} type="image/avif" />
              {/* Fallback to a placeholder if AVIF fails */}
              <img 
                src={quranImg} 
                alt="Quran" 
                className="hero-v2-card-img"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            </picture>
          ) : (
            <div className="hero-v2-card-img" style={{
              background: 'linear-gradient(135deg, #17472c, #2bb573)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              color: '#fff',
              borderRadius: '12px',
              height: '160px'
            }}>
              📖
            </div>
          )}
        </div>
        
        <div className="hero-v2-card-body">
          <motion.h3
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {currentCourse.title}
          </motion.h3>
          <div className="hero-v2-price">{currentCourse.price}</div>
          <div className="hero-v2-meta">
            <span>⏱ {currentCourse.duration}</span>
            <span>{currentCourse.level}</span>
          </div>
          <p className="hero-v2-card-desc">{currentCourse.description}</p>
          <div className="hero-v2-card-btns">
            <a href="/contact" className="btn-primary">Register Now</a>
            <a href={`/courses/${currentCourse.id}`} className="btn-secondary-outline">
              <span>See Details →</span>
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}