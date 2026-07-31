// src/pages/Home.jsx
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Courses from '../components/Courses';
import Features from '../components/Features';
import Teachers from '../components/Teachers';
import Reviews from '../components/Reviews';
import CTA from '../components/CTA';

export default function Home() {
  return (
    <main>
      <Hero />
      <Courses />
      <Features />
      <Stats />
      <Teachers />
      <Reviews />
      <CTA />
    </main>
  );
}