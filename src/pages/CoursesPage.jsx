import Courses from '../components/Courses';
import CTA from '../components/CTA';

export default function CoursesPage() {
  return (
    <main>
      <section className="courses-hero">
        <div className="section-tag">All Courses</div>
        <h1 className="arabic courses-hero-title">Learn Quran Online</h1>
        <p className="courses-hero-sub">
          Choose from our wide range of Quran and Islamic courses 
          taught by certified, experienced teachers.
        </p>
      </section>
      <Courses />
      <CTA />
    </main>
  );
}
