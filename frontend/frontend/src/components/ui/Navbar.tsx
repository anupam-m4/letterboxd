import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, buildRoute } from '../../constants/routes';
import SignUpModal from './SignUpModal';
import QuickLogModal from './QuickLogModal';

/* ─── icons ─────────────────────────────────────────────────────── */
const LetterboxdMark = () => (
  <svg width="32" height="20" viewBox="0 0 48 30" aria-hidden="true">
    <circle cx="10" cy="15" r="10" fill="#FF8000" />
    <circle cx="24" cy="15" r="10" fill="#00E054" />
    <circle cx="38" cy="15" r="10" fill="#40BCF4" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BoltIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#00e054">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const ChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ─── inline sign-in input style ─────────────────────────────────── */
const inlineInput: React.CSSProperties = {
  backgroundColor: '#252d38', border: '1px solid #3a4450', borderRadius: '3px',
  color: '#e5e5e5', fontSize: '12px', fontFamily: 'Lato, sans-serif',
  padding: '4px 8px', outline: 'none', width: '120px', height: '28px',
};

const onFocusInput = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.backgroundColor = '#fff';
  e.target.style.color = '#14181c';
  e.target.style.borderColor = '#fff';
};
const onBlurInput = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.backgroundColor = '#252d38';
  e.target.style.color = '#e5e5e5';
  e.target.style.borderColor = '#3a4450';
};

/* ─── logged-out nav links ──────────────────────────────────────── */
const LOGGED_OUT_LINKS = [
  { label: 'Films',   to: ROUTES.FILMS },
  { label: 'Lists',   to: ROUTES.SEARCH },
  { label: 'Members', to: ROUTES.USER_SEARCH },
  { label: 'Journal', to: ROUTES.JOURNAL },
];

/* ─── user dropdown menu items ──────────────────────────────────── */
const userMenuItems = (username: string) => [
  { label: 'Home',      to: ROUTES.HOME },
  { label: 'Profile',   to: buildRoute.profile(username) },
  { label: 'Films',     to: ROUTES.FILMS },
  { label: 'Reviews',   to: buildRoute.profile(username) },
  { label: 'Watchlist', to: ROUTES.WATCHLIST },
  { label: 'Watched',   to: ROUTES.WATCHED },
  { label: 'Activity',  to: ROUTES.FEED },
  null,
];

/* ─── avatar circle ─────────────────────────────────────────────── */
const Avatar = ({ username, avatarUrl }: { username: string; avatarUrl: string | null }) => {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={username} style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#2c3440', border: '1px solid #3a4450', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ color: '#9ab', fontSize: '11px', fontWeight: 700, fontFamily: 'Lato, sans-serif', textTransform: 'uppercase' }}>
        {username.charAt(0)}
      </span>
    </div>
  );
};

