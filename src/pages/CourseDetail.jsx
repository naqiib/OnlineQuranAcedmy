// src/pages/CourseDetail.jsx
import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import courses from '../data/coursesData';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = courses[Number(id)];
  const [activeVideo, setActiveVideo] = useState(0);

  if (!course) {
    return (
      <div className="cd-not-found">
        <p>Course not found.</p>
        <button onClick={() => navigate('/courses')} className="cd-back-btn">
          ← Back to Courses
        </button>
      </div>
    );
  }

  const currentVideo = course.videos[activeVideo];

  return (
    <div className="cd-wrapper">
      <nav className="cd-nav">
        <Link to="/courses" className="cd-back-btn">← All Courses</Link>
        <div className="cd-nav-info">
          <span className="cd-nav-title">{course.title}</span>
          <span className="cd-nav-sub">{course.level} · {course.duration}</span>
        </div>
      </nav>

      <div className="cd-page">
        <div className={`cd-hero hero-${course.color}`}>
          <div className="cd-hero-glow" />
          <div className="cd-hero-icon">{course.icon}</div>
          <h1 className="cd-hero-title">{course.title}</h1>
          <p className="cd-hero-desc">{course.fullDesc}</p>
          <div className="cd-hero-tags">
            {[course.level, course.duration, course.sessions, `Age: ${course.age}`].map((t) => (
              <span key={t} className="cd-hero-tag">{t}</span>
            ))}
          </div>
        </div>

        <div className="cd-grid">
          <div className="cd-left">

            <div className="cd-section">
              <div className="cd-section-header">
                <div className="cd-section-icon">▶</div>
                <h2 className="cd-section-title">Teaching Method — Video Lessons</h2>
              </div>

              <div className="cd-player">
                {currentVideo?.youtubeId ? (
                  <iframe
                    key={currentVideo.youtubeId}
                    width="100%"
                    height="300"
                    src={`https://www.youtube.com/embed/${currentVideo.youtubeId}`}
                    title={currentVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: '12px', display: 'block' }}
                  />
                ) : currentVideo?.url ? (
                  <video
                    key={currentVideo.url}
                    src={currentVideo.url}
                    controls
                    className="cd-video-el"
                  />
                ) : (
                  <div className="cd-video-placeholder">
                    <div className="cd-play-ring">
                      <div className="cd-play-arrow" />
                    </div>
                    <div className="cd-player-title">{currentVideo?.title}</div>
                    <div className="cd-player-sub">Video coming soon — check back later.</div>
                  </div>
                )}
              </div>

              <div className="cd-video-list">
                {course.videos.map((v, i) => (
                  <button
                    key={i}
                    className={`cd-video-item ${i === activeVideo ? 'active' : ''}`}
                    onClick={() => setActiveVideo(i)}
                  >
                    <div className="cd-vthumb"><div className="cd-vthumb-play" /></div>
                    <div className="cd-vinfo">
                      <div className="cd-vtitle">{v.title}</div>
                      <div className="cd-vdur">{v.dur}</div>
                    </div>
                    {i === activeVideo && <span className="cd-watching-badge">Watching</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="cd-section">
              <div className="cd-section-header">
                <div className="cd-section-icon">✓</div>
                <h2 className="cd-section-title">What You Will Learn</h2>
              </div>
              <div className="cd-learn-grid">
                {course.learn.map((item, i) => (
                  <div key={i} className="cd-learn-item">
                    <div className="cd-check-dot" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="cd-section">
              <div className="cd-section-header">
                <div className="cd-section-icon"></div>
                <h2 className="cd-section-title">Course Timeline &amp; Phases</h2>
              </div>
              <div className="cd-timeline">
                {course.timeline.map((t, i) => (
                  <div key={i} className="cd-tl-item">
                    <div className="cd-tl-line">
                      <div className="cd-tl-dot" />
                      {i < course.timeline.length - 1 && <div className="cd-tl-connector" />}
                    </div>
                    <div className="cd-tl-content">
                      <div className="cd-tl-phase">{t.phase}</div>
                      <div className="cd-tl-desc">{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <aside className="cd-sidebar">
            <div className="cd-info-card">
              <h3 className="cd-info-card-title">Course Details</h3>
              {[
                { icon: '⏱', label: 'Duration',  value: course.duration },
                {icon:'', label:'Sessions', value: course.sessions},
                {icon:'', label:'Age Group', value: course.age},
                {icon:'', label:'Teacher', value: course.teacher},
                {icon:'', label:'Level', value: course.level},
                {icon:'', label:'Lessons', value: `${course.videos.length} lessons`},
              ].map(({ icon, label, value }) => (
                <div key={label} className="cd-info-row">
                  <span className="cd-info-key">{icon} {label}</span>
                  <span className="cd-info-val">{value}</span>
                </div>
              ))}
            </div>

            <div className="cd-info-card">
              <h3 className="cd-info-card-title">Prerequisites</h3>
              <div className="cd-prereq-box"><p>{course.prereq}</p></div>
            </div>

            <div className="cd-info-card">
              <h3 className="cd-info-card-title">Curriculum Progress</h3>
              <div className="cd-progress-wrap">
                <div className="cd-progress-label">
                  <span>Content uploaded</span>
                  <span>{course.completion}%</span>
                </div>
                <div className="cd-progress-bar">
                  <div className="cd-progress-fill" style={{ width: `${course.completion}%` }} />
                </div>
              </div>
              <p className="cd-progress-note">
                {course.videos.length} lessons available. More being added weekly.
              </p>
            </div>

            <Link to="/contact" className="cd-enroll-btn">
              Enroll in {course.title}
              <span className="cd-enroll-sub">Start with a free trial class</span>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
