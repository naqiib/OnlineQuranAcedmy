// src/pages/FacultyLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import academyLogo from '../assets/logo.png';

export default function FacultyLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Pehle Firebase Authentication se login karo
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Check karo kya ye user FACULTY collection mein exist karta hai?
      const facultyDoc = await getDoc(doc(db, 'faculty', uid));
      
      if (facultyDoc.exists()) {
        // Ye faculty hai - Allow login
        console.log('Faculty login successful');
        navigate('/faculty-dashboard');
      } else {
        // Ye student hai ya unknown user - Block karo!
        setError('Access Denied! Only faculty members can login here.');
        // Sign out the user immediately
        await auth.signOut();
      }
      
    } catch (err) {
      console.error('Login error:', err);
      
      switch (err.code) {
        case 'auth/user-not-found':
          setError('Faculty account not found. Contact admin.');
          break;
        case 'auth/wrong-password':
          setError('Wrong password');
          break;
        case 'auth/invalid-email':
          setError('Invalid email format');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="faculty-login-container">
      <div className="faculty-login-card">
        <img src={academyLogo} alt="Logo" className="faculty-login-logo" />
        <h2>Faculty Portal</h2>
        <p>Authorized Personnel Only</p>
        
        <form onSubmit={handleLogin}>
          <div className="faculty-input-group">
            <label>Faculty Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="faculty@example.com"
              required
            />
          </div>
          
          <div className="faculty-input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>
          
          {error && <div className="faculty-error">{error}</div>}
          
          <button type="submit" disabled={loading} className="faculty-login-btn">
            {loading ? 'Logging in...' : 'Faculty Login →'}
          </button>
        </form>
        
        <button onClick={() => navigate('/')} className="faculty-back-btn">
          ← Back to Website
        </button>
      </div>
    </div>
  );
}