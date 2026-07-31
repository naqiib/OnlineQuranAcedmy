import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Khalid Al-Faisal',
    role: 'Student',
    initial: 'K',
    text: "I am truly grateful for the invaluable learning experience I've had on the Safeer Quran website. The platform has not only deepened my understanding of the Quran but has also allowed me to connect with the teachings of Islam on a profound level.",
  },
  {
    name: 'Fatima Al-Zahra',
    role: 'Parent',
    initial: 'F',
    text: 'My daughter started with zero Arabic knowledge and within 3 months she was reading Quran fluently. Ustadh Safeer is incredibly patient and dedicated.',
  },
  {
    name: 'Muhammad Bilal',
    role: 'Parent',
    initial: 'M',
    text: 'Excellent teaching methodology. My son looks forward to every class. The structured Hifz plan with daily revision tracking is exceptional.',
  },
  {
    name: 'Ahmed Raza',
    role: 'Parent',
    initial: 'A',
    text: 'Very happy with the progress my children are making. The teachers are kind, knowledgeable and very encouraging throughout every session.',
  },
  {
    name: 'Ustadha Noor',
    role: 'Teacher',
    initial: 'N',
    text: 'As a fellow educator, I am truly impressed by the Tajweed curriculum here. The Makharij focus is thorough and students improve rapidly.',
  },
];

const doubled = [...testimonials, ...testimonials];

export default function Testimonials() {
  return (
    <section className="testimonials-fullscreen">
      <motion.div
        className="testimonials-fullscreen-header"
        initial={{ opacity: 0, x: -80 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2>
          Happy Student <span className="accent-yellow">Testimonials</span>
        </h2>
      </motion.div>

      <div className="testimonials-marquee-wrap">
        <div className="testimonials-marquee-track">
          {doubled.map((t, idx) => (
            <div className="testi-card-full" key={`${t.name}-${idx}`}>
              <div className="testi-avatar-row">
                <div className="testi-avatar">{t.initial}</div>
                <div>
                  <strong>{t.name}</strong>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
              <p>&ldquo;{t.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
