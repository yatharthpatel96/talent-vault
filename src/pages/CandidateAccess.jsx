import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './CandidateAccess.css';

const UNIVERSITIES = [
  { value: '', label: 'Select university...' },
  { value: 'asu', label: 'Arizona State University' },
  { value: 'other', label: 'Other' },
];

const COURSES = [
  { id: 'digital-design', label: 'Digital Design' },
  { id: 'verification-uvm', label: 'Verification (UVM)' },
  { id: 'rtl-gds', label: 'RTL to GDS' },
];

function CandidateAccess() {
  const [form, setForm] = useState({
    resume: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    usaCitizen: '',
    university: '',
    courses: [],
    termsAccepted: false,
  });
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, type, value, checked, files } = e.target;
    if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files?.[0] ?? null }));
    } else if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  }

  function handleCourseChange(e) {
    const { value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      courses: checked
        ? [...prev.courses, value]
        : prev.courses.filter((c) => c !== value),
    }));
    if (errors.courses) setErrors((prev) => ({ ...prev, courses: null }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitStatus(null);
    const next = {};
    if (!form.resume) next.resume = 'Resume is required';
    if (!form.firstName.trim()) next.firstName = 'First name is required';
    if (!form.lastName.trim()) next.lastName = 'Last name is required';
    if (!form.email.trim()) next.email = 'Email address is required';
    if (!form.phone.trim()) next.phone = 'Phone number is required';
    if (!form.message.trim()) next.message = 'Message is required';
    if (!form.usaCitizen) next.usaCitizen = 'Please select USA Citizen status';
    if (!form.university) next.university = 'Please select a university';
    if (form.courses.length === 0) next.courses = 'Please select at least one course';
    if (!form.termsAccepted) next.termsAccepted = 'You must accept the terms and conditions';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    if (!supabase) {
      setSubmitStatus({ type: 'error', message: 'Supabase is not configured.' });
      return;
    }

    setSubmitting(true);
    let resumeUrl = null;
    if (form.resume) {
      const fileExt = form.resume.name.split('.').pop();
      const filePath = `${form.email.trim().replace(/[^a-zA-Z0-9@._-]/g, '_')}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, form.resume, { upsert: false });
      if (uploadError) {
        setSubmitStatus({ type: 'error', message: uploadError.message || 'Resume upload failed.' });
        setSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(filePath);
      resumeUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('candidate_access_requests').insert({
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: form.message.trim(),
      usa_citizen: form.usaCitizen === 'yes',
      university: form.university,
      courses: form.courses,
      terms_accepted: form.termsAccepted,
      resume_url: resumeUrl,
    });

    if (error) {
      setSubmitStatus({ type: 'error', message: error.message || 'Submission failed.' });
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitStatus({ type: 'success', message: 'Your request has been submitted.' });
    setForm({
      resume: null,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      message: '',
      usaCitizen: '',
      university: '',
      courses: [],
      termsAccepted: false,
    });
    setErrors({});
  }

  return (
    <div className="page candidate-access-page">
      <div className="container">
        <header className="page__header">
          <h1 className="page__title">Request Login Access</h1>
          <p className="page__subtitle">
            Fill out the form below to get login access as a candidate.
          </p>
          <Link to="/login" className="candidate-access__back">Back to Login</Link>
        </header>
        <div className="access-card">
          <div className="access-card__accent" aria-hidden="true" />
          <form className="access-form" onSubmit={handleSubmit} noValidate>
            <div className="access-form__field">
              <label htmlFor="resume" className="access-form__label">Resume <span className="access-form__required">*</span></label>
              <input
                id="resume"
                name="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                className={`access-form__input access-form__file ${errors.resume ? 'access-form__input--error' : ''}`}
                onChange={handleChange}
                aria-invalid={!!errors.resume}
                aria-describedby={errors.resume ? 'resume-error' : undefined}
              />
              {errors.resume && <span id="resume-error" className="access-form__error" role="alert">{errors.resume}</span>}
            </div>

            <div className="access-form__row">
              <div className="access-form__field">
                <label htmlFor="firstName" className="access-form__label">First Name <span className="access-form__required">*</span></label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className={`access-form__input ${errors.firstName ? 'access-form__input--error' : ''}`}
                  placeholder="First name"
                  value={form.firstName}
                  onChange={handleChange}
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                />
                {errors.firstName && <span id="firstName-error" className="access-form__error" role="alert">{errors.firstName}</span>}
              </div>
              <div className="access-form__field">
                <label htmlFor="lastName" className="access-form__label">Last Name <span className="access-form__required">*</span></label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className={`access-form__input ${errors.lastName ? 'access-form__input--error' : ''}`}
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={handleChange}
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                />
                {errors.lastName && <span id="lastName-error" className="access-form__error" role="alert">{errors.lastName}</span>}
              </div>
            </div>

            <div className="access-form__field">
              <label htmlFor="email" className="access-form__label">Email Address <span className="access-form__required">*</span></label>
              <input
                id="email"
                name="email"
                type="email"
                className={`access-form__input ${errors.email ? 'access-form__input--error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && <span id="email-error" className="access-form__error" role="alert">{errors.email}</span>}
            </div>

            <div className="access-form__field">
              <label htmlFor="phone" className="access-form__label">Phone Number <span className="access-form__required">*</span></label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={`access-form__input ${errors.phone ? 'access-form__input--error' : ''}`}
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={handleChange}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
              {errors.phone && <span id="phone-error" className="access-form__error" role="alert">{errors.phone}</span>}
            </div>

            <div className="access-form__field">
              <label htmlFor="message" className="access-form__label">Message <span className="access-form__required">*</span></label>
              <textarea
                id="message"
                name="message"
                className={`access-form__input access-form__textarea ${errors.message ? 'access-form__input--error' : ''}`}
                placeholder="Your message..."
                rows={4}
                value={form.message}
                onChange={handleChange}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'message-error' : undefined}
              />
              {errors.message && <span id="message-error" className="access-form__error" role="alert">{errors.message}</span>}
            </div>

            <div className="access-form__field">
              <label htmlFor="usaCitizen" className="access-form__label">USA Citizen <span className="access-form__required">*</span></label>
              <select
                id="usaCitizen"
                name="usaCitizen"
                className={`access-form__input access-form__select ${errors.usaCitizen ? 'access-form__input--error' : ''}`}
                value={form.usaCitizen}
                onChange={handleChange}
                aria-invalid={!!errors.usaCitizen}
                aria-describedby={errors.usaCitizen ? 'usaCitizen-error' : undefined}
              >
                <option value="">Select...</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {errors.usaCitizen && <span id="usaCitizen-error" className="access-form__error" role="alert">{errors.usaCitizen}</span>}
            </div>

            <div className="access-form__field">
              <label htmlFor="university" className="access-form__label">University <span className="access-form__required">*</span></label>
              <select
                id="university"
                name="university"
                className={`access-form__input access-form__select ${errors.university ? 'access-form__input--error' : ''}`}
                value={form.university}
                onChange={handleChange}
                aria-invalid={!!errors.university}
                aria-describedby={errors.university ? 'university-error' : undefined}
              >
                {UNIVERSITIES.map((opt) => (
                  <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.university && <span id="university-error" className="access-form__error" role="alert">{errors.university}</span>}
            </div>

            <div className="access-form__field">
              <span className="access-form__label">If you have taken below courses <span className="access-form__required">*</span></span>
              <p className="access-form__hint">Select all that apply</p>
              <div className="access-form__checkbox-group">
                {COURSES.map((course) => (
                  <label key={course.id} className="access-form__checkbox-label">
                    <input
                      type="checkbox"
                      id={`course-${course.id}`}
                      name="courses"
                      value={course.id}
                      checked={form.courses.includes(course.id)}
                      onChange={handleCourseChange}
                      className="access-form__checkbox"
                      aria-invalid={!!errors.courses}
                      aria-describedby={errors.courses ? 'courses-error' : undefined}
                    />
                    <span>{course.label}</span>
                  </label>
                ))}
              </div>
              {errors.courses && <span id="courses-error" className="access-form__error" role="alert">{errors.courses}</span>}
            </div>

            <div className="access-form__field">
              <label className="access-form__checkbox-label access-form__terms-label">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={form.termsAccepted}
                  onChange={handleChange}
                  className="access-form__checkbox"
                  aria-invalid={!!errors.termsAccepted}
                  aria-describedby={errors.termsAccepted ? 'terms-error' : undefined}
                />
                <span>I accept the Terms and Conditions <span className="access-form__required">*</span></span>
              </label>
              {errors.termsAccepted && <span id="terms-error" className="access-form__error" role="alert">{errors.termsAccepted}</span>}
            </div>

            <button type="submit" className="btn access-form__submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Submit'}
            </button>
            {submitStatus && (
              <p className={`access-form__status access-form__status--${submitStatus.type}`} role="alert">
                {submitStatus.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default CandidateAccess;
