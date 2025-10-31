import React from 'react';

type Props = {
  variant?: 'both' | 'boxes' | 'words';
  className?: string;
  ariaLabel?: string;
};

export default function LoadingAnimations({ 
  variant = 'both', 
  className = '', 
  ariaLabel = 'Loading content' 
}: Props) {
  // If user prefers reduced motion, show a simple text status
  const prefersReduced = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReduced) {
    return (
      <div role="status" aria-live="polite" className={`loading-animations ${className}`}>
        <div className="card" style={{ background: 'transparent', padding: '0.25rem 0.5rem', borderRadius: 6 }}>
          <div className="loader" style={{ color: '#888', fontSize: 14 }}>{ariaLabel}…</div>
        </div>
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" aria-label={ariaLabel} className={`loading-animations ${className}`}>
      {(variant === 'both' || variant === 'boxes') && (
        <div className="boxes" aria-hidden>
          <div className="box">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="box">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="box">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="box">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      )}

      {(variant === 'both' || variant === 'words') && (
        <div className="card" aria-hidden>
          <div className="loader">
            <div className="words" aria-hidden>
              <span className="word">Restoring notes</span>
              <span className="word">Loading content</span>
              <span className="word">Preparing your session</span>
              <span className="word">Almost ready</span>
              <span className="word">Welcome back</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
