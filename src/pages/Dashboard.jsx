import { useParams, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const ROLE_LABELS = {
  candidate: 'Candidate',
  employer: 'Employer',
  professor: 'Professor',
};

function Dashboard() {
  const { role } = useParams();
  const navigate = useNavigate();
  const normalizedRole = role && ['candidate', 'employer', 'professor'].includes(role) ? role : null;
  const label = normalizedRole ? ROLE_LABELS[normalizedRole] : null;

  if (!normalizedRole || !label) {
    return (
      <div className="page dashboard-page">
        <div className="container">
          <p className="dashboard__text">Dashboard</p>
          <button type="button" className="btn" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <div className="container">
        <p className="dashboard__text">
          This is {normalizedRole}. For {label}.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
