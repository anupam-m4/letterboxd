import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

interface Props {
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

const LetterboxdMark = () => (
  <svg width="36" height="22" viewBox="0 0 48 30" aria-hidden="true">
    <circle cx="10" cy="15" r="10" fill="#FF8000" />
    <circle cx="24" cy="15" r="10" fill="#00E054" />
    <circle cx="38" cy="15" r="10" fill="#40BCF4" />
  </svg>
);

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  backgroundColor: '#2c3440',
  border: '1px solid #3a4450',
  borderRadius: '4px',
  color: '#e5e5e5',
  fontSize: '14px',
  fontFamily: 'Lato, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
};

const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.backgroundColor = '#fff';
  e.target.style.color = '#14181c';
  e.target.style.borderColor = '#fff';
};

const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.backgroundColor = '#2c3440';
  e.target.style.color = '#e5e5e5';
  e.target.style.borderColor = '#3a4450';
};

const SignUpModal = ({ onClose, onSwitchToSignIn }: Props) => {
  const { actions } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted || !privacyAccepted) {
      setError('Please accept both the Terms of Use and Privacy Policy');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await actions.register({ username, email, password });
      onClose();
      navigate(ROUTES.WELCOME);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: '#1c2028', border: '1px solid #2c3440', borderRadius: '6px', padding: '32px', width: '100%', maxWidth: '420px', position: 'relative' }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '14px', right: '16px', background: 'none', border: 'none', color: '#678', cursor: 'pointer', fontSize: '22px', lineHeight: 1, padding: '4px' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#678'; }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <LetterboxdMark />
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, fontFamily: 'Lato, sans-serif', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '12px', marginBottom: 0 }}>
            Join Letterboxd
          </h2>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '4px', padding: '10px 12px', color: '#f87171', fontSize: '13px', marginBottom: '16px', fontFamily: 'Lato, sans-serif' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.38)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', fontFamily: 'Lato, sans-serif' }}>
              Email address
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={fieldStyle} onFocus={onFocus} onBlur={onBlur} placeholder="you@example.com" />
          </div>

          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.38)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', fontFamily: 'Lato, sans-serif' }}>
              Username
            </label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} maxLength={30} style={fieldStyle} onFocus={onFocus} onBlur={onBlur} placeholder="e.g. janedoe" />
          </div>

          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.38)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', fontFamily: 'Lato, sans-serif' }}>
              Password
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={fieldStyle} onFocus={onFocus} onBlur={onBlur} placeholder="min. 6 characters" />
          </div>

          {/* Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} style={{ marginTop: '2px', accentColor: '#00e054', cursor: 'pointer' }} />
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontFamily: 'Lato, sans-serif', lineHeight: 1.5 }}>
                I'm at least 16 years old and accept the{' '}
                <a href="#" onClick={e => e.preventDefault()} style={{ color: '#00e054', textDecoration: 'none' }}>Terms of Use</a>
              </span>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={privacyAccepted} onChange={e => setPrivacyAccepted(e.target.checked)} style={{ marginTop: '2px', accentColor: '#00e054', cursor: 'pointer' }} />
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontFamily: 'Lato, sans-serif', lineHeight: 1.5 }}>
                I accept the{' '}
                <a href="#" onClick={e => e.preventDefault()} style={{ color: '#00e054', textDecoration: 'none' }}>Privacy Policy</a>
              </span>
            </label>
          </div>

          {/* hCaptcha placeholder */}
          <div style={{ backgroundColor: '#252d38', border: '1px solid #3a4450', borderRadius: '4px', padding: '14px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #678', flexShrink: 0 }} />
            <span style={{ color: '#678', fontSize: '13px', fontFamily: 'Lato, sans-serif' }}>I am human</span>
            <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ color: '#9ab', fontSize: '10px', fontFamily: 'Lato, sans-serif' }}>hCaptcha</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#00e054', color: '#000', border: 'none', borderRadius: '4px', padding: '12px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.65 : 1, fontFamily: 'Lato, sans-serif', transition: 'opacity 0.15s' }}
          >
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.28)', fontSize: '12px', marginTop: '18px', fontFamily: 'Lato, sans-serif' }}>
          Already have an account?{' '}
          <button
            onClick={() => { onClose(); onSwitchToSignIn(); }}
            style={{ background: 'none', border: 'none', color: '#00e054', cursor: 'pointer', padding: 0, fontSize: '12px', fontFamily: 'Lato, sans-serif', textDecoration: 'underline' }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpModal;
