// src/pages/FacultyDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
  collection, getDocs, doc, updateDoc, addDoc,
  onSnapshot
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';

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
    setNewResult({ exam: '', obtained: '', total: '', date: '' });
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
        'Your account has been approved by faculty. Welcome to the class!'
      );
      fetchStudents();
    } catch (err) { console.error(err); }
  };

  const sendStudentNotification = async (studentId, title, description) => {
    try {
      await addDoc(collection(db, 'notices'), {
        title,
        description,
        date: new Date(),
        audience: [studentId],
        priority: 'normal',
        createdBy: faculty?.email || faculty?.name || 'Faculty',
      });
    } catch (err) {
      console.error('Failed to send student notification', err);
    }
  };

  const updateStudentProgress = async (studentId, progress) => {
    setSavingNote(true);
    setManageError('');
    try {
      const value = parseInt(progress);
      if (Number.isNaN(value) || value < 0 || value > 100) {
        setManageError('Enter a valid progress percentage between 0 and 100.');
        return;
      }
      await updateDoc(doc(db, 'students', studentId), {
        progress: value,
        teacherNote,
        lastUpdated: new Date()
      });
      await sendStudentNotification(
        studentId,
        'Progress updated',
        `Your progress has been updated to ${value}% by your teacher.`
      );
      setManageSuccess('Progress updated successfully.');
      setSelectedStudent(null);
      fetchStudents();
    } catch (err) {
      console.error(err);
      setManageError('Could not update progress. Please try again.');
    } finally { setSavingNote(false); }
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
        `A payment of PKR ${value} has been recorded for your account.`
      );
      setFeeAmount('');
      setManageSuccess('Payment recorded successfully.');
      fetchStudents();
    } catch (err) {
      console.error(err);
      setManageError('Could not record payment. Please try again.');
    } finally { setUpdatingFee(false); }
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

  const fmt = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';

  // Stats
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const feePaidCount = students.filter(s => s.feeStatus === 'paid').length;
  const pendingApproval = students.filter(s => s.status !== 'active').length;

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
                    <div className="fac-student-av">{student.name?.[0] || 'S'}</div>
                    <div>
                      <div className="fac-student-name">{student.name || 'Student'}</div>
                      <div className="fac-student-course">{student.course || 'No course'}</div>
                    </div>
                    <span className={`fac-status ${student.status === 'active' ? 'active' : 'pending'}`}>
                      {student.status ==='active'?'Active':'⏳ Pending'}
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
                    {student.status !== 'active' && (
                      <button className="fac-btn approve" onClick={() => approveStudent(student.id)}>
                         Approve
                      </button>
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
                <div key={notice.id} className={`fac-notice-card priority-${notice.priority}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div className="fac-notice-title">{notice.title}</div>
                    <span className="fac-notice-date">{fmt(notice.date)}</span>
                  </div>
                  <div className="fac-notice-desc">{notice.description}</div>
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
              <div className="fac-section-title"style={{marginBottom: 16}}>Fee Overview</div>
              <table className="fac-table">
                <thead>
                  <tr><th>Student</th><th>Course</th><th>Total</th><th>Paid</th><th>Remaining</th><th>Status</th></tr>
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
                          Record payment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── RESULTS / ANALYTICS TAB ── */}
          {(activeTab === 'analytics' || activeTab === 'reports') && (
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
            <h3>Manage: {selectedStudent.name}</h3>

            <div className="fac-modal-section">
              <h4>Progress & Notes</h4>
              <input
                type="number" placeholder="Progress %" min="0" max="100"
                defaultValue={selectedStudent.progress}
                onChange={e => setProgressNote(e.target.value)}
              />
              <textarea
                placeholder="Teacher's note..."
                defaultValue={selectedStudent.teacherNote}
                onChange={e => setTeacherNote(e.target.value)}
                rows="3"
              />
              <button className="fac-btn primary" onClick={() => updateStudentProgress(selectedStudent.id, progressNote)} disabled={savingNote}>
                {savingNote ?'Saving...':'Save Progress & Note'}
              </button>
            </div>

            <div className="fac-modal-section">
              <h4>Fee Management</h4>
              <p style={{ fontSize: 13, marginBottom: 8, color: '#64748b' }}>
                Total: PKR {selectedStudent.totalFee} · Paid: PKR {selectedStudent.paidFee || 0} · Remaining: PKR {(selectedStudent.totalFee || 0) - (selectedStudent.paidFee || 0)}
              </p>
              <input
                type="number" placeholder="Payment amount"
                value={feeAmount}
                onChange={e => setFeeAmount(e.target.value)}
              />
              <button className="fac-btn primary" onClick={() => updateStudentFee(selectedStudent.id, feeAmount)} disabled={updatingFee}>
                {updatingFee ?'Updating...':'Record Payment'}
              </button>
            </div>

            <div className="fac-modal-section" style={{ borderBottom: 'none' }}>
              <h4>Add Result</h4>
              <input type="text" placeholder="Exam name" onChange={e => setNewResult({ ...newResult, exam: e.target.value })} />
              <input type="number" placeholder="Obtained marks" onChange={e => setNewResult({ ...newResult, obtained: e.target.value })} />
              <input type="number" placeholder="Total marks" onChange={e => setNewResult({ ...newResult, total: e.target.value })} />
              <input type="date" onChange={e => setNewResult({ ...newResult, date: e.target.value })} />
              <button className="fac-btn primary" onClick={() => addResult(selectedStudent.id)}>
                 Add Result
              </button>
            </div>

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