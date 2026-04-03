import { useState, useEffect } from 'react';

/**
 * ReadingProgressBar — thin gradient bar fixed at the top of the viewport
 * that fills as the user scrolls down the page.
 */
export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };

    window.addEventListener('scroll', update, { passive: true });
    update(); // initial call
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 9999,
        background: 'rgba(255,255,255,0.05)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
          transition: 'width 0.1s linear',
          boxShadow: '0 0 8px var(--color-primary)',
        }}
      />
    </div>
  );
}
