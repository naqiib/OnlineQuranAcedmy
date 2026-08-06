// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import {
  doc, getDoc, collection, query,
  where, getDocs, onSnapshot, updateDoc, addDoc,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// Class fee structure (USD). Update USD_TO_PKR as the exchange rate changes.
const USD_TO_PKR = 280;
const FEE_STRUCTURE = [
  { key: '3days_30', days: '3 days/week', duration: '30 minutes', one: 40, two: 35 },
  { key: '6days_30', days: '6 days/week', duration: '30 minutes', one: 65, two: 55 },
  { key: 'weekend_30', days: 'Sat - Sun', duration: '30 minutes', one: 25, two: 20 },
  { key: 'weekend_40', days: 'Sat - Sun', duration: '40 minutes', one: 30, two: 25 },
];
const RECOMMENDED_TEACHER = {
  Female: 'Shahana Safir',
  Male: 'Hafiz Safeer Khan',
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);

  const [teacherChoice, setTeacherChoice] = useState('');
  const [savingTeacher, setSavingTeacher] = useState(false);

  const [feeAmount, setFeeAmount] = useState('');
  const [submittingFee, setSubmittingFee] = useState(false);

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
          setTeacherChoice(data.teacherId || '');
        }
        const tSnap = await getDocs(collection(db, 'teachers'));
        setTeachers(tSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const aSnap = await getDocs(query(collection(db, 'attendance'), where('studentId', '==', user.uid)));
        setAttendance(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const qSnap = await getDocs(query(collection(db, 'quizzes'), where('studentId', '==', user.uid)));
        setQuizzes(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (!student?.course) return;
    const unsub = onSnapshot(collection(db, 'notices'), snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data(), date: d.data().date?.toDate?.() || new Date() }));
      setNotices(all.filter(n =>
        n.audience?.includes('all') ||
        n.audience?.includes(student.course) ||
        n.audience?.includes(student.id)
      ).sort((a, b) => b.date - a.date));
    });
    return unsub;
  }, [student?.course, student?.id]);

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

  const sendFacultyNotification = async (title, description, extra = {}) => {
    try {
      await addDoc(collection(db, 'notices'), {
        title,
        description,
        date: new Date(),
        audience: ['faculty'],
        priority: 'normal',
        createdBy: student?.email || student?.name || 'Student',
        ...extra,
      });
    } catch (err) {
      console.error('Failed to send faculty notification', err);
    }
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    setProfileError('');
    try {
      await updateDoc(doc(db, 'students', student.id), {
        phone: editForm.phone, country: editForm.country,
        gender: editForm.gender, dob: editForm.dob, name: editForm.name,
      });
      setStudent(prev => ({ ...prev, ...editForm }));
      setEditMode(false);
      setProfileSuccess('Profile updated successfully!');
      await sendFacultyNotification(
        'Student profile updated',
        `${editForm.name || student.name} updated their profile details. Please review the changes.`,
        { type: 'profile_update', studentId: student.id }
      );
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setProfileError('Unable to save profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;
    setPhotoUploading(true);
    setProfileError('');
    try {
      const fileRef = storageRef(storage, `profile-photos/${student.id}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await updateDoc(doc(db, 'students', student.id), { photoURL: url });
      setStudent(prev => ({ ...prev, photoURL: url }));
    } catch (err) {
      console.error(err);
      setProfileError('Could not upload photo. Please try again.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleTeacherSave = async () => {
    if (!teacherChoice) return;
    setSavingTeacher(true);
    try {
      const chosen = teachers.find(t => t.id === teacherChoice);
      await updateDoc(doc(db, 'students', student.id), { teacherId: teacherChoice });
      setStudent(prev => ({ ...prev, teacherId: teacherChoice }));
      await sendFacultyNotification(
        'Teacher preference selected',
        `${student.name} selected ${chosen?.name || 'a teacher'} as their preferred teacher.`,
        { type: 'teacher_selected', studentId: student.id }
      );
    } catch (err) { console.error(err); }
    finally { setSavingTeacher(false); }
  };

  const handleFeeSubmit = async () => {
    const amount = parseInt(feeAmount);
    if (!amount || amount <= 0) { setProfileError('Enter a valid amount.'); return; }
    setSubmittingFee(true);
    setProfileError('');
    try {
      await addDoc(collection(db, 'notices'), {
        title: 'Fee submitted for verification',
        description: `${student.name} submitted PKR ${amount.toLocaleString()} for verification.`,
        date: new Date(),
        audience: ['faculty'],
        priority: 'high',
        type: 'fee_submitted',
        studentId: student.id,
        amount,
        resolved: false,
        createdBy: student.email || student.name,
      });
      setFeeAmount('');
      setProfileSuccess('Fee submitted. It will stay pending until faculty approves it.');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setProfileError('Could not submit fee. Please try again.');
    } finally {
      setSubmittingFee(false);
    }
  };

  const setEF = (field) => (e) => setEditForm(p => ({ ...p, [field]: e.target.value }));

  const NAV_ITEMS = [
    {key:'dashboard', icon:'', label:'Dashboard'},
    {key:'profile', icon:'', label:'Profile'},
    {key:'courses', icon:'', label:'Courses'},
    {key:'payment', icon:'', label:'Payment'},
    {key:'attendance', icon:'', label:'Attendance'},
    {key:'results', icon:'', label:'Results'},
    {key:'quiz', icon:'', label:'Quiz Results'},
    {key:'notices', icon:'', label:'Notices'},
  ];

  const Avatar = ({ size = 36, fontSize = 14 }) => (
    student?.photoURL ? (
      <img src={student.photoURL} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
    ) : (
      <span>{student?.name?.[0] || 'S'}</span>
    )
  );

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
          <div className="db-footer-avatar"><Avatar /></div>
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
            <button className="db-notif-btn" onClick={() => setActiveTab('notices')} title="View notices">
              🔔
              <span className="db-notif-dot"/>
            </button>
            <div className="db-topbar-user">
              <div className="db-topbar-avatar"><Avatar /></div>
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
                      <button type="button" className="db-save-btn" onClick={handleProfileSave} disabled={savingProfile}>
                        {savingProfile ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" className="db-cancel-btn" onClick={() => setEditMode(false)}>✕</button>
                    </div>
                }
              </div>
              {profileSuccess && <div className="db-success-msg">{profileSuccess}</div>}
              {profileError && <div className="db-error-msg">{profileError}</div>}

              {/* Profile picture */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#64748b' }}>
                  {student?.photoURL
                    ? <img src={student.photoURL} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (student?.name?.[0] || 'S')}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>
                    {photoUploading ? 'Uploading...' : 'Change display picture'}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} disabled={photoUploading} />
                  </label>
                </div>
              </div>

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

              {/* Teacher selection — only once approved */}
              {student?.status === 'active' && (
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
                  <div className="db-card-title" style={{ marginBottom: 10, fontSize: 13 }}>Select your teacher</div>
                  <select className="db-profile-input" value={teacherChoice} onChange={e => setTeacherChoice(e.target.value)}>
                    <option value="">Select teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  {student?.gender && RECOMMENDED_TEACHER[student.gender] && (
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                      Recommended for you: {RECOMMENDED_TEACHER[student.gender]}
                    </p>
                  )}
                  <button className="db-save-btn" style={{ marginTop: 10 }} onClick={handleTeacherSave} disabled={savingTeacher || !teacherChoice}>
                    {savingTeacher ? 'Saving...' : 'Save teacher preference'}
                  </button>
                </div>
              )}
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

              {student?.monthlyProgress?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div className="db-card-title" style={{ marginBottom: 8, fontSize: 13 }}>Monthly progress</div>
                  {student.monthlyProgress.slice().reverse().map((m, i) => (
                    <div key={i} className="db-notice-item">
                      <div className="db-notice-dot blue" />
                      <div>
                        <div className="db-notice-title">{m.month}: {m.para} para completed</div>
                        <div className="db-notice-date">Improvement: {m.improvement}%{m.note ? ` — ${m.note}` : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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

              {student?.status === 'active' && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                  <div className="db-card-title" style={{ fontSize: 13, marginBottom: 8 }}>Submit a payment</div>
                  {profileSuccess && <div className="db-success-msg">{profileSuccess}</div>}
                  {profileError && <div className="db-error-msg">{profileError}</div>}
                  <input className="db-profile-input" type="number" placeholder="Amount paid (PKR)" value={feeAmount} onChange={e => setFeeAmount(e.target.value)} />
                  <button className="db-save-btn" style={{ marginTop: 8 }} onClick={handleFeeSubmit} disabled={submittingFee}>
                    {submittingFee ? 'Submitting...' : 'Submit Fee for Verification'}
                  </button>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Status stays pending until faculty approves your submission.</p>
                </div>
              )}
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

          {/* ── QUIZ TAB ── */}
          {activeTab === 'quiz' && (
            <div className="db-card">
              <div className="db-card-head"><span className="db-card-title">Quiz Results</span></div>
              {quizzes.length > 0 ? (
                <table className="db-table">
                  <thead><tr><th>Quiz</th><th>Date</th><th>Marks</th><th>Total</th><th>%</th></tr></thead>
                  <tbody>
                    {quizzes.map(q => (
                      <tr key={q.id}>
                        <td>{q.title}</td>
                        <td>{fmtShort(q.date?.toDate?.() || q.date)}</td>
                        <td>{q.obtained}</td>
                        <td>{q.total}</td>
                        <td>{Math.round((q.obtained / q.total) * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p style={{ color: '#94a3b8', fontSize: 13, padding: '20px 0' }}>No quizzes yet.</p>}
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