import { Routes, Route } from 'react-router-dom';
import { hasSupabaseConfig } from './lib/supabase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Candidate from './pages/Candidate';
import Employer from './pages/Employer';
import Professor from './pages/Professor';
import Resources from './pages/Resources';
import Login from './pages/Login';
import CandidateAccess from './pages/CandidateAccess';
import AccessRequests from './pages/AccessRequests';
import CreateAccount from './pages/CreateAccount';
import Dashboard from './pages/Dashboard';

import './components/Navbar.css';
import './components/Footer.css';

function App() {
  if (!hasSupabaseConfig) {
    return (
      <div className="app" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
        <p style={{ margin: 0, color: 'var(--text-muted, #475569)', maxWidth: '360px' }}>
          Missing environment configuration (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Please add them and reload.
        </p>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/candidate" element={<Candidate />} />
          <Route path="/candidate/access" element={<CandidateAccess />} />
          <Route path="/employer" element={<Employer />} />
          <Route path="/professor" element={<Professor />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/create-account" element={<CreateAccount />} />
          <Route path="/admin/access-requests" element={<AccessRequests />} />
          <Route path="/dashboard/:role?" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
