// src/components/Reviews.jsx
import { useState } from 'react';

const initialReviews = [
  {
    id: 1,
    name: 'Fatima Al-Zahra',
    role: 'Parent',
    rating: 5,
    text: 'My daughter started with zero Arabic knowledge and within 3 months she was reading Quran fluently. Ustadh Safeer is incredibly patient and dedicated.',
    date: 'March 2024',
    avatar: 'ف',
  },
  {
    id: 2,
    name: 'Muhammad Bilal',
    role: 'Parent',
    rating: 5,
    text: 'Excellent teaching methodology. My son looks forward to every class. The structured Hifz plan with daily revision tracking is exceptional.',
    date: 'February 2024',
    avatar: 'م',
  },
  {
    id: 3,
    name: 'Ustadha Noor',
    role: 'Teacher',
    rating: 5,
    text: 'As a fellow educator, I am truly impressed by the Tajweed curriculum here. The Makharij focus is thorough and the students pronunciation improves rapidly.',
    date: 'January 2024',
    avatar: 'ن',
  },
  {
    id: 4,
    name: 'Ahmed Raza',
    role: 'Parent',
    rating: 4,
    text: 'Very happy with the progress my children are making. Shahana Safir is an amazing teacher — kind, knowledgeable and very encouraging.',
    date: 'December 2023',
    avatar: 'ا',
  },
];

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="rv-stars-input">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`rv-star-btn ${star <= (hovered || value) ? 'active' : ''}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="rv-card">
      <div className="rv-card-top">
        <div className={`rv-avatar ${review.role === 'Teacher' ? 'avatar-teacher' : 'avatar-parent'}`}>
          {review.avatar}
        </div>
        <div className="rv-card-meta">
          <div className="rv-name">{review.name}</div>
          <div className="rv-role-row">
            <span className={`rv-role-badge ${review.role === 'Teacher' ? 'badge-teacher' : 'badge-parent'}`}>
              {review.role ==='Teacher'?'Teacher':'Parent'}
            </span>
            <span className="rv-date">{review.date}</span>
          </div>
        </div>
        <div className="rv-stars-display">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < review.rating ? 'star-filled' : 'star-empty'}>★</span>
          ))}
        </div>
      </div>
      <p className="rv-text">"{review.text}"</p>
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews]       = useState(initialReviews);
  const [showForm, setShowForm]     = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [filterRole, setFilterRole] = useState('All');

  const [form, setForm] = useState({ name: '', role: 'Parent', rating: 0, text: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())            e.name   = 'Name is required';
    if (form.rating === 0)            e.rating = 'Please select a rating';
    if (form.text.trim().length < 20) e.text   = 'Review must be at least 20 characters';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const now   = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year  = now.getFullYear();

    setReviews((prev) => [
      {
        id:     Date.now(),
        name:   form.name.trim(),
        role:   form.role,
        rating: form.rating,
        text:   form.text.trim(),
        date:   `${month} ${year}`,
        avatar: form.name.trim()[0].toUpperCase(),
      },
      ...prev,
    ]);

    setForm({ name: '', role: 'Parent', rating: 0, text: '' });
    setErrors({});
    setShowForm(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const filtered  = filterRole === 'All' ? reviews : reviews.filter((r) => r.role === filterRole);
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <section className="rv-section">
      <div className="rv-container">

        {/* Header */}
        <div className="rv-header">
          <span className="rv-section-tag">Community Feedback</span>
          <h2 className="rv-title">Parent &amp; Teacher Reviews</h2>
          <p className="rv-subtitle">
            Real experiences from the families and educators who trust us with their Quran journey.
          </p>
        </div>

        {/* Stats */}
        <div className="rv-stats-row">
          <div className="rv-stat">
            <div className="rv-stat-num">{avgRating}</div>
            <div className="rv-stat-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < Math.round(avgRating) ? 'star-filled' : 'star-empty'}>★</span>
              ))}
            </div>
            <div className="rv-stat-label">Average Rating</div>
          </div>
          <div className="rv-stat-divider" />
          <div className="rv-stat">
            <div className="rv-stat-num">{reviews.length}</div>
            <div className="rv-stat-label">Total Reviews</div>
          </div>
          <div className="rv-stat-divider" />
          <div className="rv-stat">
            <div className="rv-stat-num">{reviews.filter((r) => r.rating === 5).length}</div>
            <div className="rv-stat-label">5-Star Reviews</div>
          </div>
        </div>

        {/* Controls */}
        <div className="rv-controls">
          <div className="rv-filter-group">
            {['All', 'Parent', 'Teacher'].map((role) => (
              <button
                key={role}
                className={`rv-filter-btn ${filterRole === role ? 'active' : ''}`}
                onClick={() => setFilterRole(role)}
              >
                {role ==='All'?'All Reviews': role ==='Parent'?'Parents':'Teachers'}
              </button>
            ))}
          </div>
          <button
            className="rv-write-btn"
            onClick={() => { setShowForm(!showForm); setSubmitted(false); }}
          >
            {showForm ?'✕ Cancel':'Write a Review'}
          </button>
        </div>

        {/* Success */}
        {submitted && (
          <div className="rv-success">
             Thank you! Your review has been posted successfully.
          </div>
        )}

        {/* Form */}
        {showForm && (
          <form className="rv-form" onSubmit={handleSubmit} noValidate>
            <h3 className="rv-form-title">Share Your Experience</h3>

            <div className="rv-form-row">
              <div className="rv-form-group">
                <label className="rv-label">Your Name *</label>
                <input
                  className={`rv-input ${errors.name ? 'input-error' : ''}`}
                  type="text"
                  placeholder="e.g. Ahmed Khan"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && <span className="rv-error">{errors.name}</span>}
              </div>

              <div className="rv-form-group">
                <label className="rv-label">I am a *</label>
                <div className="rv-role-toggle">
                  {['Parent', 'Teacher'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`rv-toggle-btn ${form.role === r ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, role: r })}
                    >
                      {r ==='Parent'?'Parent':'Teacher'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rv-form-group">
              <label className="rv-label">Your Rating *</label>
              <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
              {errors.rating && <span className="rv-error">{errors.rating}</span>}
            </div>

            <div className="rv-form-group">
              <label className="rv-label">Your Review *</label>
              <textarea
                className={`rv-textarea ${errors.text ? 'input-error' : ''}`}
                placeholder="Share your experience with our teachers and courses..."
                rows={4}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />
              <div className="rv-char-count">{form.text.length} characters</div>
              {errors.text && <span className="rv-error">{errors.text}</span>}
            </div>

            <button type="submit" className="rv-submit-btn">Post Review →</button>
          </form>
        )}

        {/* Grid */}
        <div className="rv-grid">
          {filtered.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rv-empty">No {filterRole} reviews yet. Be the first!</div>
        )}

      </div>
    </section>
  );
}
