import { Routes, Route, Navigate } from "react-router-dom";
import { functionsUrl, getToken, getRole } from "./lib/supabaseClient";
import Layout from "./components/Layout";
import PublicLayout from "./components/PublicLayout";
import Login from "./pages/Login";
import RequestAccess from "./pages/RequestAccess";
import SetPassword from "./pages/SetPassword";
import Admin from "./pages/Admin";
import Candidate from "./pages/Candidate";
import Professor from "./pages/Professor";
import Employer from "./pages/Employer";
import Home from "./pages/Home";
import CandidateInfo from "./pages/CandidateInfo";
import EmployerInfo from "./pages/EmployerInfo";
import ProfessorInfo from "./pages/ProfessorInfo";
import ResourcesPage from "./pages/Resources";
import "./styles/global.css";

function Protected({ children, allowedRoles }) {
  const token = getToken();
  const role = getRole();
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) return <Navigate to={role === "admin" ? "/admin" : `/${role}`} replace />;
  return children;
}

function App() {
  if (!functionsUrl) {
    return (
      <div className="app" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", textAlign: "center" }}>
        <p style={{ margin: 0, color: "var(--text-muted)" }}>Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/request-access" element={<PublicLayout><RequestAccess /></PublicLayout>} />
        <Route path="/set-password" element={<PublicLayout><SetPassword /></PublicLayout>} />
        <Route path="/candidate-info" element={<PublicLayout><CandidateInfo /></PublicLayout>} />
        <Route path="/employer-info" element={<PublicLayout><EmployerInfo /></PublicLayout>} />
        <Route path="/professor-info" element={<PublicLayout><ProfessorInfo /></PublicLayout>} />
        <Route path="/resources" element={<PublicLayout><ResourcesPage /></PublicLayout>} />
        <Route path="/admin" element={<Protected allowedRoles={["admin"]}><Layout><Admin /></Layout></Protected>} />
        <Route path="/candidate" element={<Protected allowedRoles={["candidate"]}><Layout><Candidate /></Layout></Protected>} />
        <Route path="/professor" element={<Protected allowedRoles={["professor"]}><Layout><Professor /></Layout></Protected>} />
        <Route path="/employer" element={<Protected allowedRoles={["employer"]}><Layout><Employer /></Layout></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
