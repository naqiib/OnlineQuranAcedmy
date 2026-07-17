// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
  doc, getDoc, collection, query,
  where, getDocs, onSnapshot, updateDoc,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) { navigate('/portal'); return; }
      try {
        const snap = await getDoc(doc(db, 'students', user.uid));
        if (snap.exists()) {
          const data = { id: user.uid, ...snap.data() };
          setStudent(data);
          setEditForm({ name: data.name || '', phone: data.phone || '', country: data.country || '', gender: data.gender || '', dob: data.dob || '' });
        }
        const tSnap = await getDocs(collection(db, 'teachers'));
        setTeachers(tSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const aSnap = await getDocs(query(collection(db, 'attendance'), where('studentId', '==', user.uid)));
        setAttendance(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (!student?.course) return;
    const unsub = onSnapshot(collection(db, 'notices'), snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data(), date: d.data().date?.toDate?.() || new Date() }));
      setNotices(all.filter(n => n.audience?.includes('all') || n.audience?.includes(student.course)).sort((a, b) => b.date - a.date));
    });
    return unsub;
  }, [student?.course]);

  const handleLogout = async () => { await signOut(auth); navigate('/portal'); };

  const fmt = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const fmtShort = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const attendancePct = () => {
    if (!attendance.length) return 0;
    return Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100);
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      await updateDoc(doc(db, 'students', student.id), {
        phone: editForm.phone, country: editForm.country,
        gender: editForm.gender, dob: editForm.dob, name: editForm.name,
      });
      setStudent(prev => ({ ...prev, ...editForm }));
      setEditMode(false);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) { console.error(err); }
    finally { setSavingProfile(false); }
  };

  const setEF = (field) => (e) => setEditForm(p => ({ ...p, [field]: e.target.value }));

  const NAV_ITEMS = [
    {key:'dashboard', icon:'', label:'Dashboard'},
    {key:'profile', icon:'', label:'Profile'},
    {key:'courses', icon:'', label:'Courses'},
    {key:'payment', icon:'', label:'Payment'},
    {key:'attendance', icon:'', label:'Attendance'},
    {key:'results', icon:'', label:'Results'},
    {key:'notices', icon:'', label:'Notices'},
  ];

  if (loading) return (
    <div className="db-loading">
      <div className="db-spinner" />
      <p style={{ color: '#64748b', fontSize: 14 }}>Loading your dashboard...</p>
    </div>
  );

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="db-wrap">
      {/* ── SIDEBAR ── */}
      <aside className="db-sidebar">
        <div className="db-sidebar-brand">
          <div className="db-brand-icon">س</div>
          <div>
            <div className="db-brand-name">Safeer Quran<br />Academy</div>
            <div className="db-brand-sub">Student Portal</div>
          </div>
        </div>

        <div className="db-nav-section">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`db-nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              <span className="db-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="db-sidebar-footer">
          <div className="db-footer-avatar">{student?.name?.[0] || 'S'}</div>
          <div>
            <div className="db-footer-name">{student?.name?.split(' ')[0] || 'Student'}</div>
            <div className="db-footer-role">{student?.course || 'Student'}</div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="db-content">
        {/* Top Bar */}
        <header className="db-topbar">
          <div className="db-search">
            <span className="db-search-icon"></span>
            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="db-topbar-right">
            <span className="db-topbar-date">{todayStr}</span>
            <div className="db-notif-btn"><span className="db-notif-dot"/></div>
            <div className="db-topbar-user">
              <div className="db-topbar-avatar">{student?.name?.[0] || 'S'}</div>
              <span className="db-topbar-name">{student?.name?.split(' ')[0] || 'Student'}</span>
            </div>
            <button onClick={handleLogout}
              style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', color: '#64748b', fontFamily: 'inherit', fontWeight: 600 }}>
              Logout
            </button>
          </div>
        </header>

        <div className="db-body">

          {/* ── DASHBOARD TAB ── */}
          {activeTab === 'dashboard' && (
            <>
              {/* Banner */}
              <div className="db-banner">
                <div>
                  <div className="db-banner-title">Assalamu Alaikum, {student?.name?.split('')[0] ||'Student'}!</div>
                  <div className="db-banner-sub">Always stay updated in your student portal</div>
                  <div className="db-banner-badge">
                    {student?.status ==='active'?'Active Student':'⏳ Pending Approval'}
                  </div>
                </div>
                <div className="db-banner-icon"></div>
              </div>

              {/* Stats */}
              <div className="db-stats">
                <div className="db-stat-card">
                  <div className="db-stat-icon-wrap"></div>
                  <div className="db-stat-label">Total payable</div>
                  <div className="db-stat-value">PKR {student?.totalFee?.toLocaleString() ?? '—'}</div>
                  <div className="db-stat-sub">12 months</div>
                </div>
                <div className="db-stat-card">
                  <div className="db-stat-icon-wrap"></div>
                  <div className="db-stat-label">Course progress</div>
                  <div className="db-stat-value">{student?.progress ?? 0}%</div>
                  <div className="db-stat-sub">{student?.currentJuz ? `Juz ${student.currentJuz} of 30` : 'In progress'}</div>
                </div>
                <div className="db-stat-card">
                  <div className="db-stat-icon-wrap"></div>
                  <div className="db-stat-label">Attendance</div>
                  <div className="db-stat-value">{attendancePct()}%</div>
                  <div className="db-stat-sub">This month</div>
                </div>
              </div>

              {/* Finance */}
              <div className="db-card">
                <div className="db-card-head">
                  <span className="db-card-title">Finance</span>
                  <a className="db-see-all" onClick={() => setActiveTab('payment')}>See all</a>
                </div>
                <div className="db-finance-grid">
                  <div className="db-finance-item">
                    <div className="db-finance-amount">PKR {student?.totalFee?.toLocaleString() ?? '—'}</div>
                    <div className="db-finance-label">Total payable</div>
                  </div>
                  <div className="db-finance-item active">
                    <div className="db-finance-amount" style={{ color: '#2563eb' }}>PKR {student?.paidFee?.toLocaleString() ?? '—'}</div>
                    <div className="db-finance-label">Total paid</div>
                  </div>
                  <div className="db-finance-item">
                    <div className="db-finance-amount" style={{ color: '#dc2626' }}>
                      PKR {student?.totalFee && student?.paidFee ? (student.totalFee - student.paidFee).toLocaleString() : '—'}
                    </div>
                    <div className="db-finance-label">Remaining</div>
                  </div>
                </div>
              </div>

              {/* Two col: Instructors + Notices */}
              <div className="db-two-col">
                <div className="db-card">
                  <div className="db-card-head">
                    <span className="db-card-title">Course instructors</span>
                  </div>
                  {teachers.length > 0 ? teachers.map(t => (
                    <div key={t.id} className="db-instructor-item">
                      <div className="db-instructor-av">{t.name?.[0] || 'T'}</div>
                      <div>
                        <div className="db-instructor-name">{t.name}</div>
                        <div className="db-instructor-role">{t.specialization || 'Quran Teacher'} · {t.experience || '—'} yrs</div>
                      </div>
                    </div>
                  )) : (
                    <>
                      <div className="db-instructor-item">
                        <div className="db-instructor-av">SK</div>
                        <div>
                          <div className="db-instructor-name">Hafiz Safeer Khan</div>
                          <div className="db-instructor-role">Hifz · Tajweed · 10+ yrs</div>
                        </div>
                      </div>
                      <div className="db-instructor-item">
                        <div className="db-instructor-av">SS</div>
                        <div>
                          <div className="db-instructor-name">Shahana Safir</div>
                          <div className="db-instructor-role">Nazira · Qaida · 5+ yrs</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="db-card">
                  <div className="db-card-head">
                    <span className="db-card-title">Daily notices</span>
                    <a className="db-see-all" onClick={() => setActiveTab('notices')}>See all</a>
                  </div>
                  {notices.length > 0 ? notices.slice(0, 3).map(n => (
                    <div key={n.id} className="db-notice-item">
                      <div className={`db-notice-dot ${n.priority === 'high' ? 'red' : 'blue'}`} />
                      <div>
                        <div className="db-notice-title">{n.title}</div>
                        <div className="db-notice-date">{fmtShort(n.date)}</div>
                      </div>
                    </div>
                  )) : (
                    <>
                      <div className="db-notice-item">
                        <div className="db-notice-dot red" />
                        <div><div className="db-notice-title">Monthly test this Friday</div><div className="db-notice-date">{fmtShort(new Date())}</div></div>
                      </div>
                      <div className="db-notice-item">
                        <div className="db-notice-dot blue" />
                        <div><div className="db-notice-title">Eid holiday — 3 days off</div><div className="db-notice-date">May 10, 2026</div></div>
                      </div>
                      <div className="db-notice-item">
                        <div className="db-notice-dot blue" />
                        <div><div className="db-notice-title">April report cards ready</div><div className="db-notice-date">May 2, 2026</div></div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Enrolled Courses + Schedule */}
              <div className="db-two-col">
                <div className="db-card">
                  <div className="db-card-head">
                    <span className="db-card-title">Enrolled courses</span>
                    <a className="db-see-all" onClick={() => setActiveTab('courses')}>See all</a>
                  </div>
                  <div className="db-course-card">
                    <div className="db-course-name">{student?.course || 'Hifz ul Quran'}</div>
                    <div className="db-course-sub">
                      {student?.currentJuz ? `Juz ${student.currentJuz} of 30 complete` : 'In progress'}
                    </div>
                    <div className="db-progress-bar">
                      <div className="db-progress-fill" style={{ width: `${student?.progress || 0}%` }} />
                    </div>
                    <div className="db-progress-pct">{student?.progress || 0}%</div>
                  </div>
                </div>

                <div className="db-card">
                  <div className="db-card-head">
                    <span className="db-card-title">Class schedule</span>
                  </div>
                  <div className="db-schedule-grid">
                    {student?.schedule?.length > 0 ? student.schedule.map((s, i) => (
                      <div key={i} className="db-schedule-item">
                        <div className="db-schedule-day">{s.day}</div>
                        <div>
                          <div className="db-schedule-time">{s.time}</div>
                          <div className="db-schedule-platform">{s.platform || 'Zoom'} · {s.duration}</div>
                        </div>
                      </div>
                    )) : (
                      <>
                        <div className="db-schedule-item">
                          <div className="db-schedule-day">Monday</div>
                          <div><div className="db-schedule-time">4:00 PM</div><div className="db-schedule-platform">Zoom</div></div>
                        </div>
                        <div className="db-schedule-item">
                          <div className="db-schedule-day">Wednesday</div>
                          <div><div className="db-schedule-time">4:00 PM</div><div className="db-schedule-platform">Zoom</div></div>
                        </div>
                        <div className="db-schedule-item">
                          <div className="db-schedule-day">Friday</div>
                          <div><div className="db-schedule-time">4:30 PM</div><div className="db-schedule-platform">Test</div></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div className="db-card">
              <div className="db-card-head">
                <span className="db-card-title">My Profile</span>
                {!editMode
                  ?<button className="db-edit-btn"onClick={() =>setEditMode(true)}>Edit Profile</button>
                  : <div style={{ display: 'flex', gap: 8 }}>
                      <button className="db-save-btn" onClick={handleProfileSave} disabled={savingProfile}>
                        {savingProfile ?'Saving...':'Save'}
                      </button>
                      <button className="db-cancel-btn" onClick={() => setEditMode(false)}>✕</button>
                    </div>
                }
              </div>
              {profileSuccess && <div className="db-success-msg">{profileSuccess}</div>}
              <div className="db-profile-grid">
                <div className="db-profile-field"><label>Email</label><p>{student?.email || '—'}</p></div>
                <div className="db-profile-field"><label>Course</label><p>{student?.course || '—'}</p></div>
                <div className="db-profile-field">
                  <label>Status</label>
                  <p><span className={`db-status-pill ${student?.status === 'active' ? 'active' : 'pending'}`}>
                    {student?.status ==='active'?'Active':'⏳ Pending'}
                  </span></p>
                </div>
                <div className="db-profile-field"><label>Joined</label><p>{fmt(student?.joinedAt?.toDate?.())}</p></div>
                {[
                  { label: 'Full Name', field: 'name', type: 'text', placeholder: 'Your full name' },
                  { label: 'Phone', field: 'phone', type: 'tel', placeholder: '03XX-XXXXXXX' },
                  { label: 'Country', field: 'country', type: 'text', placeholder: 'Your country' },
                  { label: 'Date of Birth', field: 'dob', type: 'date', placeholder: '' },
                ].map(({ label, field, type, placeholder }) => (
                  <div key={field} className="db-profile-field">
                    <label>{label}</label>
                    {editMode
                      ? <input className="db-profile-input" type={type} value={editForm[field]} onChange={setEF(field)} placeholder={placeholder} />
                      : <p>{student?.[field] || '—'}</p>
                    }
                  </div>
                ))}
                <div className="db-profile-field">
                  <label>Gender</label>
                  {editMode
                    ? <select className="db-profile-input" value={editForm.gender} onChange={setEF('gender')}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    : <p>{student?.gender || '—'}</p>
                  }
                </div>
              </div>
            </div>
          )}

          {/* ── COURSES TAB ── */}
          {activeTab === 'courses' && (
            <div className="db-card">
              <div className="db-card-head"><span className="db-card-title">My Course</span></div>
              <div className="db-course-card" style={{ marginBottom: 16 }}>
                <div className="db-course-name">{student?.course || 'Not enrolled'}</div>
                <div className="db-course-sub" style={{ marginBottom: 12 }}>{student?.currentJuz ? `Juz ${student.currentJuz} of 30 complete` : 'In progress'}</div>
                <div className="db-progress-bar"><div className="db-progress-fill" style={{ width: `${student?.progress || 0}%` }} /></div>
                <div className="db-progress-pct">{student?.progress || 0}%</div>
                {student?.currentSurah &&<p style={{fontSize: 13, marginTop: 10, color:'#1e293b'}}>Currently on:<strong>{student.currentSurah}</strong></p>}
                {student?.teacherNote &&<div className="db-teacher-note"style={{marginTop: 12}}><strong>Teacher's Note:</strong>{student.teacherNote}</div>}
              </div>
              <div className="db-card-title"style={{marginBottom: 12, fontSize: 13}}>Class Schedule</div>
              <div className="db-schedule-grid">
                {student?.schedule?.length > 0 ? student.schedule.map((s, i) => (
                  <div key={i} className="db-schedule-item">
                    <div className="db-schedule-day">{s.day}</div>
                    <div><div className="db-schedule-time">{s.time}</div><div className="db-schedule-platform">{s.platform || 'Zoom'} · {s.duration}</div></div>
                  </div>
                )) : <p style={{ color: '#94a3b8', fontSize: 13 }}>Schedule not set yet.</p>}
              </div>
            </div>
          )}

          {/* ── PAYMENT TAB ── */}
          {activeTab === 'payment' && (
            <div className="db-card">
              <div className="db-card-head"><span className="db-card-title">Fee & Payment</span></div>
              <div className="db-pay-row"><span>Total Fee</span><strong>PKR {student?.totalFee ?? '—'}</strong></div>
              <div className="db-pay-row"><span>Paid</span><strong style={{ color: '#16a34a' }}>PKR {student?.paidFee ?? '—'}</strong></div>
              <div className="db-pay-row">
                <span>Remaining</span>
                <strong style={{ color: '#dc2626' }}>PKR {student?.totalFee && student?.paidFee ? student.totalFee - student.paidFee : '—'}</strong>
              </div>
              <div className="db-pay-row">
                <span>Status</span>
                <span className={`db-fee-badge ${student?.feeStatus === 'paid' ? 'paid' : 'pending'}`}>
                  {student?.feeStatus ==='paid'?'Paid':'⏳ Pending'}
                </span>
              </div>
              {student?.nextFeeDate && <div className="db-pay-row"><span>Next Due Date</span><strong>{fmt(student.nextFeeDate)}</strong></div>}
              <div className="db-pay-note">ℹ To make a payment, please contact your teacher on WhatsApp or via email. Fee details are updated by the admin after confirmation.</div>
            </div>
          )}

          {/* ── ATTENDANCE TAB ── */}
          {activeTab === 'attendance' && (
            <div className="db-card">
              <div className="db-card-head"><span className="db-card-title">Attendance</span></div>
              <div className="db-att-stats">
                <div className="db-att-stat"><span>Total</span><strong>{attendance.length}</strong></div>
                <div className="db-att-stat"><span>Present</span><strong style={{ color: '#16a34a' }}>{attendance.filter(a => a.status === 'present').length}</strong></div>
                <div className="db-att-stat"><span>Absent</span><strong style={{ color: '#dc2626' }}>{attendance.filter(a => a.status === 'absent').length}</strong></div>
                <div className="db-att-stat"><span>Percentage</span><strong>{attendancePct()}%</strong></div>
              </div>
              <table className="db-table">
                <thead><tr><th>Date</th><th>Status</th><th>Topic</th><th>Teacher</th></tr></thead>
                <tbody>
                  {attendance.length > 0 ? attendance.slice(0, 15).map(r => (
                    <tr key={r.id}>
                      <td>{fmt(r.date)}</td>
                      <td><span className={`db-att-badge ${r.status}`}>{r.status === 'present' ? '✓ Present' : '✗ Absent'}</span></td>
                      <td>{r.topic || 'Quran Class'}</td>
                      <td>{r.teacherName || 'Safeer Khan'}</td>
                    </tr>
                  )) : <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>No attendance records yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* ── RESULTS TAB ── */}
          {activeTab === 'results' && (
            <div className="db-card">
              <div className="db-card-head"><span className="db-card-title">Results</span></div>
              {student?.results?.length > 0 ? (
                <table className="db-table">
                  <thead><tr><th>Exam</th><th>Date</th><th>Marks</th><th>Total</th><th>%</th><th>Grade</th></tr></thead>
                  <tbody>
                    {student.results.map((r, i) => (
                      <tr key={i}>
                        <td>{r.exam}</td>
                        <td>{fmtShort(r.date)}</td>
                        <td>{r.obtained}</td>
                        <td>{r.total}</td>
                        <td>{Math.round((r.obtained / r.total) * 100)}%</td>
                        <td><strong style={{ color: '#2563eb' }}>{r.grade}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p style={{ color: '#94a3b8', fontSize: 13, padding: '20px 0' }}>No results yet. Results will appear here after your exams.</p>}
            </div>
          )}

          {/* ── NOTICES TAB ── */}
          {activeTab === 'notices' && (
            <div className="db-card">
              <div className="db-card-head"><span className="db-card-title">All Notices</span></div>
              {notices.length > 0 ? notices.map(n => (
                <div key={n.id} className="db-notice-item">
                  <div className={`db-notice-dot ${n.priority === 'high' ? 'red' : 'blue'}`} />
                  <div>
                    <div className="db-notice-title">{n.title}</div>
                    <div style={{ fontSize: 13, color: '#475569', margin: '3px 0' }}>{n.description}</div>
                    <div className="db-notice-date">{fmtShort(n.date)}</div>
                  </div>
                </div>
              )) : <p style={{ color: '#94a3b8', fontSize: 13 }}>No notices at the moment.</p>}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}