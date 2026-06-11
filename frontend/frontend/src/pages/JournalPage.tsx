import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import { journalService } from '../services/journal.service';
import type { JournalArticle } from '../types';

const SECTIONS = [
  { name: 'Awards', desc: null },
  { name: 'Big Picture', desc: null },
  { name: 'Cinemascope', desc: 'Film news, previews, themes and trends.' },
  { name: 'Community', desc: 'Member interviews, data dives, official top lists and other cool stats.' },
  { name: 'Deep Impact', desc: 'Another look at films with lasting or growing cultural influence.' },
  { name: 'Festival Circuit', desc: 'Festival and award season coverage.' },
  { name: 'Interview', desc: 'Conversations with people who make movies.' },
  { name: 'Life in Film', desc: null },
  { name: 'Platform', desc: 'The inside word on Letterboxd features and upgrades.' },
  { name: 'Podcast', desc: null },
  { name: 'Shelf Life', desc: null },
  { name: 'Year in Review', desc: 'Our annual (and mid-year) look back at the films that resonated the most.' },
];

const fmt = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ArticleImg = ({ src, alt, style }: { src: string | null; alt: string; style?: React.CSSProperties }) => (
  <div style={{ overflow: 'hidden', backgroundColor: '#dde3ec', ...style }}>
    {src ? (
      <img
        src={src}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      />
    ) : (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#c8d0da' }} />
    )}
  </div>
);

const CategoryTag = ({ category, date }: { category: string; date: string }) => (
  <p style={{ color: '#6c8695', fontSize: '12px', fontFamily: 'Lato, sans-serif', margin: '10px 0 6px', letterSpacing: '0.02em' }}>
    <span style={{ fontStyle: 'italic' }}>{category}</span>
    <span style={{ margin: '0 6px' }}>·</span>
    {fmt(date)}
  </p>
);

