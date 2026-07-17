
const skills_safeer = [
  'Hifz ul Quran (Complete Memorization)',
  'Tajweed ul Quran — Advanced',
  'Nazira & Qaida Teaching',
  'Islamic Studies & Fiqh',
  'Online Teaching Methodology',
  'Student Progress Tracking',
];

const skills_shahana = [
  'Nazira Quran Teaching',
  'Noorani Qaida for Kids',
  'Female Student Specialist',
  'Tajweed ul Quran',
  'Islamic Studies for Children',
  'Patience & Nurturing Approach',
];

const languages = [
  { code: 'EN', name: 'English', desc: 'Fluent' },
  { code: 'UR', name: 'Urdu', desc: 'Native' },
  { code: 'PS', name: 'Pashto', desc: 'Fluent' },
];

const values = [
  {icon:'', title:'Certified Huffaz', desc:'Hafiz-e-Quran teachers with Tajweed certification and years of proven results.'},
  {icon:'', title:'Global Students', desc:'Serving students from UK, USA, Canada, Australia, UAE and beyond.'},
  {icon:'', title:'Family-Led Academy', desc:'A husband-and-wife team that treats every student like their own family.'},
  {icon:'', title:'One-on-One Classes', desc:'No group classes. Each student gets full personal attention every session.'},
];

