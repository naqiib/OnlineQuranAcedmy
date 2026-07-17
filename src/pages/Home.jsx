import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Teachers from '../components/Teachers';
import Courses from '../components/Courses';
import CTA from '../components/CTA';
import Reviews from '../components/Reviews';

export default function Home() {
  return (
    <main>
      <Hero />
      <Stats />
      <Teachers />
      <Courses />
       <Reviews /> 
      <CTA />
    </main>
  );
}