const AuthorTag = ({ author }: { author: string }) => (
  <p style={{ color: '#6c8695', fontSize: '11px', fontFamily: 'Lato, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '8px 0 0' }}>
    {author}
  </p>
);

const ArticleCard3Col = ({ article }: { article: JournalArticle }) => (
  <div style={{ flex: '1 1 0', minWidth: 0 }}>
    <ArticleImg src={article.image_url} alt={article.title} style={{ width: '100%', height: '200px' }} />
    <CategoryTag category={article.category} date={article.published_at} />
    <div style={{ color: '#243040', fontSize: '14px', fontFamily: 'Georgia, serif', lineHeight: 1.5, margin: '0 0 6px' }}>
      <span style={{ fontWeight: 700 }}>{article.title}</span>{' '}
      <SubtitleInline text={article.subtitle} />
    </div>
    <AuthorTag author={article.author} />
  </div>
);

const SubtitleInline = ({ text }: { text: string | null }) =>
  text ? <span style={{ fontStyle: 'italic' }}>{text}</span> : null;

const ArticleCard2Col = ({ article }: { article: JournalArticle }) => (
  <div style={{ flex: '1 1 0', minWidth: 0 }}>
    <ArticleImg src={article.image_url} alt={article.title} style={{ width: '100%', height: '230px' }} />
    <CategoryTag category={article.category} date={article.published_at} />
    <div style={{ color: '#243040', fontSize: '14px', fontFamily: 'Georgia, serif', lineHeight: 1.5, margin: '0 0 6px' }}>
      <span style={{ fontWeight: 700 }}>{article.title}</span>{' '}
      <SubtitleInline text={article.subtitle} />
    </div>
    <AuthorTag author={article.author} />
  </div>
);

const SectionHeader = ({ name, desc }: { name: string; desc?: string | null }) => (
  <div style={{ borderTop: '1px solid #c8d0da', paddingTop: '18px', marginTop: '48px', marginBottom: '20px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
      <h2 style={{ color: '#243040', fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: 700, margin: 0 }}>{name}</h2>
      {desc && <span style={{ color: '#6c8695', fontSize: '13px', fontFamily: 'Lato, sans-serif', fontStyle: 'italic' }}>{desc}</span>}
    </div>
    <a href="#" onClick={e => e.preventDefault()} style={{ color: '#6c8695', fontSize: '12px', fontFamily: 'Lato, sans-serif', textDecoration: 'none', letterSpacing: '0.05em' }}
      onMouseEnter={e => { e.currentTarget.style.color = '#243040'; }}
      onMouseLeave={e => { e.currentTarget.style.color = '#6c8695'; }}>
      MORE &gt;
    </a>
  </div>
);

const JournalPage = () => {
  const [featured, setFeatured] = useState<JournalArticle | null>(null);
  const [latest, setLatest] = useState<JournalArticle[]>([]);
  const [spotlight, setSpotlight] = useState<JournalArticle[]>([]);
  const [deepImpact, setDeepImpact] = useState<JournalArticle[]>([]);
  const [interviews, setInterviews] = useState<JournalArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      journalService.getFeatured(),
      journalService.getAll(9),
      journalService.getSpotlight(4),
      journalService.getByCategory('Deep Impact', 3),
      journalService.getByCategory('Interview', 3),
    ])
      .then(([feat, all, spot, deep, inter]) => {
        setFeatured(feat);
        setLatest(all.filter(a => !a.is_featured).slice(0, 9));
        setSpotlight(spot);
        setDeepImpact(deep);
        setInterviews(inter);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f5f7' }}>
      <Navbar />

      {/* Journal sub-nav */}
      <div style={{ backgroundColor: '#3d4f5d', borderBottom: '1px solid #2d3f4d' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px' }}>
          <span style={{ color: '#fff', fontFamily: 'Lato, sans-serif', fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Journal
          </span>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Sections', 'Newsletter'].map(label => (
              <button key={label}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontFamily: 'Lato, sans-serif', fontSize: '13px', cursor: 'pointer', padding: '0 2px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              >
                {label} <span style={{ fontSize: '10px' }}>▾</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 60px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* Featured hero article */}
            {featured && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', backgroundColor: '#3d4f5d', marginBottom: '40px' }}>
                <ArticleImg
                  src={featured.image_url}
                  alt={featured.title}
                  style={{ height: '420px' }}
                />
                <div style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', fontFamily: 'Lato, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>
                    {featured.category}
                  </p>
                  <h1 style={{ color: '#fff', fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 700, lineHeight: 1.3, marginBottom: '18px', cursor: 'pointer', textDecoration: 'underline' }}>
                    {featured.title}
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Georgia, serif', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>
                    {featured.subtitle}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontFamily: 'Lato, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
                    {featured.author}
                  </p>
                </div>
              </div>
            )}

            {/* Latest articles — 3 column grid */}
            {latest.length > 0 && (
              <>
                <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
                  {latest.slice(0, 3).map(a => <ArticleCard3Col key={a.id} article={a} />)}
                </div>
                {latest.length > 3 && (
                  <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
                    {latest.slice(3, 6).map(a => <ArticleCard3Col key={a.id} article={a} />)}
                  </div>
                )}
                {latest.length > 6 && (
                  <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
                    {latest.slice(6, 9).map(a => <ArticleCard3Col key={a.id} article={a} />)}
                  </div>
                )}
              </>
            )}

            {/* "Older articles >" link */}
            <div style={{ textAlign: 'right', borderTop: '1px solid #c8d0da', paddingTop: '12px', marginBottom: '48px' }}>
              <a href="#" onClick={e => e.preventDefault()} style={{ color: '#6c8695', fontSize: '13px', fontFamily: 'Lato, sans-serif', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#243040'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#6c8695'; }}>
                Older articles &gt;
              </a>
            </div>

            {/* Spotlight section — 2 column pairs */}
            {spotlight.length > 0 && (
              <>
                <SectionHeader name="Spotlight" desc="Favorites from the Letterboxd archive." />
                <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
                  {spotlight.slice(0, 2).map(a => <ArticleCard2Col key={a.id} article={a} />)}
                </div>
                {spotlight.length > 2 && (
                  <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
                    {spotlight.slice(2, 4).map(a => <ArticleCard2Col key={a.id} article={a} />)}
                  </div>
                )}
              </>
            )}

            {/* Deep Impact section */}
            {deepImpact.length > 0 && (
              <>
                <SectionHeader name="Deep Impact" desc="Another look at films with lasting or growing cultural influence." />
                <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
                  {deepImpact.map(a => <ArticleCard3Col key={a.id} article={a} />)}
                </div>
              </>
            )}

            {/* Interview section */}
            {interviews.length > 0 && (
              <>
                <SectionHeader name="Interview" desc="Conversations with people who make movies." />
                <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
                  {interviews.map(a => <ArticleCard3Col key={a.id} article={a} />)}
                </div>
              </>
            )}

            {/* Bottom sections index */}
            <div style={{ backgroundColor: '#3d4f5d', margin: '48px -24px -60px', padding: '40px 24px 48px' }}>
              <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                {/* Sections columns */}
                <div>
                  <h3 style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Lato, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '20px' }}>
                    Sections
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 32px' }}>
                    {SECTIONS.map(s => (
                      <a key={s.name} href="#" onClick={e => e.preventDefault()}
                        style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', fontFamily: 'Lato, sans-serif', textDecoration: 'none', display: 'block', padding: '3px 0' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}>
                        {s.name}
                      </a>
                    ))}
                  </div>

                  {/* Search box */}
                  <div style={{ marginTop: '28px', borderBottom: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', paddingBottom: '6px', maxWidth: '320px' }}>
                    <input
                      type="text"
                      placeholder="Search..."
                      style={{ background: 'none', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.6)', fontFamily: 'Lato, sans-serif', fontSize: '14px', flex: 1 }}
                    />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                </div>

                {/* Masthead */}
                <div>
                  <h3 style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Lato, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '20px' }}>
                    Masthead
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Georgia, serif', fontSize: '14px', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '20px' }}>
                    <em>Journal</em> is Letterboxd's online magazine. Our mission is to get more films, big and small, onto your watchlists, spotlight the best writing from our community, and bring you news from our crew behind the scenes. Along the way, we dig deeper into the movies we're obsessed with, meet the people who make them, and explore the culture that surrounds them.
                  </p>
                  <a href="#" onClick={e => e.preventDefault()} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', fontFamily: 'Lato, sans-serif', textDecoration: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}>
                    RSS Feed
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default JournalPage;
