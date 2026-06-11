import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

const LetterboxdMark = () => (
  <svg width="40" height="24" viewBox="0 0 48 30" aria-hidden="true">
    <circle cx="10" cy="15" r="10" fill="#FF8000" />
    <circle cx="24" cy="15" r="10" fill="#00E054" />
    <circle cx="38" cy="15" r="10" fill="#40BCF4" />
  </svg>
);

const RegisterPage = () => {
  const { actions } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await actions.register({ username, email, password });
      navigate(ROUTES.HOME);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#2c3440',
    border: '1px solid #3a4450',
    color: '#e5e5e5',
    fontFamily: 'Lato, sans-serif',
  };
  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.backgroundColor = '#fff';
    e.target.style.color = '#14181c';
    e.target.style.borderColor = '#fff';
  };
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.backgroundColor = '#2c3440';
    e.target.style.color = '#e5e5e5';
    e.target.style.borderColor = '#3a4450';
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#14181c' }}>
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-flex flex-col items-center gap-3">
            <LetterboxdMark />
            <span className="text-white font-bold text-xl" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.05em' }}>
              Letterboxd
            </span>
          </Link>
        </div>

        <div className="rounded-lg p-6" style={{ backgroundColor: '#1c2028', border: '1px solid #2c3440' }}>
          <h2 className="text-white font-bold text-2xl mb-5" style={{ fontFamily: 'Lato, sans-serif' }}>
            Create Account
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/40 rounded p-3 text-red-400 text-sm mb-4" style={{ fontFamily: 'Lato, sans-serif' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Username', type: 'text',     value: username, set: setUsername, placeholder: 'e.g. janedoe',      extra: { minLength: 3, maxLength: 30, pattern: '[a-zA-Z0-9_]+' } },
              { label: 'Email',    type: 'email',    value: email,    set: setEmail,    placeholder: 'you@example.com',   extra: {} },
              { label: 'Password', type: 'password', value: password, set: setPassword, placeholder: 'min. 6 characters', extra: { minLength: 6 } },
            ].map(({ label, type, value, set, placeholder, extra }) => (
              <div key={label} className="space-y-1">
                <label className="text-xs uppercase tracking-widest block" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Lato, sans-serif' }}>
                  {label}
                </label>
                <input
                  type={type} value={value}
                  onChange={(e) => set(e.target.value)}
                  required placeholder={placeholder}
                  {...extra}
                  className="w-full rounded px-3 py-2.5 text-sm focus:outline-none transition-all"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
            ))}

            <button
              type="submit" disabled={loading}
              className="w-full font-bold py-3 rounded text-sm uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50 mt-1"
              style={{ backgroundColor: '#00e054', color: '#000', fontFamily: 'Lato, sans-serif' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Lato, sans-serif' }}>
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="hover:underline" style={{ color: '#00e054' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
