import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import CoursesPage from './pages/CoursesPage';
import Contact from './pages/Contact';
import './index.css';
import CourseDetail from './pages/CourseDetail';
import StudentPortal from './pages/StudentPortal';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/Dashboard';
import FacultyLogin from './pages/FacultyLogin';
import FacultyDashboard from './pages/FacultyDashboard';

function MainLayout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}

function NoFooterLayout({ children }) {
  return <>{children}</>;
}

// Navbar ko alag component mein rakho taake useLocation use ho sake
function AppContent() {
  const location = useLocation();

  // In routes par Navbar HIDE rahegi
  const hideNavbarRoutes = ['/portal', '/dashboard', '/student-dashboard', '/faculty-login', '/faculty-dashboard'];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar &&<Navbar />} {/* Sirf public pages par show hogi */}
      <Routes>
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/about" element={<MainLayout><About /></MainLayout>} />
        <Route path="/courses" element={<MainLayout><CoursesPage /></MainLayout>} />
        <Route path="/courses/:id" element={<MainLayout><CourseDetail /></MainLayout>} />
        <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
        
        <Route path="/portal" element={<NoFooterLayout><StudentPortal /></NoFooterLayout>} />
        <Route path="/dashboard" element={<NoFooterLayout><Dashboard /></NoFooterLayout>} />
        <Route path="/student-dashboard" element={<NoFooterLayout><StudentDashboard /></NoFooterLayout>} />
        <Route path="/faculty-login" element={<NoFooterLayout><FacultyLogin /></NoFooterLayout>} />
        <Route path="/faculty-dashboard" element={<NoFooterLayout><FacultyDashboard /></NoFooterLayout>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />{/* BrowserRouter ke andar rakha */}
    </BrowserRouter>
  );
}