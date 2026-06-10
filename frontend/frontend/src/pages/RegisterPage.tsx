import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

const RegisterPage = () => {
  const { actions } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-c-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-c-green text-3xl font-bold tracking-widest uppercase mb-2">Letterboxd</h1>
          <p className="text-c-text3 text-sm">Track films you've watched.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-c-card2 rounded-lg p-6 border border-c-border space-y-4">
          <h2 className="text-c-text font-semibold text-lg">Create account</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/40 rounded p-3 text-red-500 text-sm">{error}</div>
          )}

          {[
            { label: 'Username', type: 'text', value: username, set: setUsername, placeholder: 'username', extra: { minLength: 3, maxLength: 30, pattern: '[a-zA-Z0-9_]+' } },
            { label: 'Email', type: 'email', value: email, set: setEmail, placeholder: 'your@email.com', extra: {} },
            { label: 'Password', type: 'password', value: password, set: setPassword, placeholder: 'min. 6 characters', extra: { minLength: 6 } },
          ].map(({ label, type, value, set, placeholder, extra }) => (
            <div key={label} className="space-y-1">
              <label className="text-c-text2 text-sm font-medium">{label}</label>
              <input
                type={type} value={value} onChange={(e) => set(e.target.value)} required placeholder={placeholder}
                {...extra}
                className="w-full bg-c-input border border-c-border rounded px-3 py-2 text-c-text text-sm placeholder-c-text4 focus:outline-none focus:border-c-green transition-colors"
              />
            </div>
          ))}

          <button
            type="submit" disabled={loading}
            style={{ backgroundColor: 'var(--c-green)', color: '#000000' }}
            className="w-full disabled:opacity-50 font-semibold py-2 rounded text-sm transition-opacity"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-c-text3 text-sm mt-4">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-c-green hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
