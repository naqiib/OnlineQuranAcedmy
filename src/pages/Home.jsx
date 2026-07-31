// src/pages/Home.jsx
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Courses from '../components/Courses';
import Features from '../components/Features';
import Teachers from '../components/Teachers';
import Testimonials from '../components/testemonial';
import CTA from '../components/CTA';

export default function Home() {
  return (
    <main>
      <Hero />
      <Stats />
      <Courses />
      <Features />
      <Teachers />
      <Testimonials />
      <CTA />
    </main>
  );
}