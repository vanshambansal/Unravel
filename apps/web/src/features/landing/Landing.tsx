'use client';
import { LandingNavigation } from './LandingNavigation';
import { LandingStory } from './LandingStory';
import type { LandingExample } from './story-example';
import { useEffect, useRef, type CSSProperties } from 'react';
import './landing.css';

export function Landing({
  example,
  posters,
}: {
  example: LandingExample;
  posters: Record<'startDesktop' | 'heroDesktop' | 'startMobile' | 'heroMobile', string>;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    void import('./motion/controller')
      .then(({ mountLandingMotion }) => {
        if (!cancelled && root.current) cleanup = mountLandingMotion(root.current);
      })
      .catch(() => {
        if (cancelled || !root.current) return;
        root.current.classList.add('static');
        const status = root.current.querySelector('#status');
        if (status) status.textContent = 'Motion is unavailable. Static architectural view shown.';
      });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);
  return (
    <div
      className="unravel-landing"
      data-landing-root
      ref={root}
      style={
        {
          '--poster-start-desktop': `url("${posters.startDesktop}")`,
          '--poster-hero-desktop': `url("${posters.heroDesktop}")`,
          '--poster-start-mobile': `url("${posters.startMobile}")`,
          '--poster-hero-mobile': `url("${posters.heroMobile}")`,
        } as CSSProperties
      }
    >
      <a className="skip-content" href="#study">
        Skip to product information
      </a>
      <LandingNavigation />
      <main>
        <section id="journey" aria-label="The Unravel architectural entrance">
          <div id="stage" className="stage">
            <div className="poster" aria-hidden="true"></div>
            <canvas id="scene" aria-hidden="true" />
            <canvas id="hero-rays" className="hero-rays" aria-hidden="true" />
            <div className="hero-shade" aria-hidden="true"></div>
            <div className="vignette" aria-hidden="true"></div>

            <button id="enable-scene" className="cinematic-enable" type="button" hidden>
              Enable 3D
            </button>
            <div className="entrance" id="entrance">
              <p className="eyebrow">01 / THE THRESHOLD</p>
              <p className="entrance-title">
                A failure is only
                <br />
                the beginning.
              </p>
              <p className="muted">Follow the sequence behind the screen.</p>
              <p className="scroll-cue">
                <span />
                SCROLL TO ENTER
              </p>
            </div>
            <div className="hero" id="hero">
              <p className="eyebrow reveal" id="hero-eyebrow">
                FROM THE MOMENT IT BREAKS
              </p>
              <h1 className="reveal" id="hero-title" tabIndex={-1}>
                Every bug
                <br />
                has a story.
              </h1>
              <p className="hero-description reveal" id="hero-description">
                Untangle the sequence behind bugs.
                <br />
                <span>Record. Replay. Review. Export a regression test.</span>
              </p>
              <div className="actions reveal" id="hero-actions">
                <a className="button light" href="/app">
                  Get started <span aria-hidden="true">↗</span>
                </a>
                <a className="button quiet" href="#study">
                  See the workflow
                </a>
              </div>
            </div>
            <ol className="workflow reveal" id="workflow" aria-label="Unravel workflow">
              <li>
                <span>01</span> Record
              </li>
              <li>
                <span>02</span> Replay
              </li>
              <li>
                <span>03</span> Review
              </li>
              <li>
                <span>04</span> Export
              </li>
            </ol>
            <p className="scene-caption">UNRAVEL / FOLLOW THE SEQUENCE</p>
            <p className="status" id="status" role="status"></p>
          </div>
        </section>
        <section className="landing-product-content" aria-label="Explore Unravel">
          <LandingStory example={example} />
        </section>
      </main>

      <noscript>
        <style>{`.unravel-landing .poster{background-image:var(--poster-hero-desktop,url(/landing/artwork/scene-hero-desktop.png))}.unravel-landing .entrance,.unravel-landing #skip,.unravel-landing #ambient{display:none}.unravel-landing .hero,.unravel-landing .reveal{opacity:1!important;visibility:visible!important;transform:none!important}.unravel-landing .stage{position:relative}.unravel-landing #journey{height:100svh}.unravel-landing .workflow{transform:translateX(-50%)!important}@media(max-width:700px){.unravel-landing .poster{background-image:var(--poster-hero-mobile,url(/landing/artwork/scene-hero-mobile.png))}}`}</style>
      </noscript>
    </div>
  );
}