/* ─── component ─────────────────────────────────────────────────── */
const Navbar = () => {
  const { state, data, actions } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /* sign-in */
  const [showSignIn, setShowSignIn]     = useState(false);
  const [signEmail, setSignEmail]       = useState('');
  const [signPassword, setSignPassword] = useState('');
  const [signError, setSignError]       = useState('');
  const [signLoading, setSignLoading]   = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  /* modals */
  const [showSignUp, setShowSignUp]   = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  /* dropdowns */
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (to: string) => location.pathname === to;

  /* close user menu on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openSignIn = () => {
    setSignError('');
    setShowSignIn(true);
    setTimeout(() => emailRef.current?.focus(), 50);
  };
  const closeSignIn = () => { setShowSignIn(false); setSignEmail(''); setSignPassword(''); setSignError(''); };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignError('');
    setSignLoading(true);
    try {
      await actions.login({ email: signEmail, password: signPassword });
      closeSignIn();
      navigate(ROUTES.WELCOME);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setSignError(msg || 'Invalid credentials');
    } finally { setSignLoading(false); }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/films?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    actions.logout();
    setUserMenuOpen(false);
    navigate(ROUTES.HOME);
  };

  /* link style */
  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    padding: '16px 10px',
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: 'Lato, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    textDecoration: 'none',
    color: active ? '#fff' : '#9ab',
    borderBottom: active ? '2px solid #00e054' : '2px solid transparent',
    transition: 'color 0.15s',
    whiteSpace: 'nowrap',
  });

  const user = data.user;

  return (
    <>
      <nav style={{ backgroundColor: '#14181c', borderBottom: '1px solid #2c3440', position: 'sticky', top: 0, zIndex: 500 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', minHeight: '52px', gap: '4px' }}>

          {/* ── Logo ─────────────────────────────────── */}
          <Link to={ROUTES.HOME} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0, marginRight: '8px' }}>
            <LetterboxdMark />
            <span style={{ color: '#fff', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '15px', letterSpacing: '0.02em' }}>
              Letterboxd
            </span>
          </Link>

          {/* ═══════════════════════════════════════════════════════
              LOGGED-IN STATE
          ══════════════════════════════════════════════════════════ */}
          {state.isAuthenticated && user ? (
            <>
              {/* Username dropdown trigger */}
              <div ref={userMenuRef} style={{ position: 'relative', marginRight: '4px', flexShrink: 0 }}>
                <button
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: '3px', color: '#9ab' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#9ab'; }}
                >
                  <Avatar username={user.username} avatarUrl={user.avatar_url} />
                  <span style={{ color: 'inherit', fontSize: '12px', fontWeight: 700, fontFamily: 'Lato, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {user.username}
                  </span>
                  <ChevronDown />
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, backgroundColor: '#1c2028', border: '1px solid #2c3440', borderRadius: '4px', minWidth: '160px', zIndex: 600, marginTop: '4px', boxShadow: '0 12px 32px rgba(0,0,0,0.7)', overflow: 'hidden' }}>
                    {userMenuItems(user.username).map((item, idx) =>
                      item === null ? (
                        <div key={`sep-${idx}`} style={{ height: '1px', backgroundColor: '#2c3440', margin: '4px 0' }} />
                      ) : (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={() => setUserMenuOpen(false)}
                          style={{ display: 'block', padding: '9px 16px', color: '#9ab', fontSize: '13px', fontFamily: 'Lato, sans-serif', textDecoration: 'none', transition: 'all 0.1s' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#252d38'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ab'; }}
                        >
                          {item.label}
                        </Link>
                      )
                    )}
                    <button
                      onClick={handleLogout}
                      style={{ display: 'block', width: '100%', padding: '9px 16px', color: '#9ab', fontSize: '13px', fontFamily: 'Lato, sans-serif', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#252d38'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ab'; }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Activity bolt */}
              <Link to={ROUTES.FEED} title="Activity" style={{ display: 'flex', alignItems: 'center', padding: '4px 6px', color: '#9ab', textDecoration: 'none', flexShrink: 0 }}>
                <BoltIcon />
              </Link>

              {/* Nav links */}
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {[
                  { label: 'Films',    to: ROUTES.FILMS },
                  { label: 'Lists',    to: ROUTES.SEARCH },
                  { label: 'Members',  to: ROUTES.USER_SEARCH },
                  { label: 'Journal',  to: ROUTES.JOURNAL },
                  { label: '✨ AI Picks', to: ROUTES.AI_PICKS },
                ].map(link => (
                  <Link key={link.to} to={link.to} style={navLinkStyle(isActive(link.to))}
                    onMouseEnter={e => { if (!isActive(link.to)) e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { if (!isActive(link.to)) e.currentTarget.style.color = '#9ab'; }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Search */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
                {searchOpen ? (
                  <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search films…"
                      autoFocus
                      style={{ backgroundColor: '#1c2028', border: '1px solid #2c3440', borderRadius: '3px', color: '#e5e5e5', fontSize: '12px', fontFamily: 'Lato, sans-serif', padding: '5px 10px', outline: 'none', width: '180px' }}
                      onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                    />
                  </form>
                ) : (
                  <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#9ab', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#9ab'; }}
                  >
                    <SearchIcon />
                  </button>
                )}
              </div>

              {/* + LOG button */}
              <button
                onClick={() => setShowLogModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#00e054', color: '#000', border: 'none', borderRadius: '3px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, fontFamily: 'Lato, sans-serif', letterSpacing: '0.07em', cursor: 'pointer', flexShrink: 0, marginLeft: '6px', transition: 'opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                + Log
              </button>
            </>

          ) : showSignIn ? (
            /* ═══════════════════════════════════════════════════════
                INLINE SIGN-IN FORM
            ════════════════════════════════════════════════════════ */
            <form onSubmit={handleSignIn} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
              <button type="button" onClick={closeSignIn}
                style={{ background: 'none', border: 'none', color: '#678', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '4px 6px', flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#678'; }}
              >×</button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ color: 'rgba(255,255,255,0.35)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Lato, sans-serif' }}>Username</label>
                <input ref={emailRef} type="text" value={signEmail} onChange={e => setSignEmail(e.target.value)} required placeholder="Email or username" style={inlineInput} onFocus={onFocusInput} onBlur={onBlurInput} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ color: 'rgba(255,255,255,0.35)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Lato, sans-serif' }}>Password</label>
                <input type="password" value={signPassword} onChange={e => setSignPassword(e.target.value)} required placeholder="Password" style={inlineInput} onFocus={onFocusInput} onBlur={onBlurInput} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                <a href="#" onClick={e => e.preventDefault()}
                  style={{ color: '#9ab', fontSize: '11px', fontFamily: 'Lato, sans-serif', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#00e054'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#9ab'; }}
                >Forgotten?</a>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: 'rgba(255,255,255,0.38)', fontSize: '11px', fontFamily: 'Lato, sans-serif', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" style={{ accentColor: '#00e054' }} /> Remember me
                </label>
              </div>

              {signError && <span style={{ color: '#f87171', fontSize: '11px', fontFamily: 'Lato, sans-serif' }}>{signError}</span>}

              <button type="submit" disabled={signLoading}
                style={{ backgroundColor: '#00e054', color: '#000', border: 'none', borderRadius: '3px', padding: '6px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: signLoading ? 'not-allowed' : 'pointer', opacity: signLoading ? 0.6 : 1, fontFamily: 'Lato, sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}
              >{signLoading ? '…' : 'SIGN IN'}</button>
            </form>

          ) : (
            /* ═══════════════════════════════════════════════════════
                LOGGED-OUT NAV
            ════════════════════════════════════════════════════════ */
            <>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {LOGGED_OUT_LINKS.map(link => (
                  <Link key={link.to} to={link.to} style={navLinkStyle(isActive(link.to))}
                    onMouseEnter={e => { if (!isActive(link.to)) e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { if (!isActive(link.to)) e.currentTarget.style.color = '#9ab'; }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', flexShrink: 0 }}>
                <button onClick={() => navigate(ROUTES.FILMS)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#9ab', display: 'flex', alignItems: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#9ab'; }}
                  title="Search"
                ><SearchIcon /></button>
                <button onClick={openSignIn}
                  style={{ background: 'none', border: 'none', color: '#9ab', fontSize: '12px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Lato, sans-serif', padding: '4px 0', transition: 'color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#9ab'; }}
                >Sign In</button>
                <button onClick={() => setShowSignUp(true)}
                  style={{ backgroundColor: '#00e054', color: '#000', border: 'none', borderRadius: '3px', padding: '6px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Lato, sans-serif', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >Create Account</button>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* ── Modals ─────────────────────────────────────────────── */}
      {showSignUp && (
        <SignUpModal
          onClose={() => setShowSignUp(false)}
          onSwitchToSignIn={() => { setShowSignUp(false); openSignIn(); }}
        />
      )}
      {showLogModal && (
        <QuickLogModal onClose={() => setShowLogModal(false)} />
      )}
    </>
  );
};

export default Navbar;
