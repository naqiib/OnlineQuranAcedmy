import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    country: '',
    course: '',
    message: '',
  });

  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Your WhatsApp number (with country code, no 0)
    const phoneNumber = "923075764607";

    // Message template
    const text = `Assalam o Alaikum,
New Student Inquiry:

 Name: ${form.name}
 Email: ${form.email}
 Country: ${form.country}
 Course: ${form.course}
 Message: ${form.message ||"N/A"}
`;

    // WhatsApp URL
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;

    // Open WhatsApp
    window.open(whatsappURL, "_blank");

    setSent(true);
  };

  return (
    <main className="contact-page">
      
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="section-tag">Contact Us</div>
        <h1 className="arabic">Get in Touch</h1>
        <p>Book your free trial class or ask us anything.</p>
      </section>

      <div className="contact-body">

        {/* Contact Info */}
        <div className="contact-info">
          {[
            {icon:'', label:'Email', val:'safeer007@gmail.com'},
            {icon:'', label:'Phone', val:'0307 5764607'},
            {icon:'', label:'Location', val:'Online — Worldwide'},
            { icon: '⏰', label: 'Classes', val: 'Flexible timings available' },
          ].map((item) => (
            <div className="info-item" key={item.label}>
              <div className="info-icon">{item.icon}</div>
              <div>
                <div className="info-label">{item.label}</div>
                <div className="info-val">{item.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <form className="contact-form" onSubmit={handleSubmit}>
          {sent ? (
            <div className="form-success">
               WhatsApp opened! Please click send to complete your request.
              we wiil get back to you as soon as possible. JazakAllah Khair!
            </div>
          ) : (
            <>
              <h3>Book Free Trial Class</h3>

              <div className="form-row">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Full Name"
                  required
                  value={form.name}
                  onChange={handleChange}
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <input
                  type="text"
                  name="country"
                  placeholder="Your Country"
                  required
                  value={form.country}
                  onChange={handleChange}
                />

                <select
                  name="course"
                  required
                  value={form.course}
                  onChange={handleChange}
                >
                  <option value="">Select a Course</option>
                  <option>Noorani Qaida</option>
                  <option>Nazira Quran</option>
                  <option>Hifz ul Quran</option>
                  <option>Tajweed ul Quran</option>
                  <option>Islamic Studies</option>
                  <option>Arabic Language</option>
                </select>
              </div>

              <textarea
                name="message"
                placeholder="Any additional message (optional)"
                rows={4}
                value={form.message}
                onChange={handleChange}
              />

              <button type="submit" className="form-btn">
                Send Message
              </button>
            </>
          )}
        </form>

      </div>
    </main>
  );
}