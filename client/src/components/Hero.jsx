import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { HERO_POSTER, HERO_VIDEO } from '../lib/api.js';
import { Icon } from './ui.jsx';

const LOAD_TIMEOUT_MS = 8000;
/** After this many seconds of walkthrough the copy reveals; the video keeps looping softly behind it. */
const TEXT_AFTER_S = 7;

/**
 * Cinematic full-viewport hero.
 * Phases: loading -> playing -> done.
 *  - loading: branded loader until the video can play (or 8s timeout / error -> fallback image)
 *  - playing: the walkthrough plays full-screen; a skip control is available
 *  - done: after the intro (ended, ~7s cap, skipped, failed or reduced-motion); the copy animates
 *    up from the bottom while the video keeps looping behind it — playback is never interrupted
 * A thin progress bar at the bottom reflects the real video position (resets on loop).
 */
export default function Hero() {
  const reduce = useReducedMotion();
  const videoRef = useRef(null);
  const [phase, setPhase] = useState(HERO_VIDEO && !reduce ? 'loading' : 'done');
  const [failed, setFailed] = useState(!HERO_VIDEO);
  const [progress, setProgress] = useState(0);

  const fail = () => { setFailed(true); setPhase('done'); };

  useEffect(() => {
    if (phase !== 'loading') return;
    const t = setTimeout(fail, LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [phase]);

  const onReady = async () => {
    if (phase !== 'loading') return;
    try { await videoRef.current.play(); setPhase('playing'); } catch { fail(); }
  };

  const finish = () => {
    const v = videoRef.current;
    if (v) { v.loop = true; v.play().catch(() => {}); }
    setPhase('done');
  };

  const onTimeUpdate = (e) => {
    const v = e.currentTarget;
    setProgress(v.duration ? v.currentTime / v.duration : 0);
    if (phase === 'playing' && v.currentTime >= TEXT_AFTER_S) finish();
  };

  const showText = phase === 'done';
  const showVideo = !failed && HERO_VIDEO;
  return (
    <section className={`hero ${showText ? 'is-ready' : ''}`} aria-label="Welcome">
      <div className="hero-media" aria-hidden="true">
        {showVideo ? (
          <video ref={videoRef} className="hero-video" src={HERO_VIDEO} poster={HERO_POSTER} muted playsInline preload="auto"
            onCanPlay={onReady} onEnded={finish} onTimeUpdate={onTimeUpdate} onError={fail} />
        ) : (
          <img className="hero-video" src={HERO_POSTER} alt="" />
        )}
      </div>
      <div className="hero-scrim" aria-hidden="true" />

      <div className="container hero-inner">
        <AnimatePresence mode="wait">
          {showText && (
            <motion.div className="hero-text" key="copy" initial={reduce ? false : { opacity: 0, y: 44 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              <span className="eyebrow">Shailesh.dev — Nagpur&apos;s trusted property partner</span>
              <h1>Find a Place That <span className="accent">Feels Like Home.</span></h1>
              <p className="hero-sub">Discover exceptional properties, extraordinary spaces, and opportunities worth exploring — guided by honest advice and deep local knowledge.</p>
              <div className="hero-cta">
                <Link className="btn btn-orange" to="/properties">Explore Properties <Icon name="arrow" size={18} /></Link>
                <Link className="btn btn-ghost" to="/contact">Book a Visit</Link>
              </div>
              <div className="hero-stats" aria-label="Company highlights">
                <div className="stat"><b>420+</b><span>Properties listed</span></div>
                <div className="stat"><b>1,800+</b><span>Families served</span></div>
                <div className="stat"><b>14 yrs</b><span>Local expertise</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showText && (
          <motion.div className="scroll-cue" key="cue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.9, duration: 0.6 }} aria-hidden="true">
            <span className="scroll-mouse"><span /></span>
            Scroll to explore
          </motion.div>
        )}
      </AnimatePresence>

      {showVideo && <div className="hero-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>}

      <AnimatePresence>
        {phase === 'loading' && (
          <motion.div className="hero-loader" role="status" aria-live="polite" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <svg viewBox="0 0 120 90" width="82" aria-hidden="true" fill="none" stroke="#ff8a3d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <motion.path d="M10 45 60 8l50 37M20 40v42h80V40M50 82V56h20v26" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }} />
            </svg>
            <p className="hero-loader-brand">Shailesh<span>.dev</span></p>
            <p>Preparing your tour…</p>
          </motion.div>
        )}
      </AnimatePresence>
      {phase === 'playing' && <button className="skip-video" onClick={finish}>Skip intro</button>}
    </section>
  );
}
