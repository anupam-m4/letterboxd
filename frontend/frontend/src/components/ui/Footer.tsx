const FOOTER_LINKS = [
  { label: 'About',          href: 'https://letterboxd.com/about/faq/' },
  { label: 'Pro',            href: 'https://letterboxd.com/pro/' },
  { label: 'News',           href: 'https://letterboxd.com/journal/' },
  { label: 'Apps',           href: 'https://letterboxd.com/apps/' },
  { label: 'Year in Review', href: 'https://letterboxd.com/2025/' },
  { label: 'Gifts',          href: 'https://letterboxd.com/gift-guide/' },
  { label: 'Help',           href: 'https://letterboxd.com/welcome/' },
  { label: 'Terms',          href: 'https://letterboxd.com/legal/terms-of-use/' },
  { label: 'API',            href: 'https://letterboxd.com/api-beta/' },
  { label: 'Contact',        href: 'https://letterboxd.com/contact/' },
];

/* Social icon svgs (simplified outlines) */
const SocialLinks = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    {[
      { label: 'Instagram', href: 'https://www.instagram.com/letterboxd',    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' },
      { label: 'X/Twitter', href: 'https://x.com/letterboxd',                path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.747-8.87L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
      { label: 'Facebook',  href: 'https://www.facebook.com/letterboxd',     path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
      { label: 'YouTube',   href: 'https://www.youtube.com/letterboxdhq',    path: 'M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z' },
    ].map(s => (
      <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
        style={{ color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d={s.path} />
        </svg>
      </a>
    ))}
  </div>
);

const Footer = () => (
  <footer style={{ backgroundColor: '#14181c', borderTop: '1px solid #2c3440', padding: '32px 24px 24px', marginTop: '60px' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '10px 24px', marginBottom: '18px' }}>
        {FOOTER_LINKS.map(({ label, href }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,0.32)', fontSize: '12px', textDecoration: 'none', fontFamily: 'Lato, sans-serif', transition: 'color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.32)'; }}
          >
            {label}
          </a>
        ))}
        <SocialLinks />
      </div>
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.16)', fontSize: '11px', fontFamily: 'Lato, sans-serif', lineHeight: 1.6 }}>
        © Letterboxd Limited. Made by{' '}
        <a href="#" onClick={e => e.preventDefault()} style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'underline' }}>fans</a>{' '}
        in Aotearoa New Zealand. Film data from{' '}
        <a href="#" onClick={e => e.preventDefault()} style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'underline' }}>TMDB</a>.
      </p>
    </div>
  </footer>
);

export default Footer;
