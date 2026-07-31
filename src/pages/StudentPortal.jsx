import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
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
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [globalErr, setGlobalErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({ name: '', email: '', course: '', password: '', confirm: '' });
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

  const rightActive = mode === 'signup';

  return (
    <div className="dp-wrapper">
      <div className="dp-ocean">
        <div className="dp-wave"></div>
        <div className="dp-wave"></div>
      </div>

      <Link to="/" className="dp-back">← Back to Website</Link>

      <div className={`dp-container ${rightActive ? 'right-panel-active' : ''}`}>

        {/* ================= SIGN UP PANEL ================= */}
        <div className="dp-form-container dp-sign-up-container">
          <form className="dp-form" onSubmit={handleSubmit} noValidate>
            <img src={academyLogo} alt="Safeer Quran Academy" className="dp-logo" />
            <h1>Create Account</h1>
            <span className="dp-bismillah">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</span>

            {mode === 'signup' && globalErr && <div className="dp-error-box">{globalErr}</div>}
            {mode === 'signup' && successMsg && <div className="dp-success-box">{successMsg}</div>}

            <div className="dp-field">
              <label>Full Name</label>
              <input type="text" placeholder="Muhammad Ahmed" value={form.name} onChange={set('name')} disabled={loading} />
              {errors.name && <span className="dp-error-text">{errors.name}</span>}
            </div>

            <div className="dp-field">
              <label>Select Course</label>
              <select value={form.course} onChange={set('course')} disabled={loading}>
                <option value="">-- Select Course --</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.course && <span className="dp-error-text">{errors.course}</span>}
            </div>

            <div className="dp-field">
              <label>Email</label>
              <input type="email" placeholder="email@example.com" value={form.email} onChange={set('email')} disabled={loading} autoComplete="email" />
              {errors.email && <span className="dp-error-text">{errors.email}</span>}
            </div>

            <div className="dp-field">
              <label>Password</label>
              <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} disabled={loading} autoComplete="new-password" />
              {errors.password && <span className="dp-error-text">{errors.password}</span>}
            </div>

            <div className="dp-field">
              <label>Confirm Password</label>
              <input type={showPass ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirm} onChange={set('confirm')} disabled={loading} />
              {errors.confirm && <span className="dp-error-text">{errors.confirm}</span>}
            </div>

            <button type="button" className="dp-link-btn" onClick={() => setShowPass(s => !s)}>
              {showPass ? 'Hide password' : 'Show password'}
            </button>

            <button type="submit" className="dp-btn" disabled={loading}>
              {loading ? 'Please wait…' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* ================= SIGN IN / FORGOT PANEL ================= */}
        <div className="dp-form-container dp-sign-in-container">
          {mode === 'forgot' ? (
            submitted ? (
              <div className="dp-form">
                <img src={academyLogo} alt="Safeer Quran Academy" className="dp-logo" />
                <h1>Email Sent!</h1>
                <p className="dp-form-sub">Password reset email sent. Check your inbox.</p>
                <button className="dp-btn" onClick={() => switchMode('login')}>Back to Login</button>
              </div>
            ) : (
              <form className="dp-form" onSubmit={handleSubmit} noValidate>
                <img src={academyLogo} alt="Safeer Quran Academy" className="dp-logo" />
                <h1>Reset Password</h1>
                <span className="dp-bismillah">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</span>

                {globalErr && <div className="dp-error-box">{globalErr}</div>}

                <div className="dp-field">
                  <label>Email</label>
                  <input type="email" placeholder="email@example.com" value={form.email} onChange={set('email')} disabled={loading} autoComplete="email" />
                  {errors.email && <span className="dp-error-text">{errors.email}</span>}
                </div>

                <button type="submit" className="dp-btn" disabled={loading}>
                  {loading ? 'Please wait…' : 'Send Reset Link'}
                </button>

                <button type="button" className="dp-link-btn" onClick={() => switchMode('login')}>
                  ← Back to Sign In
                </button>
              </form>
            )
          ) : (
            <form className="dp-form" onSubmit={handleSubmit} noValidate>
              <img src={academyLogo} alt="Safeer Quran Academy" className="dp-logo" />
              <h1>Welcome Back</h1>
              <span className="dp-bismillah">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</span>

              {mode === 'login' && globalErr && <div className="dp-error-box">{globalErr}</div>}
              {mode === 'login' && successMsg && <div className="dp-success-box">{successMsg}</div>}

              <div className="dp-field">
                <label>Email</label>
                <input type="email" placeholder="email@example.com" value={form.email} onChange={set('email')} disabled={loading} autoComplete="email" />
                {errors.email && <span className="dp-error-text">{errors.email}</span>}
              </div>

              <div className="dp-field">
                <label>Password</label>
                <input type={showPass ? 'text' : 'password'} placeholder="Enter password" value={form.password} onChange={set('password')} disabled={loading} autoComplete="current-password" />
                {errors.password && <span className="dp-error-text">{errors.password}</span>}
              </div>

              <button type="button" className="dp-link-btn" onClick={() => switchMode('forgot')}>
                Forgot your password?
              </button>

              <button type="submit" className="dp-btn" disabled={loading}>
                {loading ? 'Please wait…' : 'Sign In'}
              </button>
            </form>
          )}
        </div>

        {/* ================= OVERLAY (hidden on mobile, see CSS) ================= */}
        <div className="dp-overlay-container">
          <div className="dp-overlay">
            <div className="dp-overlay-panel dp-overlay-left">
              <h1>Welcome Back!</h1>
              <p>Sign in here if you already have an account with Safeer Quran Academy.</p>
              <button className="dp-ghost" onClick={() => switchMode('login')}>Sign In</button>
            </div>
            <div className="dp-overlay-panel dp-overlay-right">
              <h1>New Here?</h1>
              <p>Register now and begin your journey of learning the Holy Quran with us.</p>
              <button className="dp-ghost" onClick={() => switchMode('signup')}>Sign Up</button>
            </div>
          </div>
        </div>

        {/* Mobile-only tab switcher (overlay is hidden on small screens) */}
        <div className="dp-tabs-mobile">
          <button className={mode !== 'signup' ? 'active' : ''} onClick={() => switchMode('login')}>Sign In</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}