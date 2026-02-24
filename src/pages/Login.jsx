import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Login.css';

const LOGIN_TYPES = [
  { id: 'candidate', label: 'Candidate' },
  { id: 'employer', label: 'Employer' },
  { id: 'professor', label: 'Professor' },
];

function Login() {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);

  const titleLabel = LOGIN_TYPES.find((t) => t.id === loginType)?.label ?? 'Candidate';
  const formTitle = `${titleLabel} Login`;

  async function handleSubmit(e) {
    e.preventDefault();
    setAuthError(null);
    const next = {};
    if (!email.trim()) next.email = 'Email is required';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    if (!supabase) {
      setAuthError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setAuthError('Invalid email or password');
      return;
    }
    navigate(`/dashboard/${loginType}`, { replace: true });
  }

  return (
    <div className="page login-page">
      <div className="container">
        <header className="page__header">
          <h1 className="page__title">Login</h1>
          <p className="page__subtitle">
            Sign in as a candidate, employer, or professor.
          </p>
        </header>
        <div className="login-wrapper">
          <nav className="login-type-nav" aria-label="Login type">
            {LOGIN_TYPES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`login-type-nav__item ${loginType === id ? 'login-type-nav__item--active' : ''}`}
                onClick={() => setLoginType(id)}
                aria-pressed={loginType === id}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="login-card">
            <div className="login-card__accent" aria-hidden="true" />
            <h2 className="login-card__title">{formTitle}</h2>
            {authError && (
              <p className="login-card__auth-error" role="alert">
                {authError}
              </p>
            )}
            <form className="login-card__form" onSubmit={handleSubmit} noValidate>
              <div className="login-card__field">
                <label htmlFor="login-email" className="login-card__label">Email</label>
                <input
                  id="login-email"
                  type="email"
                  className={`login-card__input ${errors.email ? 'login-card__input--error' : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                  }}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'login-email-error' : undefined}
                />
                {errors.email && (
                  <span id="login-email-error" className="login-card__error" role="alert">
                    {errors.email}
                  </span>
                )}
              </div>
              <div className="login-card__field">
                <label htmlFor="login-password" className="login-card__label">Password</label>
                <input
                  id="login-password"
                  type="password"
                  className={`login-card__input ${errors.password ? 'login-card__input--error' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                />
                {errors.password && (
                  <span id="login-password-error" className="login-card__error" role="alert">
                    {errors.password}
                  </span>
                )}
              </div>
              <button type="submit" className="btn login-card__btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </button>
              <p className="login-card__footer">
                {loginType === 'candidate' ? (
                  <>New here? <Link to="/candidate/access">Create an account</Link></>
                ) : (
                  'New here? Create an account'
                )}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
