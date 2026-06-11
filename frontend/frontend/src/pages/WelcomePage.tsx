import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { moviesService } from '../services/movies.service';
import { usersService } from '../services/users.service';
import { buildRoute, ROUTES } from '../constants/routes';
import { useAuth } from '../context/AuthContext';
import type { TmdbSearchResult } from '../types';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import { message } from 'antd';

const TMDB_W = 'https://image.tmdb.org/t/p';

/* ─── eye / heart icons ─────────────────────────────────────── */
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
  </svg>
);

const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const DotsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);

/* ─── feature card ───────────────────────────────────────────── */
const FeatureCard = ({ icon, title, desc }: { icon: string; title: string; desc: string }) => (
  <div style={{ textAlign: 'center', padding: '20px 16px' }}>
    <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
    <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, fontFamily: 'Lato, sans-serif', marginBottom: '8px' }}>{title}</h3>
    <p style={{ color: '#9ab', fontSize: '13px', fontFamily: 'Lato, sans-serif', lineHeight: 1.5 }}>{desc}</p>
  </div>
);

/* ─── film poster for "tell us what you've seen" ─────────────── */
const SeenPoster = ({ film, onMark }: { film: TmdbSearchResult; onMark: (id: number) => void }) => {
  const [watched, setWatched] = useState(false);
  const [hovering, setHovering] = useState(false);

  const handleMark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await usersService.markWatched(film.tmdb_id);
      setWatched(true);
      onMark(film.tmdb_id);
    } catch { message.error('Could not mark as watched'); }
  };

  return (
    <div
      style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden', aspectRatio: '2/3', backgroundColor: '#2c3440', cursor: 'pointer' }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Link to={buildRoute.movieDetail(film.tmdb_id)} style={{ display: 'block', height: '100%' }}>
        {film.poster_path && (
          <img src={`${TMDB_W}/w185${film.poster_path}`} alt={film.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
        {/* Green border if watched */}
        {watched && <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 3px #00e054' }} />}
      </Link>

      {/* Hover overlay with icons */}
      {hovering && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '8px' }}>
          <button
            onClick={handleMark}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: watched ? '#00e054' : 'rgba(255,255,255,0.6)', transition: 'color 0.15s' }}
            title="Mark as watched"
            onMouseEnter={e => { e.currentTarget.style.color = '#00e054'; }}
            onMouseLeave={e => { e.currentTarget.style.color = watched ? '#00e054' : 'rgba(255,255,255,0.6)'; }}
          >
            <EyeIcon />
          </button>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'rgba(255,255,255,0.6)', transition: 'color 0.15s' }}
            title="Like"
            onMouseEnter={e => { e.currentTarget.style.color = '#f5a623'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            <HeartIcon />
          </button>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'rgba(255,255,255,0.6)' }}
            title="More"
          >
            <DotsIcon />
          </button>
        </div>
      )}
    </div>
  );
};

/* ─── section header ────────────────────────────────────────── */
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, fontFamily: 'Lato, sans-serif', marginBottom: '14px' }}>
    {children}
  </h2>
);

const SectionText = ({ children }: { children: React.ReactNode }) => (
  <p style={{ color: '#9ab', fontSize: '14px', fontFamily: 'Lato, sans-serif', lineHeight: 1.65, marginBottom: '12px' }}>
    {children}
  </p>
);

const GreenBtn = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    style={{ display: 'inline-block', backgroundColor: '#00e054', color: '#000', borderRadius: '3px', padding: '9px 20px', fontSize: '12px', fontWeight: 700, fontFamily: 'Lato, sans-serif', textTransform: 'uppercase', letterSpacing: '0.09em', textDecoration: 'none', marginTop: '8px' }}
  >
    {children}
  </Link>
);

