// src/app/not-found.tsx
// Root not-found renders OUTSIDE the root layout in Next.js App Router,
// so we must include fonts and styles inline.

import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      {/* Self-contained font import — layout fonts are unavailable here */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0A; color: #FAF7F2; font-family: 'Jost', sans-serif; }
        .btn-gold {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: #C9A96E; color: #0A0A0A;
          padding: 14px 36px;
          font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 500;
          letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none;
          transition: background 0.2s;
        }
        .btn-gold:hover { background: #E8D5A3; }
        .btn-outline {
          display: inline-flex; align-items: center; justify-content: center;
          border: 1px solid rgba(201,169,110,0.35); color: rgba(250,247,242,0.7);
          padding: 14px 36px;
          font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 400;
          letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none;
          transition: border-color 0.2s, color 0.2s;
        }
        .btn-outline:hover { border-color: #C9A96E; color: #C9A96E; }
        .sublink { color: rgba(250,247,242,0.3); text-decoration: none; transition: color 0.2s; }
        .sublink:hover { color: #C9A96E; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient gold glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 60%, rgba(201,169,110,0.07) 0%, transparent 65%)',
        }} />

        {/* Fine grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(201,169,110,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 560 }}>

          {/* Brand */}
          <div style={{ marginBottom: '3rem' }}>
            <Link href="/" style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.25rem', fontWeight: 500, letterSpacing: '0.15em',
              color: '#FAF7F2', textDecoration: 'none',
            }}>
              GLAMOUR<span style={{ color: '#C9A96E' }}> AI</span>
            </Link>
          </div>

          {/* Overline */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
            <span style={{ width: 32, height: 1, background: '#C9A96E' }} />
            <span style={{
              fontFamily: "'Jost', sans-serif", fontSize: 10, fontWeight: 400,
              letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A96E',
            }}>404</span>
            <span style={{ width: 32, height: 1, background: '#C9A96E' }} />
          </div>

          {/* Large editorial number */}
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(6rem, 18vw, 11rem)',
            fontWeight: 400, lineHeight: 1,
            color: 'transparent',
            WebkitTextStroke: '1px rgba(201,169,110,0.25)',
            letterSpacing: '-0.02em',
            marginBottom: '1.5rem',
            userSelect: 'none',
          }}>
            404
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 400, color: '#FAF7F2',
            lineHeight: 1.15, marginBottom: '1rem',
          }}>
            Page Not Found
          </h1>

          {/* Body */}
          <p style={{
            fontFamily: "'Jost', sans-serif", fontSize: '0.95rem', fontWeight: 300,
            color: 'rgba(250,247,242,0.45)', lineHeight: 1.7,
            marginBottom: '2.5rem',
          }}>
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Divider */}
          <div style={{
            width: 40, height: 1, background: 'rgba(201,169,110,0.3)',
            margin: '0 auto 2.5rem',
          }} />

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn-gold">Go Home</Link>
            <Link href="/products" className="btn-outline">Shop Collection</Link>
          </div>

          {/* Sub-links */}
          <div style={{
            marginTop: '3rem',
            display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap',
          }}>
            {[
              { href: '/tryon',    label: 'Virtual Try-On' },
              { href: '/products?category=makeup',    label: 'Makeup' },
              { href: '/products?category=skincare',  label: 'Skincare' },
              { href: '/products?category=fragrance', label: 'Fragrance' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="sublink" style={{
                fontFamily: "'Jost', sans-serif", fontSize: 10,
                letterSpacing: '0.2em', textTransform: 'uppercase',
              }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
