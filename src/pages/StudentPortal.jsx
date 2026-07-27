import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import quranBg from '../assets/quran-bg.jpg';
import academyLogo from '../assets/logo.png';

const COURSES = ['Noorani Qaida','Nazira Quran','Hifz ul Quran','Tajweed ul Quran','Islamic Studies','Arabic Language'];

function firebaseMsg(code) {
  const map = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Please enter a valid email.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/network-request-failed': 'Network error. Check your internet.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

export default function StudentPortal() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [globalErr, setGlobalErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({ name:'', email:'', course:'', password:'', confirm:'' });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: '' }));
    setGlobalErr(''); setSuccessMsg('');
  };

  const switchMode = (m) => {
    setMode(m); setErrors({}); setGlobalErr('');
    setSuccessMsg(''); setSubmitted(false); setLoading(false);
  };

  const validate = () => {
    const e = {};
    if (mode === 'login') {
      if (!form.email.trim()) e.email = 'Email is required';
      if (!form.password.trim()) e.password = 'Password is required';
    }
    if (mode === 'signup') {
      if (!form.name.trim()) e.name = 'Full name is required';
      if (!form.email.trim()) e.email = 'Email is required';
      if (!form.course) e.course = 'Please select a course';
      if (!form.password.trim()) e.password = 'Password is required';
      if (form.password.length < 6) e.password = 'Minimum 6 characters';
      if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    }
    if (mode === 'forgot') {
      if (!form.email.trim()) e.email = 'Email is required';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setGlobalErr(''); setSuccessMsg('');
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
        await updateProfile(cred.user, { displayName: form.name.trim() });
        await setDoc(doc(db, 'students', cred.user.uid), {
          uid: cred.user.uid,
          name: form.name.trim(),
          email: form.email.trim(),
          course: form.course,
          status: 'pending',
          feeStatus: 'pending',
          joinedAt: serverTimestamp(),
        });
        await signOut(auth);
        setSuccessMsg('Account created! Please sign in to continue.');
        setTimeout(() => switchMode('login'), 3000);
      }
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
        navigate('/dashboard');
      }
      if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, form.email.trim());
        setSubmitted(true);
      }
    } catch (err) {
      setGlobalErr(firebaseMsg(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sp-wrapper" style={{ backgroundImage: `url(${quranBg})` }}>
      <Link to="/" className="sp-back">← Back to Website</Link>
      <div className="sp-card">
        <div className="sp-bismillah">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
        <div className="sp-brand">
          <img src={academyLogo} alt="Safeer Quran Academy" className="sp-logo" />
          <div className="sp-brand-sub">Student Portal</div>
        </div>
        <div className="sp-divider" />

        {submitted && mode === 'forgot' ? (
          <div className="sp-success">
            <div className="sp-success-icon"></div>
            <h2 className="sp-success-title">Email Sent!</h2>
            <p>Password reset email sent. Check your inbox.</p>
            <button className="sp-submit" style={{ marginTop: 16 }} onClick={() => switchMode('login')}>Back to Login</button>
          </div>
        ) : (
          <>
            {mode !== 'forgot' && (
              <div className="sp-tabs">
                <button className={`sp-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>Sign In</button>
                <button className={`sp-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => switchMode('signup')}>Register</button>
              </div>
            )}

            <h2 className="sp-title">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h2>

            {globalErr &&<div className="sp-global-err">{globalErr}</div>}
            {successMsg && <div className="sp-success-alert">{successMsg}</div>}

            <form className="sp-form" onSubmit={handleSubmit} noValidate>

              {/* SIGNUP ONLY */}
              {mode === 'signup' && (
                <>
                  <div className="sp-field">
                    <label>Full Name</label>
                    <div className="sp-input-wrap">
                      <span className="sp-field-icon"></span>
                      <input type="text" placeholder="Muhammad Ahmed" value={form.name} onChange={set('name')} disabled={loading} />
                    </div>
                    {errors.name && <span className="sp-error">{errors.name}</span>}
                  </div>

                  <div className="sp-field">
                    <label>Select Course</label>
                    <div className="sp-input-wrap">
                      <span className="sp-field-icon"></span>
                      <select value={form.course} onChange={set('course')} disabled={loading}>
                        <option value="">-- Select Course --</option>
                        {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    {errors.course && <span className="sp-error">{errors.course}</span>}
                  </div>
                </>
              )}

              {/* EMAIL */}
              <div className="sp-field">
                <label>Email</label>
                <div className="sp-input-wrap">
                  <span className="sp-field-icon"></span>
                  <input type="email" placeholder="email@example.com" value={form.email} onChange={set('email')} disabled={loading} autoComplete="email" />
                </div>
                {errors.email && <span className="sp-error">{errors.email}</span>}
              </div>

              {/* PASSWORD */}
              {mode !== 'forgot' && (
                <div className="sp-field">
                  <label>Password</label>
                  <div className="sp-input-wrap">
                    <span className="sp-field-icon"></span>
                    <input type={showPass ? 'text' : 'password'} placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter password'} value={form.password} onChange={set('password')} disabled={loading} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                    <button type="button"className="sp-eye"onClick={() =>setShowPass(s =>!s)}>{showPass ?'':''}</button>
                  </div>
                  {errors.password && <span className="sp-error">{errors.password}</span>}
                </div>
              )}

              {/* CONFIRM PASSWORD */}
              {mode === 'signup' && (
                <div className="sp-field">
                  <label>Confirm Password</label>
                  <div className="sp-input-wrap">
                    <span className="sp-field-icon"></span>
                    <input type={showPass ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirm} onChange={set('confirm')} disabled={loading} />
                  </div>
                  {errors.confirm && <span className="sp-error">{errors.confirm}</span>}
                </div>
              )}

              {mode === 'login' && (
                <div className="sp-login-extras">
                  <button type="button" className="sp-forgot-link" onClick={() => switchMode('forgot')}>Forgot Password?</button>
                </div>
              )}

              {mode === 'forgot' && (
                <button type="button" className="sp-forgot-link" style={{ marginBottom: 10 }} onClick={() => switchMode('login')}>← Back to Sign In</button>
              )}

              <button type="submit" className="sp-submit" disabled={loading}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : mode === 'signup' ? 'Create Account →' : 'Send Reset Link →'}
              </button>

              {mode !== 'forgot' && (
                <button
                  type="button"
                  className="faculty-back-btn"
                  style={{ marginTop: 12 }}
                  onClick={() => navigate('/')}
                >
                  ← Back to Home
                </button>
              )}

            </form>
          </>
        )}
      </div>
    </div>
  );
}