export default function About() {
  return (
    <main className="about-page">

      {/* ── HERO with Arabic Opening ── */}
      <section className="about-hero">
        <div className="hero-glow" />
        <div className="hero-glow hero-glow-2" />
        <div className="about-hero-inner">
          <div className="arabic-opening">
            <div className="auzoo">أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ</div>
            <div className="auzoo-translation">I seek refuge in Allah from the accursed Shaytan</div>
            <div className="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <div className="bismillah-translation">In the name of Allah, the Most Gracious, the Most Merciful</div>
          </div>
          <div className="hero-divider" />
          <span className="section-tag">About Us</span>
          <h1 className="about-hero-title">Safeer Quran Academy</h1>
          <p className="about-hero-sub">
            A family-led online Quran academy dedicated to spreading the
            light of the Quran to every home — across every continent.
          </p>
        </div>
      </section>

      {/* ── OUR STORY ── */}
      <section className="story-section">
        <div className="story-inner">
          <div className="story-label">Our Story</div>
          <h2 className="story-title">From a Small Class to a Global Academy</h2>
          <p>
            <strong>Safeer Quran Academy</strong> was founded by <strong>Hafiz Safeer Khan</strong> — a
            Hafiz-e-Quran with over 10 years of dedicated online and physical teaching experience.
            What began as a small neighbourhood Quran class grew, through the grace of Allah, into a
            thriving global academy serving students on multiple continents.
          </p>
          <p>
            Joined by his wife <strong>Shahana Safir</strong> — a compassionate and experienced Quran
            teacher in her own right — the academy became a family mission. Together they have guided
            over <strong>50 students</strong> to complete their Hifz and Nazira, with <strong>24 active
            students</strong> currently enrolled from all over the world.
          </p>
          <p>
            Their goal is simple: <em>to make authentic, high-quality Quran education accessible to
            every Muslim home — regardless of location, background, or financial situation.</em>
          </p>
          <div className="story-stats">
            <div className="story-stat"><span>50+</span><label>Hifz & Nazira Completed</label></div>
            <div className="story-stat"><span>24+</span><label>Active Students</label></div>
            <div className="story-stat"><span>10+</span><label>Years Experience</label></div>
            <div className="story-stat"><span></span><label>Students Worldwide</label></div>
          </div>
        </div>
      </section>

      {/* ── TEACHERS SECTION ── */}
      <section className="teachers-section">
        <div className="teachers-header">
          <span className="section-tag">Meet Our Teachers</span>
          <h2 className="teachers-title">The Faces Behind the Academy</h2>
        </div>

        <div className="teachers-grid">

          {/* ── SAFEER KHAN ── */}
          <div className="teacher-profile">
            <div className="teacher-photo-wrap">
              {/* Replace src with actual photo: <img src="/images/safeer.jpg" alt="Safeer Khan" /> */}
              <div className="teacher-photo-placeholder">
                <div className="photo-arabic">ص</div>
                <div className="photo-hint">Add photo:<br /><code>src/assets/safeer.jpg</code></div>
              </div>
              <div className="teacher-badge-float">Hafiz-e-Quran</div>
            </div>

            <div className="teacher-info">
              <div className="teacher-name-row">
                <h3>Ustaz Safeer Khan</h3>
                <div className="exp-badge">10+ yrs</div>
              </div>
              <div className="teacher-role">Lead Quran Teacher & Founder</div>

              <p className="teacher-bio">
                Hafiz Safeer Khan memorized the entire Holy Quran at a young age and has since devoted
                his life to teaching the Quran to others. With over a decade of experience teaching
                students of all ages — from young children to adults — he has developed a uniquely
                effective, patient, and results-driven teaching style. His students consistently
                complete their Hifz and Nazira with strong Tajweed and lasting retention.
              </p>
              <p className="teacher-bio">
                His passion is not just to teach recitation, but to build a <strong>deep, lifelong
                connection</strong> between every student and the Book of Allah.
              </p>

              <div className="skills-title">Core Expertise</div>
              <div className="skills-grid">
                {skills_safeer.map((s) => (
                  <div className="skill-pill" key={s}>
                    <span className="skill-check">✓</span> {s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── SHAHANA SAFIR ── */}
          <div className="teacher-profile teacher-profile-alt">
            <div className="teacher-info">
              <div className="teacher-name-row">
                <h3>Ustaza Shahana Safir</h3>
                <div className="exp-badge">5+ yrs</div>
              </div>
              <div className="teacher-role">Female Quran Teacher & Co-Founder</div>

              <p className="teacher-bio">
                Ustaza Shahana Safir brings warmth, patience, and a nurturing spirit to every class.
                With 5 years of dedicated teaching experience, she specialises in teaching young
                children and female students — creating a safe, encouraging, and comfortable learning
                environment where every student thrives.
              </p>
              <p className="teacher-bio">
                She believes that every child has the <strong>potential to become a Hafiz or
                Hafiza</strong>, and her gentle, structured approach has helped dozens of students
                build a strong Quranic foundation from an early age.
              </p>

              <div className="skills-title">Core Expertise</div>
              <div className="skills-grid">
                {skills_shahana.map((s) => (
                  <div className="skill-pill skill-pill-alt" key={s}>
                    <span className="skill-check">✓</span> {s}
                  </div>
                ))}
              </div>
            </div>

            <div className="teacher-photo-wrap">
              {/* Replace src with actual photo: <img src="/images/shahana.jpg" alt="Shahana Safir" /> */}
              <div className="teacher-photo-placeholder teacher-photo-placeholder-alt">
                <div className="photo-arabic">ش</div>
                <div className="photo-hint">Add photo:<br /><code>src/assets/shahana.jpg</code></div>
              </div>
              <div className="teacher-badge-float badge-alt">Female Specialist</div>
            </div>
          </div>

        </div>
      </section>

      {/* ── LANGUAGES ── */}
      <section className="languages-section">
        <div className="languages-inner">
          <span className="section-tag section-tag-light">We Speak Your Language</span>
          <h2 className="languages-title">Teaching in 3 Languages</h2>
          <p className="languages-sub">
            Language should never be a barrier to learning the Quran. Our teachers are fluent in
            multiple languages so every student feels at home — wherever they are in the world.
          </p>
          <div className="languages-row">
            {languages.map((l) => (
              <div className="lang-card" key={l.code}>
                
                <div className="lang-code">{l.code}</div>
                <div className="lang-name">{l.name}</div>
                <div className="lang-desc">{l.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POOR STUDENTS PROMISE ── */}
      <section className="promise-section">
        <div className="promise-inner">
          <div className="promise-icon"></div>
          <div className="promise-arabic">وَمَا تُنفِقُوا مِنْ خَيْرٍ فَلِأَنفُسِكُمْ</div>
          <div className="promise-arabic-tr">"Whatever good you spend is for yourselves." — Surah Al-Baqarah 2:272</div>
          <h2 className="promise-title">Special Commitment for Students in Need</h2>
          <p className="promise-desc">
            We firmly believe that <strong>financial hardship should never stop anyone from learning
            the Quran.</strong> If a student or family genuinely cannot afford the full fee, we offer
            <strong> special discounted rates</strong> or even <strong>completely free classes</strong>
            — based on their situation.
          </p>
          <p className="promise-desc">
            The Quran is a right for every Muslim. If you are in need, please reach out to us
            honestly and privately — we will do everything we can to make sure you or your child
            can still learn.
          </p>
          <div className="promise-highlights">
            <div className="promise-hl">
              <span></span>
              <div><strong>Reduced Fees</strong><br />For families with financial difficulty</div>
            </div>
            <div className="promise-hl">
              <span>🆓</span>
              <div><strong>Free Classes</strong><br />For students with genuine need</div>
            </div>
            <div className="promise-hl">
              <span></span>
              <div><strong>Confidential</strong><br />Your situation stays private</div>
            </div>
          </div>
          <a href="/contact" className="promise-btn">Contact Us Privately</a>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="values-section">
        <div className="values-header">
          <span className="section-tag">Why Choose Us</span>
          <h2 className="values-title">What Makes Us Different</h2>
        </div>
        <div className="values-grid">
          {values.map((v) => (
            <div className="value-card" key={v.title}>
              <div className="value-icon">{v.icon}</div>
              <h4>{v.title}</h4>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}