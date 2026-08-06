// src/pages/FacultyDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
  collection, getDocs, doc, updateDoc, addDoc,
  onSnapshot
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Class fee structure (USD). Update USD_TO_PKR as the exchange rate changes.
const USD_TO_PKR = 280;
const FEE_STRUCTURE = [
  { key: '3days_30', days: '3 days/week', duration: '30 minutes', one: 40, two: 35 },
  { key: '6days_30', days: '6 days/week', duration: '30 minutes', one: 65, two: 55 },
  { key: 'weekend_30', days: 'Sat - Sun', duration: '30 minutes', one: 25, two: 20 },
  { key: 'weekend_40', days: 'Sat - Sun', duration: '40 minutes', one: 30, two: 25 },
];

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [manageSection, setManageSection] = useState('overview');
  const [manageError, setManageError] = useState('');
  const [manageSuccess, setManageSuccess] = useState('');
  const [newNoticeError, setNewNoticeError] = useState('');
  const [notices, setNotices] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', description: '', priority: 'normal' });
  const [newResult, setNewResult] = useState({ exam: '', obtained: '', total: '', date: '' });
  const [progressNote, setProgressNote] = useState('');
  const [teacherNote, setTeacherNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [feeAmount, setFeeAmount] = useState('');
  const [updatingFee, setUpdatingFee] = useState(false);

  // Monthly fee assignment
  const [feeStructureChoice, setFeeStructureChoice] = useState('');
  const [feeStudentsCount, setFeeStudentsCount] = useState('1');
  const [feeMonth, setFeeMonth] = useState('');

  // Structured monthly progress
  const [progressMonth, setProgressMonth] = useState('');
  const [progressPara, setProgressPara] = useState('');
  const [progressImprovement, setProgressImprovement] = useState('');

  // Quiz
  const [newQuiz, setNewQuiz] = useState({ title: '', obtained: '', total: '' });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { navigate('/faculty-login'); return; }
    setFaculty({ email: user.email, name: user.displayName || 'Naqeeb K.' });
    fetchStudents();
    fetchNotices();
    fetchSchedule();
    return () => setLoading(false);
  }, [navigate]);

  const fetchStudents = async () => {
    try {
      const snap = await getDocs(collection(db, 'students'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(list);
      setFilteredStudents(list);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchNotices = () => {
    onSnapshot(collection(db, 'notices'), (snap) => {
      const list = snap.docs.map(d => ({
        id: d.id, ...d.data(),
        date: d.data().date?.toDate?.() || new Date()
      }));
      setNotices(list.sort((a, b) => b.date - a.date));
    });
  };

  const fetchSchedule = async () => {
    try {
      const snap = await getDocs(collection(db, 'schedule'));
      setSchedule(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
  };

  const openManageModal = (student, section = 'overview') => {
    setSelectedStudent(student);
    setManageSection(section);
    setProgressNote(student.progress || 0);
    setTeacherNote(student.teacherNote || '');
    setFeeAmount('');
    setFeeStructureChoice('');
    setFeeMonth('');
    setProgressMonth(''); setProgressPara(''); setProgressImprovement('');
    setNewResult({ exam: '', obtained: '', total: '', date: '' });
    setNewQuiz({ title: '', obtained: '', total: '' });
    setManageError('');
    setManageSuccess('');
  };

  useEffect(() => {
    const filtered = students.filter(s =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/faculty-login');
  };

  const approveStudent = async (studentId) => {
    if (!window.confirm('Approve this student?')) return;
    try {
      await updateDoc(doc(db, 'students', studentId), {
        status: 'active',
        approvedBy: faculty?.email,
        approvedAt: new Date()
      });
      await sendStudentNotification(
        studentId,
        'Account approved',
        'Your account has been approved by faculty. Welcome to the class — you can now explore the full portal.'
      );
      fetchStudents();
    } catch (err) { console.error(err); }
  };

  const declineStudent = async (studentId) => {
    if (!window.confirm('Decline this student registration?')) return;
    try {
      await updateDoc(doc(db, 'students', studentId), {
        status: 'declined',
        declinedBy: faculty?.email,
        declinedAt: new Date()
      });
      await sendStudentNotification(
        studentId,
        'Registration declined',
        'Your registration could not be approved at this time. Please contact the academy for details.'
      );
      fetchStudents();
    } catch (err) { console.error(err); }
  };

  const sendStudentNotification = async (studentId, title, description, extra = {}) => {
    try {
      await addDoc(collection(db, 'notices'), {
        title,
        description,
        date: new Date(),
        audience: [studentId],
        priority: 'normal',
        createdBy: faculty?.email || faculty?.name || 'Faculty',
        ...extra,
      });
    } catch (err) {
      console.error('Failed to send student notification', err);
    }
  };

  const handleNoticeClick = (notice) => {
    if (notice.type === 'registration' && notice.studentId) {
      const s = students.find(st => st.id === notice.studentId);
      if (s) { openManageModal(s, 'overview'); setActiveTab('students'); }
      else alert('Student record not found — it may already have been handled.');
    }
  };

  const resolveFeeSubmission = async (notice, approve) => {
    try {
      if (approve) {
        const student = students.find(s => s.id === notice.studentId);
        const newPaid = (student?.paidFee || 0) + (notice.amount || 0);
        await updateDoc(doc(db, 'students', notice.studentId), {
          paidFee: newPaid,
          feeStatus: newPaid >= (student?.totalFee || 0) ? 'paid' : 'pending',
          lastPaymentDate: new Date()
        });
        await sendStudentNotification(
          notice.studentId,
          'Payment approved',
          `Your payment of PKR ${notice.amount?.toLocaleString()} has been verified and recorded.`
        );
      } else {
        await sendStudentNotification(
          notice.studentId,
          'Payment not verified',
          `Your submitted payment of PKR ${notice.amount?.toLocaleString()} could not be verified. Please contact faculty.`
        );
      }
      await updateDoc(doc(db, 'notices', notice.id), { resolved: true });
      fetchStudents();
    } catch (err) { console.error(err); }
  };

  const updateStudentFee = async (studentId, amount) => {
    setUpdatingFee(true);
    setManageError('');
    try {
      const value = parseInt(amount);
      if (Number.isNaN(value) || value <= 0) {
        setManageError('Enter a valid payment amount.');
        return;
      }
      const student = students.find(s => s.id === studentId);
      const newPaid = (student.paidFee || 0) + value;
      await updateDoc(doc(db, 'students', studentId), {
        paidFee: newPaid,
        feeStatus: newPaid >= (student.totalFee || 0) ? 'paid' : 'pending',
        lastPaymentDate: new Date()
      });
      await sendStudentNotification(
        studentId,
        'Fee updated',
        `A payment of PKR ${value.toLocaleString()} has been recorded for your account.`
      );
      setFeeAmount('');
      setManageSuccess('Payment recorded successfully.');
      fetchStudents();
    } catch (err) {
      console.error(err);
      setManageError('Could not record payment. Please try again.');
    } finally { setUpdatingFee(false); }
  };

  const assignMonthlyFee = async (studentId) => {
    const f = FEE_STRUCTURE.find(x => x.key === feeStructureChoice);
    if (!f || !feeMonth) return;
    setManageError('');
    try {
      const usd = feeStudentsCount === '2' ? f.two : f.one;
      const pkr = usd * USD_TO_PKR;
      const student = students.find(s => s.id === studentId);
      await updateDoc(doc(db, 'students', studentId), {
        totalFee: (student?.totalFee || 0) + pkr,
        feeStatus: 'pending',
        lastFeeAssigned: { month: feeMonth, structure: f.key, studentsCount: feeStudentsCount, usd, pkr },
      });
      await sendStudentNotification(
        studentId,
        `Fee assigned — ${feeMonth}`,
        `Your fee for ${feeMonth} (${f.days}, ${f.duration}) has been set to $${usd} (~PKR ${pkr.toLocaleString()}).`
      );
      setFeeStructureChoice(''); setFeeMonth('');
      setManageSuccess('Fee assigned successfully.');
      fetchStudents();
    } catch (err) {
      console.error(err);
      setManageError('Could not assign fee. Please try again.');
    }
  };

  const saveMonthlyProgress = async (studentId) => {
    setSavingNote(true);
    setManageError('');
    try {
      const value = parseInt(progressNote);
      if (Number.isNaN(value) || value < 0 || value > 100) {
        setManageError('Enter a valid overall progress percentage between 0 and 100.');
        return;
      }
      const student = students.find(s => s.id === studentId);
      const entry = {
        month: progressMonth || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        para: progressPara || '—',
        improvement: parseInt(progressImprovement) || 0,
        note: teacherNote,
      };
      const monthlyProgress = [...(student?.monthlyProgress || []), entry];
      await updateDoc(doc(db, 'students', studentId), {
        progress: value, teacherNote, monthlyProgress, lastUpdated: new Date()
      });
      await sendStudentNotification(
        studentId,
        `Progress updated — ${entry.month}`,
        `${entry.month}: ${entry.para} para completed, improvement ${entry.improvement}%. Overall progress now ${value}%.`
      );
      setManageSuccess('Progress updated successfully.');
      setProgressMonth(''); setProgressPara(''); setProgressImprovement('');
      setSelectedStudent(null);
      fetchStudents();
    } catch (err) {
      console.error(err);
      setManageError('Could not update progress. Please try again.');
    } finally { setSavingNote(false); }
  };

  const addNotice = async () => {
    if (!newNotice.title || !newNotice.description) {
      setNewNoticeError('Title and description are required.');
      return;
    }
    try {
      await addDoc(collection(db, 'notices'), {
        ...newNotice, date: new Date(),
        audience: ['all'], createdBy: faculty?.email
      });
      setNewNotice({ title: '', description: '', priority: 'normal' });
      setNewNoticeError('');
      setShowAddNotice(false);
    } catch (err) {
      console.error(err);
      setNewNoticeError('Could not publish notice. Please try again.');
    }
  };

  const addResult = async (studentId) => {
    setManageError('');
    setManageSuccess('');
    if (!newResult.exam || !newResult.obtained || !newResult.total) {
      setManageError('Fill all result fields.');
      return;
    }
    try {
      const student = students.find(s => s.id === studentId);
      const pct = (parseInt(newResult.obtained) / parseInt(newResult.total)) * 100;
      const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'F';
      const results = [...(student.results || []), {
        ...newResult,
        obtained: parseInt(newResult.obtained),
        total: parseInt(newResult.total),
        percentage: pct, grade,
        date: newResult.date || new Date().toISOString().split('T')[0]
      }];
      await updateDoc(doc(db, 'students', studentId), { results });
      await sendStudentNotification(
        studentId,
        'New result added',
        `A new exam result has been published for you: ${newResult.exam}. Check the results tab.`
      );
      setNewResult({ exam: '', obtained: '', total: '', date: '' });
      setManageSuccess('Result added successfully.');
      fetchStudents();
    } catch (err) {
      console.error(err);
      setManageError('Could not add result. Please try again.');
    }
  };

  const addQuiz = async (studentId) => {
    setManageError('');
    if (!newQuiz.title || !newQuiz.obtained || !newQuiz.total) {
      setManageError('Fill all quiz fields.');
      return;
    }
    try {
      await addDoc(collection(db, 'quizzes'), {
        studentId,
        title: newQuiz.title,
        obtained: parseInt(newQuiz.obtained),
        total: parseInt(newQuiz.total),
        date: new Date(),
        teacherName: faculty?.name || 'Faculty',
      });
      await sendStudentNotification(
        studentId,
        'New quiz result',
        `${newQuiz.title}: ${newQuiz.obtained}/${newQuiz.total}. Check your Quiz Results tab.`
      );
      setNewQuiz({ title: '', obtained: '', total: '' });
      setManageSuccess('Quiz result added.');
    } catch (err) {
      console.error(err);
      setManageError('Could not add quiz result.');
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';

  // Stats
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const feePaidCount = students.filter(s => s.feeStatus === 'paid').length;
  const pendingApproval = students.filter(s => s.status !== 'active' && s.status !== 'declined').length;

  // Analytics data
  const registrationsByDay = (() => {
    const map = {};
    students.forEach(s => {
      const d = s.joinedAt?.toDate?.() || s.createdAt?.toDate?.();
      if (!d) return;
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  })();
  const progressByStudent = students.map(s => ({ name: s.name?.split(' ')[0] || 'S', progress: s.progress || 0 }));

  const NAV_ITEMS = [
    {key:'students', icon:'', label:'Students'},
    {key:'analytics', icon:'', label:'Analytics'},
    {key:'reports', icon:'', label:'Reports'},
    {key:'fees', icon:'', label:'Fees'},
    {key:'schedule', icon:'', label:'Schedule'},
    {key:'notices', icon:'', label:'Notices'},
  ];

  if (loading) return (
    <div className="fac-loading">
      <div className="fac-spinner" />
      <p style={{ color: '#64748b', fontSize: 14 }}>Loading dashboard...</p>
    </div>
  );

  return (
    <div className="fac-wrap">
      {/* ── SIDEBAR ── */}
      <aside className="fac-sidebar">
        <div className="fac-sidebar-brand">
          <div className="fac-brand-icon">س</div>
          <div>
            <div className="fac-brand-name">Safeer Quran<br />Academy</div>
            <div className="fac-brand-sub">Faculty Portal</div>
          </div>
        </div>

        <div className="fac-nav-section">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`fac-nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              <span className="fac-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="fac-sidebar-footer">
          <div className="fac-footer-avatar">{faculty?.name?.[0] || 'N'}</div>
          <div>
            <div className="fac-footer-name">{faculty?.name || 'Faculty'}</div>
            <div className="fac-footer-role">Faculty</div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="fac-content">
        {/* Top Bar */}
        <header className="fac-topbar">
          <div className="fac-search">
            <span className="fac-search-icon"></span>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="fac-topbar-right">
            <button className="fac-notif-btn" onClick={() => setActiveTab('notices')} title="View notices">
              🔔
              <span className="fac-notif-dot"/>
            </button>
            <div className="fac-topbar-user">
              <div className="fac-topbar-avatar">{faculty?.name?.[0] || 'N'}</div>
              <span className="fac-topbar-name">Faculty</span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'none', border: '1px solid #e2e8f0',
                borderRadius: 8, padding: '6px 12px',
                fontSize: 12, cursor: 'pointer', color: '#64748b',
                fontFamily: 'inherit', fontWeight: 600
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <div className="fac-body">
          {/* ── STUDENTS TAB ── */}
          {activeTab === 'students' && (
            <>
              {/* Banner */}
              <div className="fac-banner">
                <div>
                  <div className="fac-banner-title">Welcome back, Faculty!</div>
                  <div className="fac-banner-sub">Manage students, reports and fee status</div>
                  <div className="fac-banner-badge">
                     {new Date().toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'})} · {activeStudents} students active
                  </div>
                </div>
                <div className="fac-banner-icon"></div>
              </div>

              {/* Stats */}
              <div className="fac-stats">
                <div className="fac-stat-card">
                  <div className="fac-stat-label">Total students</div>
                  <div className="fac-stat-value">{totalStudents}</div>
                  <div className="fac-stat-sub">5 new this month</div>
                </div>
                <div className="fac-stat-card">
                  <div className="fac-stat-label">Fee paid</div>
                  <div className="fac-stat-value green">{feePaidCount}</div>
                  <div className="fac-stat-sub">PKR {(feePaidCount * 1400).toLocaleString()}</div>
                </div>
                <div className="fac-stat-card">
                  <div className="fac-stat-label">Fee unpaid</div>
                  <div className="fac-stat-value red">{totalStudents - feePaidCount}</div>
                  <div className="fac-stat-sub">Follow up needed</div>
                </div>
                <div className="fac-stat-card">
                  <div className="fac-stat-label">Pending approval</div>
                  <div className="fac-stat-value amber">{pendingApproval}</div>
                  <div className="fac-stat-sub">Action required</div>
                </div>
              </div>

              {/* Students list */}
              <div className="fac-section-head">
                <span className="fac-section-title">All Students</span>
                <span className="fac-count-badge">{filteredStudents.length} students</span>
              </div>

              {filteredStudents.map(student => (
                <div key={student.id} className="fac-student-card">
                  <div className="fac-student-top">
                    <div className="fac-student-av">
                      {student.photoURL
                        ? <img src={student.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        : (student.name?.[0] || 'S')}
                    </div>
                    <div>
                      <div className="fac-student-name">{student.name || 'Student'}</div>
                      <div className="fac-student-course">{student.course || 'No course'}</div>
                    </div>
                    <span className={`fac-status ${student.status === 'active' ? 'active' : student.status === 'declined' ? 'pending' : 'pending'}`}>
                      {student.status === 'active' ? 'Active' : student.status === 'declined' ? 'Declined' : '⏳ Pending'}
                    </span>
                  </div>

                  <div className="fac-student-meta">
                    <span>{student.email}</span>
                    <span>PKR {student.paidFee || 0} / {student.totalFee || 0}</span>
                    <span>{student.progress || 0}% progress</span>
                  </div>

                  <div className="fac-progress-bar">
                    <div className="fac-progress-fill" style={{ width: `${student.progress || 0}%` }} />
                  </div>

                  <div className="fac-student-actions">
                    {student.status !== 'active' && student.status !== 'declined' && (
                      <>
                        <button className="fac-btn approve" onClick={() => approveStudent(student.id)}>
                           Approve
                        </button>
                        <button className="fac-btn" style={{ color: '#dc2626', borderColor: '#fecaca' }} onClick={() => declineStudent(student.id)}>
                          Decline
                        </button>
                      </>
                    )}
                    <button className="fac-btn" onClick={() => openManageModal(student, 'overview')}>
                       Manage
                    </button>
                    <button className="fac-btn" onClick={() => openManageModal(student, 'fee')}>
                       Add fee
                    </button>
                    <button className="fac-btn" onClick={() => openManageModal(student, 'progress')}>
                       Update progress
                    </button>
                  </div>
                </div>
              ))}

              {filteredStudents.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No students found.
                </div>
              )}
            </>
          )}

          {/* ── NOTICES TAB ── */}
          {activeTab === 'notices' && (
            <>
              <button className="fac-add-btn" onClick={() => setShowAddNotice(true)}>
                + Add New Notice
              </button>
              {notices.map(notice => (
                <div
                  key={notice.id}
                  className={`fac-notice-card priority-${notice.priority}`}
                  onClick={() => handleNoticeClick(notice)}
                  style={{ cursor: notice.type === 'registration' ? 'pointer' : 'default' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div className="fac-notice-title">{notice.title}</div>
                    <span className="fac-notice-date">{fmt(notice.date)}</span>
                  </div>
                  <div className="fac-notice-desc">{notice.description}</div>
                  {notice.type === 'fee_submitted' && !notice.resolved && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="fac-btn approve" onClick={(e) => { e.stopPropagation(); resolveFeeSubmission(notice, true); }}>Approve</button>
                      <button className="fac-btn" onClick={(e) => { e.stopPropagation(); resolveFeeSubmission(notice, false); }}>Reject</button>
                    </div>
                  )}
                  {notice.type === 'fee_submitted' && notice.resolved && (
                    <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>✓ Resolved</span>
                  )}
                  {notice.type === 'registration' && (
                    <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>Click to review & approve</span>
                  )}
                </div>
              ))}
              {notices.length === 0 && (
                <p style={{ color: '#94a3b8', fontSize: 13 }}>No notices yet.</p>
              )}
            </>
          )}

          {/* ── SCHEDULE TAB ── */}
          {activeTab === 'schedule' && (
            <div style={{ background: '#fff', border: '1px solid #e8edf5', borderRadius: 12, padding: 24 }}>
              <div className="fac-section-head">
                <div>
                  <span className="fac-section-title">Class Schedule</span>
                  <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 13 }}>
                    Review upcoming class sessions and schedule details in one place.
                  </p>
                </div>
                <button className="fac-add-btn" style={{ margin: 0, opacity: 0.65, cursor: 'not-allowed' }} disabled>
                  + Manage
                </button>
              </div>
              <table className="fac-table">
                <thead>
                  <tr><th>Day</th><th>Time</th><th>Course</th><th>Teacher</th><th>Platform</th></tr>
                </thead>
                <tbody>
                  {schedule.length > 0 ? schedule.map(s => (
                    <tr key={s.id}>
                      <td>{s.day}</td><td>{s.time}</td>
                      <td>{s.course}</td><td>{s.teacher}</td><td>{s.platform || 'Zoom'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>No schedule found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── FEES TAB ── */}
          {activeTab === 'fees' && (
            <div style={{ background: '#fff', border: '1px solid #e8edf5', borderRadius: 12, padding: 24 }}>
              <div className="fac-section-title" style={{ marginBottom: 12 }}>Class fee structure (reference)</div>
              <table className="fac-table" style={{ marginBottom: 24 }}>
                <thead>
                  <tr><th>Days/Week</th><th>Duration</th><th>One Student</th><th>Two Students</th></tr>
                </thead>
                <tbody>
                  {FEE_STRUCTURE.map(f => (
                    <tr key={f.key}>
                      <td>{f.days}</td>
                      <td>{f.duration}</td>
                      <td>${f.one} (~PKR {(f.one * USD_TO_PKR).toLocaleString()})</td>
                      <td>${f.two} (~PKR {(f.two * USD_TO_PKR).toLocaleString()})</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="fac-section-title"style={{marginBottom: 16}}>Fee Overview</div>
              <table className="fac-table">
                <thead>
                  <tr><th>Student</th><th>Course</th><th>Total</th><th>Paid</th><th>Remaining</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.course}</td>
                      <td>PKR {s.totalFee || 0}</td>
                      <td style={{ color: '#16a34a', fontWeight: 600 }}>PKR {s.paidFee || 0}</td>
                      <td style={{ color: '#dc2626' }}>PKR {(s.totalFee || 0) - (s.paidFee || 0)}</td>
                      <td>
                        <span className={`fac-status ${s.feeStatus === 'paid' ? 'active' : 'pending'}`}>
                          {s.feeStatus ==='paid'?'Paid':'⏳ Pending'}
                        </span>
                      </td>
                      <td>
                        <button className="fac-btn" onClick={() => openManageModal(s, 'fee')}>
                          Manage fee
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {activeTab === 'analytics' && (
            <div style={{ background: '#fff', border: '1px solid #e8edf5', borderRadius: 12, padding: 24 }}>
              <div className="fac-section-title" style={{ marginBottom: 12 }}>Registrations over time</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={registrationsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis allowDecimals={false} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="fac-section-title" style={{ margin: '24px 0 12px' }}>Student progress overview</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={progressByStudent}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis domain={[0, 100]} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── REPORTS TAB ── */}
          {activeTab === 'reports' && (
            <div style={{ background: '#fff', border: '1px solid #e8edf5', borderRadius: 12, padding: 24 }}>
              <div className="fac-section-title"style={{marginBottom: 16}}>Student Results</div>
              {students.filter(s => s.results?.length > 0).map(student => (
                <div key={student.id} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                    {student.name} — {student.course}
                  </div>
                  <table className="fac-table">
                    <thead>
                      <tr><th>Exam</th><th>Date</th><th>Marks</th><th>Grade</th></tr>
                    </thead>
                    <tbody>
                      {student.results.map((r, i) => (
                        <tr key={i}>
                          <td>{r.exam}</td><td>{r.date}</td>
                          <td>{r.obtained}/{r.total}</td>
                          <td><strong style={{ color: '#2563eb' }}>{r.grade}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MANAGE STUDENT MODAL ── */}
      {selectedStudent && (
        <div className="fac-modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="fac-modal" onClick={e => e.stopPropagation()}>
            <h3>{manageSection === 'fee' ? 'Manage Fee' : 'Manage'}: {selectedStudent.name}</h3>

            {/* Section switcher — Manage and Fees are separate views, not shown together */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                type="button"
                className={`fac-btn ${manageSection !== 'fee' ? 'approve' : ''}`}
                onClick={() => setManageSection('overview')}
              >
                Manage
              </button>
              <button
                type="button"
                className={`fac-btn ${manageSection === 'fee' ? 'approve' : ''}`}
                onClick={() => setManageSection('fee')}
              >
                Fees
              </button>
            </div>

            {manageSection !== 'fee' && (
              <>
                <div className="fac-modal-section">
                  <h4>Monthly Progress Update</h4>
                  <input type="text" placeholder="Month (e.g. March 2026)" value={progressMonth} onChange={e => setProgressMonth(e.target.value)} />
                  <input type="text" placeholder="Para completed (e.g. 2.5)" value={progressPara} onChange={e => setProgressPara(e.target.value)} />
                  <input type="number" placeholder="Improvement %" value={progressImprovement} onChange={e => setProgressImprovement(e.target.value)} />
                  <input
                    type="number" placeholder="Overall progress %" min="0" max="100"
                    defaultValue={selectedStudent.progress}
                    onChange={e => setProgressNote(e.target.value)}
                  />
                  <textarea
                    placeholder="Teacher's note..."
                    defaultValue={selectedStudent.teacherNote}
                    onChange={e => setTeacherNote(e.target.value)}
                    rows="3"
                  />
                  <button className="fac-btn primary" onClick={() => saveMonthlyProgress(selectedStudent.id)} disabled={savingNote}>
                    {savingNote ?'Saving...':'Save Progress & Note'}
                  </button>
                </div>

                <div className="fac-modal-section">
                  <h4>Add Result</h4>
                  <input type="text" placeholder="Exam name" onChange={e => setNewResult({ ...newResult, exam: e.target.value })} />
                  <input type="number" placeholder="Obtained marks" onChange={e => setNewResult({ ...newResult, obtained: e.target.value })} />
                  <input type="number" placeholder="Total marks" onChange={e => setNewResult({ ...newResult, total: e.target.value })} />
                  <input type="date" onChange={e => setNewResult({ ...newResult, date: e.target.value })} />
                  <button className="fac-btn primary" onClick={() => addResult(selectedStudent.id)}>
                     Add Result
                  </button>
                </div>

                <div className="fac-modal-section" style={{ borderBottom: 'none' }}>
                  <h4>Add Quiz Result</h4>
                  <input type="text" placeholder="Quiz title" value={newQuiz.title} onChange={e => setNewQuiz({ ...newQuiz, title: e.target.value })} />
                  <input type="number" placeholder="Obtained marks" value={newQuiz.obtained} onChange={e => setNewQuiz({ ...newQuiz, obtained: e.target.value })} />
                  <input type="number" placeholder="Total marks" value={newQuiz.total} onChange={e => setNewQuiz({ ...newQuiz, total: e.target.value })} />
                  <button className="fac-btn primary" onClick={() => addQuiz(selectedStudent.id)}>
                     Add Quiz
                  </button>
                </div>
              </>
            )}

            {manageSection === 'fee' && (
              <div className="fac-modal-section" style={{ borderBottom: 'none' }}>
                <h4>Assign Monthly Fee</h4>
                <select value={feeStructureChoice} onChange={e => setFeeStructureChoice(e.target.value)}>
                  <option value="">Select class structure</option>
                  {FEE_STRUCTURE.map(f => (
                    <option key={f.key} value={f.key}>{f.days} · {f.duration}</option>
                  ))}
                </select>
                <select value={feeStudentsCount} onChange={e => setFeeStudentsCount(e.target.value)}>
                  <option value="1">One student</option>
                  <option value="2">Two students (shared)</option>
                </select>
                <input type="text" placeholder="Month (e.g. March 2026)" value={feeMonth} onChange={e => setFeeMonth(e.target.value)} />
                {feeStructureChoice && (() => {
                  const f = FEE_STRUCTURE.find(x => x.key === feeStructureChoice);
                  const usd = feeStudentsCount === '2' ? f.two : f.one;
                  const pkr = usd * USD_TO_PKR;
                  return <p style={{ fontSize: 13, color: '#475569', margin: '6px 0' }}>Monthly fee: ${usd} (~PKR {pkr.toLocaleString()})</p>;
                })()}
                <button className="fac-btn primary" onClick={() => assignMonthlyFee(selectedStudent.id)} disabled={!feeStructureChoice || !feeMonth}>
                  Assign Fee
                </button>

                <h4 style={{ marginTop: 16 }}>Record Manual Payment</h4>
                <p style={{ fontSize: 13, marginBottom: 8, color: '#64748b' }}>
                  Total: PKR {selectedStudent.totalFee || 0} · Paid: PKR {selectedStudent.paidFee || 0} · Remaining: PKR {(selectedStudent.totalFee || 0) - (selectedStudent.paidFee || 0)}
                </p>
                <input
                  type="number" placeholder="Payment amount (PKR)"
                  value={feeAmount}
                  onChange={e => setFeeAmount(e.target.value)}
                />
                <button className="fac-btn primary" onClick={() => updateStudentFee(selectedStudent.id, feeAmount)} disabled={updatingFee}>
                  {updatingFee ?'Updating...':'Record Payment'}
                </button>
              </div>
            )}

            {manageError && <div className="db-error-msg" style={{ marginTop: 10 }}>{manageError}</div>}
            {manageSuccess && <div className="db-success-msg" style={{ marginTop: 10 }}>{manageSuccess}</div>}

            <button className="fac-modal-close" onClick={() => setSelectedStudent(null)}>✕ Close</button>
          </div>
        </div>
      )}

      {/* ── ADD NOTICE MODAL ── */}
      {showAddNotice && (
        <div className="fac-modal-overlay" onClick={() => setShowAddNotice(false)}>
          <div className="fac-modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Notice</h3>
            <input type="text" placeholder="Title" value={newNotice.title}
              onChange={e => setNewNotice({ ...newNotice, title: e.target.value })} />
            <textarea placeholder="Description" value={newNotice.description}
              onChange={e => setNewNotice({ ...newNotice, description: e.target.value })} rows="4" />
            <select value={newNotice.priority}
              onChange={e => setNewNotice({ ...newNotice, priority: e.target.value })}>
              <option value="normal">Normal</option>
              <option value="high">High Priority</option>
            </select>
            {newNoticeError && <div className="db-error-msg">{newNoticeError}</div>}
            <button className="fac-btn primary" onClick={addNotice} style={{ width: '100%', padding: '10px' }}>
               Publish Notice
            </button>
            <button className="fac-modal-close" onClick={() => setShowAddNotice(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}