/* ─── main page ─────────────────────────────────────────────── */
const WelcomePage = () => {
  const { data } = useAuth();
  const [popularFilms, setPopularFilms] = useState<TmdbSearchResult[]>([]);
  const [heroBackdrop, setHeroBackdrop] = useState<string | null>(null);
  const [markedCount, setMarkedCount] = useState(0);

  useEffect(() => {
    moviesService.getPopular(1).then(res => {
      setPopularFilms(res.results.slice(0, 12));
      const backdrop = (res.results[0] as TmdbSearchResult & { backdrop_path?: string }).backdrop_path;
      if (backdrop) setHeroBackdrop(`${TMDB_W}/w1280${backdrop}`);
    }).catch(console.error);
  }, []);

  const handleMark = () => setMarkedCount(prev => prev + 1);

  const username = data.user?.username || 'there';

  return (
    <div style={{ backgroundColor: '#14181c', minHeight: '100vh', color: '#e5e5e5' }}>
      <Navbar />

      {/* ── Hero backdrop ──────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(280px, 40vh, 460px)',
        backgroundColor: '#0a0e13',
        overflow: 'hidden',
      }}>
        {heroBackdrop && (
          <img src={heroBackdrop} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.55 }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, #14181c 100%)' }} />
        {/* Quote text */}
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', padding: '32px 24px 36px', textAlign: 'center', maxWidth: '700px' }}>
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.4rem, 3vw, 2.1rem)', fontWeight: 800, fontFamily: 'Lato, sans-serif', fontStyle: 'italic', lineHeight: 1.3, marginBottom: '12px', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            That's good! You've taken your first step into a larger world…
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontFamily: 'Lato, sans-serif', lineHeight: 1.6, maxWidth: '560px', margin: '0 auto', marginBottom: '10px', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            Letterboxd lets you keep track of every film you've seen, so you can instantly recommend one the moment someone asks. We're a global community of film fans who live to discuss, rate and rank what we watch.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontFamily: 'Lato, sans-serif', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            Return here any time via the <a href="#" onClick={e => e.preventDefault()} style={{ color: '#00e054', textDecoration: 'none' }}>Help</a> link in the footer of each page.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 60px' }}>

        {/* ── Tell us what you've seen ──────────────────────────── */}
        <section style={{ padding: '52px 0 48px', borderBottom: '1px solid #2c3440', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
          {/* Text */}
          <div>
            <SectionTitle>Tell us what you've seen</SectionTitle>
            <SectionText>
              Get your Letterboxd underway by visiting our{' '}
              <Link to={ROUTES.FILMS} style={{ color: '#00e054', fontWeight: 700, textDecoration: 'none' }}>Popular</Link>{' '}
              section and marking a few films you've seen. Click the 👁 on any film poster to tell us you've watched it. Add a ♥ if you liked it and/or a rating.
            </SectionText>
            <SectionText>
              We add all watched titles to your{' '}
              <Link to={`/users/${username}`} style={{ color: '#00e054', fontWeight: 700, textDecoration: 'none' }}>Films</Link>{' '}
              tab and then we can show you reviews containing spoilers (usually hidden) and other cool stuff.
            </SectionText>
            {markedCount > 0 && (
              <p style={{ color: '#00e054', fontSize: '13px', fontFamily: 'Lato, sans-serif', marginTop: '8px' }}>
                ✓ You've marked {markedCount} film{markedCount > 1 ? 's' : ''} as watched!
              </p>
            )}
          </div>
          {/* Film grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
            {popularFilms.slice(0, 12).map(film => (
              <SeenPoster key={film.tmdb_id} film={film} onMark={handleMark} />
            ))}
          </div>
        </section>

        {/* ── Browse watched films ──────────────────────────────── */}
        <section style={{ padding: '48px 0', borderBottom: '1px solid #2c3440', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
          {/* Visual placeholder */}
          <div style={{ backgroundColor: '#1c2028', border: '1px solid #2c3440', borderRadius: '6px', padding: '20px', minHeight: '160px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #2c3440', paddingBottom: '10px', marginBottom: '4px' }}>
              {['Watched', 'Diary', 'Reviews', 'Ratings'].map((tab, i) => (
                <span key={tab} style={{ color: i === 0 ? '#00e054' : '#9ab', fontSize: '12px', fontFamily: 'Lato, sans-serif', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}>{tab}</span>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2px' }}>
              {popularFilms.slice(0, 12).map(film => (
                <div key={film.tmdb_id} style={{ aspectRatio: '2/3', borderRadius: '2px', overflow: 'hidden', backgroundColor: '#2c3440' }}>
                  {film.poster_path && <img src={`${TMDB_W}/w92${film.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              ))}
            </div>
          </div>
          {/* Text */}
          <div>
            <SectionTitle>Browse your watched films</SectionTitle>
            <SectionText>
              Now that you've added some films, you can find them in the{' '}
              <Link to={`/users/${username}`} style={{ color: '#00e054', fontWeight: 700, textDecoration: 'none' }}>Films</Link>{' '}
              tab of your profile. As you add more content, your profile starts to reflect your taste.
            </SectionText>
            <SectionText>
              You can also browse the films of other members, or the{' '}
              <Link to={ROUTES.USER_SEARCH} style={{ color: '#00e054', fontWeight: 700, textDecoration: 'none' }}>community</Link>,
              with "Hide watched films" activated to find more great films to watch.
            </SectionText>
            <GreenBtn to={`/users/${username}`}>Go to your profile →</GreenBtn>
          </div>
        </section>

        {/* ── Save films to watch later ─────────────────────────── */}
        <section style={{ padding: '48px 0', borderBottom: '1px solid #2c3440', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
          {/* Text */}
          <div>
            <SectionTitle>Save films to watch later</SectionTitle>
            <SectionText>
              One of our most-loved features, the{' '}
              <Link to={ROUTES.WATCHLIST} style={{ color: '#00e054', fontWeight: 700, textDecoration: 'none' }}>Watchlist</Link>,
              lets you keep a list of films you want to see. Start in{' '}
              <Link to={ROUTES.FILMS} style={{ color: '#00e054', fontWeight: 700, textDecoration: 'none' }}>Popular</Link>{' '}
              and mark a few films you want to see. If you subsequently log or mark a film as watched, we'll move it from your Watchlist to your Films.
            </SectionText>
            <GreenBtn to={ROUTES.WATCHLIST}>Go to your watchlist →</GreenBtn>
          </div>
          {/* Watchlist visual */}
          <div style={{ backgroundColor: '#1c2028', border: '1px solid #2c3440', borderRadius: '6px', overflow: 'hidden' }}>
            {popularFilms.slice(6, 9).map((film, idx) => (
              <div key={film.tmdb_id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderBottom: idx < 2 ? '1px solid #2c3440' : 'none' }}>
                <div style={{ width: '32px', height: '48px', borderRadius: '2px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#2c3440' }}>
                  {film.poster_path && <img src={`${TMDB_W}/w92${film.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <span style={{ color: '#e5e5e5', fontSize: '13px', fontFamily: 'Lato, sans-serif', fontWeight: 600 }}>{film.title}</span>
                <span style={{ marginLeft: 'auto', color: '#678', fontSize: '11px', fontFamily: 'Lato, sans-serif' }}>+ Watchlist</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Log a film ───────────────────────────────────────── */}
        <section style={{ padding: '48px 0', borderBottom: '1px solid #2c3440', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
          {/* Text */}
          <div>
            <SectionTitle>Log a film</SectionTitle>
            <SectionText>
              Log a film to tell us you watched it on a particular date, and to attach a review, rating and tags. We put all films you log with a date into your Diary.
            </SectionText>
            <SectionText>
              You can rate films without logging them too, either on a film or review page, or from the '+ Log' button in the top navigation.
            </SectionText>
            <GreenBtn to={ROUTES.FILMS}>Start your diary →</GreenBtn>
          </div>
          {/* "I WATCHED" mock */}
          <div style={{ backgroundColor: '#252d38', border: '1px solid #2c3440', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #2c3440', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', fontFamily: 'Lato, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>I Watched…</span>
              <span style={{ color: '#678', fontSize: '16px' }}>×</span>
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', gap: '12px' }}>
              {popularFilms[0] && (
                <div style={{ width: '52px', height: '78px', borderRadius: '3px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#2c3440' }}>
                  {popularFilms[0].poster_path && <img src={`${TMDB_W}/w185${popularFilms[0].poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700, fontFamily: 'Lato, sans-serif' }}>{popularFilms[0]?.title}</span>
                  {popularFilms[0]?.release_date && <span style={{ color: '#678', fontSize: '13px', marginLeft: '6px', fontFamily: 'Lato, sans-serif' }}>{popularFilms[0].release_date.slice(0,4)}</span>}
                </div>
                <div style={{ backgroundColor: '#1c2028', borderRadius: '3px', padding: '8px 10px', color: '#678', fontSize: '12px', fontFamily: 'Lato, sans-serif', marginBottom: '8px', minHeight: '44px' }}>
                  Add a review…
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#00e054', fontSize: '18px' }}>★★★★</span>
                  <span style={{ color: '#f5a623', fontSize: '16px' }}>♥</span>
                  <button style={{ marginLeft: 'auto', backgroundColor: '#00e054', border: 'none', borderRadius: '3px', color: '#000', fontSize: '11px', fontWeight: 700, fontFamily: 'Lato, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 12px', cursor: 'pointer' }}>Save</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature cards ─────────────────────────────────────── */}
        <section style={{ padding: '48px 0', borderBottom: '1px solid #2c3440' }}>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, fontFamily: 'Lato, sans-serif', textAlign: 'center', marginBottom: '32px' }}>
            More tips and tricks
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0' }}>
            <FeatureCard icon="👁" title="Film actions" desc="Tell us you've seen a film, liked it, and how you rated it. Add it to your Watchlist if you plan to see it later." />
            <FeatureCard icon="⭐" title="Rate films" desc="Give every film a star rating from 1 to 5. Rate films from film pages, review pages, or the +Log menu." />
            <FeatureCard icon="📋" title="Make lists" desc="Lists are a great way to share a collection of related films, or to rank your favorites by genre, star or franchise." />
            <FeatureCard icon="👥" title="Follow members" desc="The best way to find members to follow is by reading reviews of films you like to identify voices and opinions you dig." />
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section style={{ padding: '52px 24px', textAlign: 'center', borderBottom: '1px solid #2c3440' }}>
          <p style={{ color: '#e5e5e5', fontSize: '18px', fontFamily: 'Lato, sans-serif', lineHeight: 1.5, marginBottom: '8px' }}>
            Next up: <Link to={`/users/${username}`} style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>complete your profile</Link>{' '}
            and add some <Link to={ROUTES.FILMS} style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>popular films</Link> you've seen…
          </p>
          <p style={{ color: '#678', fontSize: '13px', fontFamily: 'Lato, sans-serif' }}>
            Then check out our <Link to={ROUTES.USER_SEARCH} style={{ color: '#9ab', textDecoration: 'none' }}>members</Link> page and see our{' '}
            <a href="#" onClick={e => e.preventDefault()} style={{ color: '#9ab', textDecoration: 'none' }}>questions</a> page for more answers.
          </p>
        </section>

        {/* ── Discover more films ───────────────────────────────── */}
        <section style={{ padding: '48px 0' }}>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, fontFamily: 'Lato, sans-serif', marginBottom: '16px', textAlign: 'center' }}>
            Discover more films
          </h2>
          <p style={{ color: '#9ab', fontSize: '13px', fontFamily: 'Lato, sans-serif', textAlign: 'center', marginBottom: '20px' }}>
            Here's a selection of highly rated films to explore.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', marginBottom: '20px' }}>
            {popularFilms.slice(6, 12).map(film => (
              <Link key={film.tmdb_id} to={buildRoute.movieDetail(film.tmdb_id)} style={{ textDecoration: 'none' }}>
                <div style={{ aspectRatio: '2/3', borderRadius: '3px', overflow: 'hidden', backgroundColor: '#2c3440' }}>
                  {film.poster_path && <img src={`${TMDB_W}/w185${film.poster_path}`} alt={film.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link
              to={ROUTES.FILMS}
              style={{ display: 'inline-block', border: '1px solid #9ab', borderRadius: '3px', color: '#9ab', fontSize: '12px', fontFamily: 'Lato, sans-serif', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '9px 20px', textDecoration: 'none' }}
            >
              Browse Popular Films
            </Link>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
};

export default WelcomePage;
