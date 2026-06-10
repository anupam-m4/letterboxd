import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

const LoginPage = () => {
  const { actions } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await actions.login({ email, password });
      navigate(ROUTES.HOME);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-c-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-c-green text-3xl font-bold tracking-widest uppercase mb-2">Letterboxd</h1>
          <p className="text-c-text3 text-sm">Track films you've watched.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-c-card2 rounded-lg p-6 border border-c-border space-y-4">
          <h2 className="text-c-text font-semibold text-lg">Sign in</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/40 rounded p-3 text-red-500 text-sm">{error}</div>
          )}

          <div className="space-y-1">
            <label className="text-c-text2 text-sm font-medium">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-c-input border border-c-border rounded px-3 py-2 text-c-text text-sm placeholder-c-text4 focus:outline-none focus:border-c-green transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-c-text2 text-sm font-medium">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-c-input border border-c-border rounded px-3 py-2 text-c-text text-sm placeholder-c-text4 focus:outline-none focus:border-c-green transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{ backgroundColor: 'var(--c-green)', color: '#000000' }}
            className="w-full disabled:opacity-50 font-semibold py-2 rounded text-sm transition-opacity"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-c-text3 text-sm mt-4">
          New?{' '}
          <Link to={ROUTES.REGISTER} className="text-c-green hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
