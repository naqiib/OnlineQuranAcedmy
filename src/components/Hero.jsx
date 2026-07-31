// src/components/Hero.jsx
import { motion } from "framer-motion";
import { useState } from "react";
import quranImg from "../assets/quran.avif";

const featuredCourses = [
  { 
    id: 1,
    title: "Reading Quran Basics", 
    price: "$99.00", 
    duration: "Live Classes", 
    level: "Beginner",
    description: "Learn to read Quran with proper pronunciation and basic rules"
  },
  { 
    id: 2,
    title: "Tajweed & Tarteel", 
    price: "$120.00", 
    duration: "Live Classes", 
    level: "Intermediate",
    description: "Master the rules of Tajweed and beautiful recitation"
  },
  { 
    id: 3,
    title: "Quran Memorization", 
    price: "$150.00", 
    duration: "Live Classes", 
    level: "Advanced",
    description: "Memorize the Quran with proper revision and retention techniques"
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
            <span>📚 {currentCourse.level}</span>
          </div>
          <p className="hero-v2-card-desc">{currentCourse.description}</p>
          <div className="hero-v2-card-btns">
            <a href="/contact" className="btn-primary">Register Now</a>
            <a href={`/course/${currentCourse.id}`} className="btn-half-green">
              <span>See Details →</span>
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}