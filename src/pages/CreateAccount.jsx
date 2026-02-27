import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './CreateAccount.css';

function CreateAccount() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [inviteLoading, setInviteLoading] = useState(!!inviteToken);
  const [inviteError, setInviteError] = useState(null);

  useEffect(() => {
    if (!inviteToken || !supabase) {
      if (inviteToken && !supabase) setInviteError('App is not configured.');
      setInviteLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('signup_invites')
        .select('email')
        .eq('token', inviteToken)
        .is('used_at', null)
        .single();
      if (cancelled) return;
      setInviteLoading(false);
      if (error || !data) {
        setInviteError('Invalid or expired link.');
        return;
      }
      setEmail(data.email || '');
    })();
    return () => { cancelled = true; };
  }, [inviteToken]);

  const passwordValid = password.length >= 8;
  const confirmValid = password === confirmPassword && confirmPassword.length > 0;
  const formValid = passwordValid && confirmValid && !loading;

  function handlePasswordBlur() {
    setPasswordError(password.length > 0 && password.length < 8 ? 'Password must be at least 8 characters.' : '');
  }

  function handleConfirmBlur() {
    setConfirmError(confirmPassword.length > 0 && password !== confirmPassword ? 'Passwords do not match.' : '');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);
    setPasswordError(password.length >= 8 ? '' : 'Password must be at least 8 characters.');
    setConfirmError(password !== confirmPassword ? 'Passwords do not match.' : '');
    if (!formValid || !supabase || !inviteToken) return;

    setLoading(true);
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpErr) {
      setLoading(false);
      setSubmitError(signUpErr.message || 'Could not create account.');
      return;
    }

    const session = signUpData?.session;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (session?.access_token && supabaseUrl) {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/complete-signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ invite_token: inviteToken }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setSubmitError(err.error || 'Account created but could not complete setup.');
        }
      } catch (_) {
        setSubmitError('Account created but could not complete setup.');
      }
    }

    setLoading(false);
    setSuccess(true);
  }

  if (inviteLoading) {
    return (
      <div className="create-account page">
        <div className="create-account__card">
          <p className="create-account__muted">Checking your invite link…</p>
        </div>
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="create-account page">
        <div className="create-account__card">
          <h1 className="create-account__title">Invalid or expired link</h1>
          <p className="create-account__muted">{inviteError}</p>
          <Link to="/candidate/access" className="create-account__link">Request access again</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="create-account page">
        <div className="create-account__card">
          <div className="create-account__success">
            <span className="create-account__success-icon" aria-hidden="true">✓</span>
            <p className="create-account__success-text">Account created successfully.</p>
            <Link to="/login" className="create-account__link">Go to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-account page">
      <div className="create-account__card">
        <h1 className="create-account__title">Create Account</h1>
        <p className="create-account__muted">Set your password to finish.</p>

        <form className="create-account__form" onSubmit={handleSubmit} noValidate>
          <div className="create-account__field">
            <label className="create-account__label" htmlFor="create-email">Email</label>
            <input
              id="create-email"
              type="email"
              className="create-account__input"
              value={email}
              readOnly
              aria-readonly="true"
            />
          </div>

          <div className="create-account__field">
            <label className="create-account__label" htmlFor="create-password">Password <span className="create-account__required">*</span></label>
            <input
              id="create-password"
              type="password"
              className={`create-account__input ${passwordError ? 'create-account__input--error' : ''}`}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setSubmitError(null); }}
              onBlur={handlePasswordBlur}
              autoComplete="new-password"
              disabled={loading}
            />
            {passwordError && <p className="create-account__error" role="alert">{passwordError}</p>}
          </div>

          <div className="create-account__field">
            <label className="create-account__label" htmlFor="create-confirm">Confirm password <span className="create-account__required">*</span></label>
            <input
              id="create-confirm"
              type="password"
              className={`create-account__input ${confirmError ? 'create-account__input--error' : ''}`}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setSubmitError(null); }}
              onBlur={handleConfirmBlur}
              autoComplete="new-password"
              disabled={loading}
            />
            {confirmError && <p className="create-account__error" role="alert">{confirmError}</p>}
          </div>

          {submitError && <p className="create-account__error create-account__error--submit" role="alert">{submitError}</p>}

          <button
            type="submit"
            className="create-account__submit"
            disabled={!formValid}
            aria-busy={loading}
          >
            {loading ? 'Please wait…' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateAccount;
