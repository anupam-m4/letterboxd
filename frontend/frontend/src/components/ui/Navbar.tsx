import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES, buildRoute } from '../../constants/routes';

const NAV_LINKS = [
  { label: 'Films', to: ROUTES.HOME },
  { label: 'Activity', to: ROUTES.FEED, authRequired: true },
  { label: 'Watchlist', to: ROUTES.WATCHLIST, authRequired: true },
  { label: 'Watched', to: ROUTES.WATCHED, authRequired: true },
];

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const Navbar = () => {
  const { state, data, actions } = useAuth();
  const { state: themeState, actions: themeActions } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    actions.logout();
    navigate(ROUTES.HOME);
  };

  const isActive = (to: string) => location.pathname === to;
  const visibleLinks = NAV_LINKS.filter((l) => !l.authRequired || state.isAuthenticated);

  return (
    <nav className="bg-[#14181c] border-b border-[#2c3440] px-6 py-0 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link to={ROUTES.HOME} className="text-c-green font-bold text-lg tracking-widest uppercase py-3">
          Letterboxd
        </Link>

        <div className="hidden sm:flex items-center">
          {visibleLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-4 text-sm border-b-2 transition-colors ${
                isActive(link.to)
                  ? 'border-c-green text-white font-medium'
                  : 'border-transparent text-[#9ab] hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={themeActions.toggle}
          title={themeState.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#9ab] hover:text-white hover:bg-white/10 transition-colors"
        >
          {themeState.theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        {state.isAuthenticated && data.user ? (
          <>
            <Link
              to={buildRoute.profile(data.user.username)}
              className={`text-sm transition-colors py-4 px-2 border-b-2 ${
                location.pathname === buildRoute.profile(data.user.username)
                  ? 'border-c-green text-white font-medium'
                  : 'border-transparent text-[#9ab] hover:text-white'
              }`}
            >
              {data.user.username}
            </Link>
            <button onClick={handleLogout} className="text-[#678] hover:text-[#9ab] text-xs transition-colors">
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to={ROUTES.LOGIN} className="text-[#9ab] hover:text-white text-sm transition-colors">
              Sign in
            </Link>
            <Link
              to={ROUTES.REGISTER}
              style={{ backgroundColor: 'var(--c-green)', color: '#000000' }}
              className="text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wide"
            >
              Create account
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
