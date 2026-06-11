import { useState } from 'react';
import { aiService } from '../../services/ai.service';

interface Props {
  tmdbId: number;
  reviewCount: number;
}

const SENTIMENT_COLOR: Record<string, string> = {
  positive: '#00e054',
  mixed:    '#f5a623',
  negative: '#e05450',
};

const SENTIMENT_LABEL: Record<string, string> = {
  positive: 'Mostly Positive',
  mixed:    'Mixed',
  negative: 'Mostly Critical',
};

const AiInsights = ({ tmdbId, reviewCount }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [sentiment, setSentiment] = useState<string>('mixed');
  const [error, setError] = useState('');

  if (reviewCount < 3) return null;

  const handleToggle = async () => {
    setOpen(prev => !prev);
    if (summary || error || loading) return;

    setLoading(true);
    try {
      const data = await aiService.getInsights(tmdbId);
      setSummary(data.summary);
      if (data.sentiment) setSentiment(data.sentiment);
    } catch {
      setError('Could not load AI summary.');
    } finally {
      setLoading(false);
    }
  };

  const sentimentColor = SENTIMENT_COLOR[sentiment] ?? '#9ab';

  return (
    <div style={{ marginTop: '32px', borderTop: '1px solid #2c3440', paddingTop: '24px' }}>
      {/* Toggle header */}
      <button
        onClick={handleToggle}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', padding: 0, width: '100%', textAlign: 'left' }}
      >
        <span style={{ fontSize: '16px' }}>✨</span>
        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: 'Lato, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          AI Summary of Reviews
        </span>
        {summary && (
          <span style={{ marginLeft: '8px', color: sentimentColor, fontSize: '11px', fontFamily: 'Lato, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: `${sentimentColor}18`, border: `1px solid ${sentimentColor}40`, borderRadius: '3px', padding: '2px 8px' }}>
            {SENTIMENT_LABEL[sentiment] ?? sentiment}
          </span>
        )}
        <span style={{ marginLeft: 'auto', color: '#678', fontSize: '13px' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {/* Content */}
      {open && (
        <div style={{ marginTop: '16px', backgroundColor: '#1c2028', border: '1px solid #2c3440', borderRadius: '6px', padding: '18px 20px' }}>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#678', fontSize: '13px', fontFamily: 'Lato, sans-serif' }}>
              <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #2c3440', borderTopColor: '#00e054', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Analysing {reviewCount} reviews…
            </div>
          )}

          {error && (
            <p style={{ color: '#f87171', fontSize: '13px', fontFamily: 'Lato, sans-serif', margin: 0 }}>
              {error}
            </p>
          )}

          {summary && (
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ color: sentimentColor, fontSize: '20px', lineHeight: 1, flexShrink: 0, marginTop: '2px' }}>
                {sentiment === 'positive' ? '★' : sentiment === 'negative' ? '☆' : '◈'}
              </div>
              <p style={{ color: '#cdd', fontSize: '14px', fontFamily: 'Lato, sans-serif', lineHeight: 1.7, margin: 0 }}>
                {summary}
              </p>
            </div>
          )}

          {summary && (
            <p style={{ color: '#678', fontSize: '11px', fontFamily: 'Lato, sans-serif', margin: '12px 0 0', letterSpacing: '0.04em' }}>
              AI summary based on {reviewCount} community review{reviewCount !== 1 ? 's' : ''} · Powered by Groq
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AiInsights;
