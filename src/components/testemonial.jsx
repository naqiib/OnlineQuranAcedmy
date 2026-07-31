// src/components/Testimonials.jsx
import { useState } from 'react';

const testimonials = [
  {
    name: 'Khalid Al-Faisal',
    role: 'Student',
    initial: 'K',
    text: "I am truly grateful for the invaluable learning experience I've had on the Safeer Quran website. The platform has not only deepened my understanding of the Quran but has also allowed me to connect with the teachings of Islam on a profound level.",
  },
  // aur testimonials add kar sakte ho
];

export default function Testimonials() {
  const [i, setI] = useState(0);
  const t = testimonials[i];
  const next = () => setI((v) => (v + 1) % testimonials.length);
  const prev = () => setI((v) => (v - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="testimonials-v2">
      <h2>Happy Student <span className="accent-yellow">Testimonials</span></h2>

      <div className="testimonials-v2-row">
        <button onClick={prev} className="testi-arrow">←</button>
        <div className="testi-card">
          <div className="testi-avatar-row">
            <div className="testi-avatar">{t.initial}</div>
            <div>
              <strong>{t.name}</strong>
              <div className="testi-role">{t.role}</div>
            </div>
          </div>
          <p>"{t.text}"</p>
        </div>
        <button onClick={next} className="testi-arrow filled">→</button>
      </div>
    </section>
  );
}