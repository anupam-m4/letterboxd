import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

/* Letterboxd 3-circle mark */
const LetterboxdMark = () => (
  <svg width="40" height="24" viewBox="0 0 48 30" aria-hidden="true">
    <circle cx="10" cy="15" r="10" fill="#FF8000" />
    <circle cx="24" cy="15" r="10" fill="#00E054" />
    <circle cx="38" cy="15" r="10" fill="#40BCF4" />
  </svg>
);

const LoginPage = () => {
  const { actions } = useAuth();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await actions.login({ email, password });
      navigate(ROUTES.WELCOME);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#14181c' }}
    >
      {/* blurred posters in background (decorative) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="w-full h-full" style={{ background: 'radial-gradient(ellipse at center, #2c3440 0%, #14181c 70%)' }} />
      </div>

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

        {/* Form card */}
        <div className="rounded-lg p-6" style={{ backgroundColor: '#1c2028', border: '1px solid #2c3440' }}>
          {/* "Get Started" heading — matches reference */}
          <h2
            className="text-white font-bold text-2xl mb-5"
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            Get Started
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/40 rounded p-3 text-red-400 text-sm mb-4" style={{ fontFamily: 'Lato, sans-serif' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest block" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Lato, sans-serif' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded px-3 py-2.5 text-sm focus:outline-none transition-all"
                style={{
                  backgroundColor: '#2c3440',
                  border: '1px solid #3a4450',
                  color: '#e5e5e5',
                  fontFamily: 'Lato, sans-serif',
                }}
                onFocus={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.color = '#14181c'; e.target.style.borderColor = '#fff'; }}
                onBlur={(e) => { e.target.style.backgroundColor = '#2c3440'; e.target.style.color = '#e5e5e5'; e.target.style.borderColor = '#3a4450'; }}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest block" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Lato, sans-serif' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded px-3 py-2.5 text-sm focus:outline-none transition-all"
                style={{
                  backgroundColor: '#2c3440',
                  border: '1px solid #3a4450',
                  color: '#e5e5e5',
                  fontFamily: 'Lato, sans-serif',
                }}
                onFocus={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.color = '#14181c'; e.target.style.borderColor = '#fff'; }}
                onBlur={(e) => { e.target.style.backgroundColor = '#2c3440'; e.target.style.color = '#e5e5e5'; e.target.style.borderColor = '#3a4450'; }}
                placeholder="••••••••"
              />
            </div>

            {/* SIGN IN button — exact match to reference (bright green, uppercase) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-3 rounded text-sm uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50 mt-1"
              style={{ backgroundColor: '#00e054', color: '#000', fontFamily: 'Lato, sans-serif' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Lato, sans-serif' }}>
          New to Letterboxd?{' '}
          <Link to={ROUTES.REGISTER} className="hover:underline" style={{ color: '#00e054' }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
