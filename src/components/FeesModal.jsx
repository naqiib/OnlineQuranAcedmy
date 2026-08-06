// src/components/FeesModal.jsx
import { useEffect } from 'react';

const feesData = [
  {
    id: 1,
    color: 'blue',
    icon: 'ق',
    title: 'Noorani Qaida',
    subtitle: '+ Islami Duayen included',
    price: 40, // 45 - 5
    unit: 'month',
    hours: 20,
    perHour: 40,
    days: '3 days/week',
    duration: '30 minutes',
    features: [
      '20 hour classes per month',
      'Islami Duayen included (free)',
      '3 sessions per week',
      'All ages welcome',
    ],
  },
  {
    id: 2,
    color: 'green',
    icon: 'ن',
    title: 'Nazira Quran',
    subtitle: '+ Islami Duayen included',
    price: 65, // 70 - 5
    unit: 'month',
    hours: 20,
    perHour: 65,
    days: '6 days/week',
    duration: '30 minutes',
    features: [
      '20 hour classes per month',
      'Islami Duayen included (free)',
      '6 sessions per week',
      'Age 6+ years',
    ],
  },
  {
    id: 3,
    color: 'purple',
    icon: 'ح',
    title: 'Hifz ul Quran',
    subtitle: '+ Islami Duayen included',
    price: 65, // 70 - 5
    unit: 'month',
    hours: 20,
    perHour: 65,
    days: '5–6 days/week',
    duration: '30 minutes',
    features: [
      '20 hour classes per month',
      'Islami Duayen included (free)',
      '5–6 sessions per week',
      'Age 7+ years',
    ],
  },
];

const familyDiscount = {
  icon: '👨‍👩‍👧‍👦',
  title: 'Family Discount',
  desc: '50% off for every additional student from the same family (2+ members)',
  example: 'Example: 2 kids → 2nd student pays 50% of course fee',
};

export default function FeesModal({ onClose }) {
  useEffect(() => {
    const handler = (e) => { 
      if (e.key === 'Escape') onClose(); 
    };

    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div 
      className="fm-overlay" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="fm-modal">

        {/* Header */}
        <div className="fm-header">
          <div>
            <div className="fm-tag">💰 Transparent Pricing</div>
            <h2 className="fm-title">Fee Structure</h2>
            <p className="fm-subtitle">
              Simple, affordable fees — no hidden charges
            </p>
          </div>
          <button 
            className="fm-close" 
            onClick={onClose} 
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* USA Fee Table */}
        <div className="fm-usa-table-wrap">
          <div className="fm-usa-table-header">
            <span className="fm-usa-flag">🇺🇸</span>
            <span className="fm-usa-title">Monthly Fee for USA</span>
          </div>
          <table className="fm-usa-table">
            <thead>
              <tr>
                <th>Days/Week</th>
                <th>Duration</th>
                <th>One Student</th>
                <th>Two Students</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>3 days/week</td>
                <td>30 minutes</td>
                <td>$40</td>
                <td>$35</td>
              </tr>
              <tr>
                <td>6 days/week</td>
                <td>30 minutes</td>
                <td>$65</td>
                <td>$55</td>
              </tr>
              <tr>
                <td>Sat - Sun</td>
                <td>30 minutes</td>
                <td>$25</td>
                <td>$20</td>
              </tr>
              <tr>
                <td>Sat - Sun</td>
                <td>40 minutes</td>
                <td>$30</td>
                <td>$25</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PKR Fee Cards */}
        <div className="fm-section-label">
          <span className="fm-section-line"></span>
          <span className="fm-section-text">📍 Pakistan (PKR)</span>
          <span className="fm-section-line"></span>
        </div>

        <div className="fm-cards">
          {feesData.map((f) => (
            <div key={f.id} className={`fm-card fc-${f.color}`}>
              
              <div className={`fm-card-banner banner-${f.color}`} />

              <div className="fm-card-body">

                <div className="fm-card-top">
                  <div className={`fm-icon icon-${f.color}`}>
                    {f.icon}
                  </div>
                  <div>
                    <div className="fm-course-title">{f.title}</div>
                    <div className="fm-course-sub">{f.subtitle}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="fm-price-row">
                  <span className="fm-currency">PKR</span>
                  <span className="fm-amount">
                    {(f.price * 280).toLocaleString()}
                  </span>
                  <span className="fm-unit">/{f.unit}</span>
                </div>

                {/* Meta */}
                <div className="fm-meta-pills">
                  <span className="fm-pill">
                    ⏱ {f.hours} hours/month
                  </span>
                  <span className="fm-pill">
                    💰 PKR {(f.price * 280).toLocaleString()}/month
                  </span>
                </div>

                {/* Features */}
                <ul className="fm-features">
                  {f.features.map((feat, i) => (
                    <li key={i}>
                      <span className="fm-check" />
                      {feat}
                    </li>
                  ))}
                </ul>

              </div>
            </div>
          ))}
        </div>

        {/* Family Discount */}
        <div className="fm-discount-banner">
          <div className="fm-discount-icon">
            {familyDiscount.icon}
          </div>

          <div className="fm-discount-info">
            <div className="fm-discount-title">
              {familyDiscount.title}
            </div>
            <div className="fm-discount-desc">
              {familyDiscount.desc}
            </div>
            <div className="fm-discount-example">
              {familyDiscount.example}
            </div>
          </div>

          <div className="fm-discount-badge">
            50% OFF
          </div>
        </div>

        {/* Footer */}
        <div className="fm-footer-note">
           For custom packages or more info, please{''}
          <a href="/contact" onClick={onClose}>
            contact us
          </a>.
          Free trial class available for all courses.
        </div>

      </div>
    </div>
  );
}