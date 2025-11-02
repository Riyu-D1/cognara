import React from 'react';

type Props = {
  variant?: 'both' | 'boxes' | 'words' | 'typewriter';
  className?: string;
  ariaLabel?: string;
};

export default function LoadingAnimations({ 
  variant = 'typewriter', 
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
      {/* Typewriter animation on top */}
      {(variant === 'typewriter' || variant === 'both') && (
        <div className="typewriter-container" aria-hidden>
          <div className="typewriter">
            <div className="slide">
              <i></i>
            </div>
            <div className="paper"></div>
            <div className="keyboard"></div>
          </div>
        </div>
      )}

      {/* Text flipping animation below */}
      {(variant === 'typewriter' || variant === 'both' || variant === 'words') && (
        <div className="card" aria-hidden>
          <div className="loader">
            <div className="words" aria-hidden>
              <span className="word">Analyzing content</span>
              <span className="word">Generating notes</span>
              <span className="word">Preparing your material</span>
              <span className="word">Almost ready</span>
              <span className="word">Just a moment</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
