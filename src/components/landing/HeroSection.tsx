import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";

const FLOWER_BG = "/flowers/lily-bg.webp";
const FLOWER_FG = "/flowers/lily-fg.webp";

const HeroSection = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const flowerRef = useRef<HTMLDivElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const topLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const flower = flowerRef.current;
    const bgLayer = bgLayerRef.current;
    const topLayer = topLayerRef.current;
    if (!stage || !flower || !bgLayer || !topLayer) return;

    const reduced = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const isCoarse = globalThis.matchMedia?.("(pointer: coarse)").matches;
    const isNarrow = globalThis.innerWidth < 900;
    if (isCoarse && isNarrow) return;

    const TRAIL_MAX_POINTS = 60;
    const TRAIL_HEAD_R = 140;
    const TRAIL_NOISE_AMP = 44;
    const TRAIL_BLOB_PTS = 24;
    const TRAIL_FADE_SPEED = 0.92;
    const TRAIL_SAMPLE_DIST = 8;
    const HIDDEN_MASK = "linear-gradient(#0000, #0000)";

    const layers: {
      el: HTMLDivElement;
      invert: boolean;
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D | null;
      url: string | null;
    }[] = [
      { el: bgLayer, invert: false, canvas: document.createElement("canvas"), ctx: null, url: null },
      { el: topLayer, invert: true, canvas: document.createElement("canvas"), ctx: null, url: null },
    ];

    for (const layer of layers) {
      layer.ctx = layer.canvas.getContext("2d");
      layer.canvas.style.display = "none";
      document.body.append(layer.canvas);
    }

    type Point = { x: number; y: number; r: number; alpha: number; seed: number };
    const points: Point[] = [];
    let headRadius = 0;
    let hovering = false;
    let time = 0;
    let rafId: number | null = null;
    const mouse = { cx: 0, cy: 0 };
    const lastSample = { x: -1e9, y: -1e9 };

    const syncCanvases = () => {
      const rect = flower.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      for (const layer of layers) {
        if (layer.canvas.width !== w || layer.canvas.height !== h) {
          layer.canvas.width = w;
          layer.canvas.height = h;
        }
      }
      return rect;
    };

    const drawMorphBlob = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      r: number,
      t: number,
      seed: number,
    ) => {
      if (r < 2) return;
      const pts: { x: number; y: number }[] = Array.from({ length: TRAIL_BLOB_PTS }, () => ({ x: 0, y: 0 }));
      for (let i = 0; i < TRAIL_BLOB_PTS; i++) {
        const angle = (i / TRAIL_BLOB_PTS) * Math.PI * 2;
        const n1 = Math.sin(angle * 3 + t * 1.4 + seed) * 0.45;
        const n2 = Math.sin(angle * 5 - t * 0.9 + seed * 2.3) * 0.3;
        const n3 = Math.cos(angle * 2 + t * 1.8 + seed * 0.7) * 0.25;
        const noise = (n1 + n2 + n3) * TRAIL_NOISE_AMP * (r / TRAIL_HEAD_R);
        pts[i] = { x: cx + Math.cos(angle) * (r + noise), y: cy + Math.sin(angle) * (r + noise) };
      }
      ctx.beginPath();
      const lastIdx = TRAIL_BLOB_PTS - 1;
      ctx.moveTo((pts[lastIdx].x + pts[0].x) / 2, (pts[lastIdx].y + pts[0].y) / 2);
      for (let i = 0; i < TRAIL_BLOB_PTS; i++) {
        const p = pts[i];
        const q = pts[(i + 1) % TRAIL_BLOB_PTS];
        ctx.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2);
      }
      ctx.closePath();
      ctx.fill();
    };

    const applyMask = (layer: (typeof layers)[number], value: string) => {
      layer.el.style.maskImage = value;
      (layer.el.style as unknown as Record<string, string>).webkitMaskImage = value;
      layer.el.style.maskSize = "100% 100%";
      layer.el.style.maskRepeat = "no-repeat";
      (layer.el.style as unknown as Record<string, string>).webkitMaskSize = "100% 100%";
      (layer.el.style as unknown as Record<string, string>).webkitMaskRepeat = "no-repeat";
    };

    const paint = (layer: (typeof layers)[number]) => {
      const { ctx, canvas } = layer;
      if (!ctx) return;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      if (!layer.invert) {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "destination-out";
      }
      for (const p of points) drawMorphBlob(ctx, p.x, p.y, p.r, time, p.seed);
      const url = `url(${canvas.toDataURL()})`;
      if (layer.url !== url) {
        layer.url = url;
        applyMask(layer, url);
      }
    };

    const restoreMasks = () => {
      for (const layer of layers) {
        layer.url = null;
        applyMask(layer, layer.invert ? HIDDEN_MASK : "");
      }
    };

    const frame = () => {
      rafId = null;
      time += 0.016;
      const targetR = hovering ? TRAIL_HEAD_R : 0;
      headRadius += (targetR - headRadius) * (hovering ? 0.14 : 0.04);
      const rect = syncCanvases();
      const sx = rect.width > 0 ? layers[0].canvas.width / rect.width : 1;
      const sy = rect.height > 0 ? layers[0].canvas.height / rect.height : 1;
      const mx = (mouse.cx - rect.left) * sx;
      const my = (mouse.cy - rect.top) * sy;

      if (hovering && headRadius > 5) {
        const dx = mx - lastSample.x;
        const dy = my - lastSample.y;
        if (dx * dx + dy * dy > TRAIL_SAMPLE_DIST * TRAIL_SAMPLE_DIST) {
          points.push({ x: mx, y: my, r: headRadius, alpha: 1, seed: Math.random() * 100 });
          lastSample.x = mx;
          lastSample.y = my;
          if (points.length > TRAIL_MAX_POINTS) points.shift();
        }
      }

      for (const p of points) {
        p.alpha *= TRAIL_FADE_SPEED;
        p.r *= 0.995;
      }
      for (let i = points.length - 1; i >= 0; i--) {
        if (points[i].alpha < 0.01) points.splice(i, 1);
      }

      if (headRadius > 0.5 || points.length > 0) {
        for (const layer of layers) paint(layer);
        rafId = globalThis.requestAnimationFrame(frame);
      } else {
        points.length = 0;
        headRadius = 0;
        lastSample.x = -1e9;
        lastSample.y = -1e9;
        restoreMasks();
      }
    };

    const wake = () => {
      if (rafId === null) rafId = globalThis.requestAnimationFrame(frame);
    };

    const onEnter = (e: MouseEvent) => {
      hovering = true;
      mouse.cx = e.clientX;
      mouse.cy = e.clientY;
      wake();
    };
    const onMove = (e: MouseEvent) => {
      mouse.cx = e.clientX;
      mouse.cy = e.clientY;
      hovering = true;
      wake();
    };
    const onLeave = () => {
      hovering = false;
      wake();
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      mouse.cx = t.clientX;
      mouse.cy = t.clientY;
      hovering = true;
      wake();
    };

    stage.addEventListener("mouseenter", onEnter);
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseleave", onLeave);
    stage.addEventListener("touchmove", onTouchMove, { passive: true });

    const onResize = () => syncCanvases();
    globalThis.addEventListener("resize", onResize);
    syncCanvases();

    const hero = stage.closest(".fastorbit-hero") as HTMLElement | null;
    let entranceDone = false;
    const finish = () => {
      if (entranceDone || !hero) return;
      entranceDone = true;
      hero.classList.remove("fastorbit-hero--anim");
    };
    const onAnimEnd = (e: AnimationEvent) => {
      const name = (e as unknown as { animationName: string }).animationName;
      if (name === "fastorbit-corner" || name === "fastorbit-stage") finish();
    };
    document.addEventListener("animationend", onAnimEnd as unknown as EventListener);
    const tId = globalThis.setTimeout(finish, 6000);

    return () => {
      globalThis.removeEventListener("resize", onResize);
      stage.removeEventListener("mouseenter", onEnter);
      stage.removeEventListener("mousemove", onMove);
      stage.removeEventListener("mouseleave", onLeave);
      stage.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("animationend", onAnimEnd as unknown as EventListener);
      globalThis.clearTimeout(tId);
      if (rafId !== null) globalThis.cancelAnimationFrame(rafId);
      for (const layer of layers) {
        layer.canvas.remove();
      }
      restoreMasks();
    };
  }, []);

  return (
    <section className='fastorbit-hero fastorbit-hero--anim' aria-label='Fast Orbit hero'>
      <style>{`
        .fastorbit-hero {
          --bloom-from: #f5c2e7;
          --bloom-to: #cba6f7;
          --bloom-soft: #f2cdcd;
          --orb-reveal: cubic-bezier(0.16, 1, 0.3, 1);
          --orb-soft: cubic-bezier(0.25, 0.8, 0.28, 1);
          position: relative;
          isolation: isolate;
          overflow: hidden;
          background: var(--background);
          color: var(--foreground);
          border-bottom: 1px solid var(--border);
        }
        .fastorbit-hero__stage {
          position: relative;
          width: 100%;
          min-height: max(88dvh, 640px);
          padding-top: 96px;
          padding-bottom: 24px;
          contain: layout style;
          isolation: isolate;
          background: var(--background);
          overflow: hidden;
        }
        .fastorbit-hero__glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(680px 420px at 78% 22%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 68%),
            radial-gradient(560px 360px at 18% 78%, color-mix(in oklab, var(--primary) 11%, transparent), transparent 70%),
            radial-gradient(520px 340px at 12% 20%, color-mix(in oklab, var(--bloom-soft) 7%, transparent), transparent 72%);
          opacity: 1;
        }
        .dark .fastorbit-hero__glow {
          background:
            radial-gradient(680px 420px at 78% 22%, color-mix(in oklab, var(--primary) 9%, transparent), transparent 68%),
            radial-gradient(560px 360px at 18% 78%, color-mix(in oklab, var(--primary) 7%, transparent), transparent 70%),
            radial-gradient(520px 340px at 12% 20%, color-mix(in oklab, var(--bloom-soft) 5%, transparent), transparent 72%);
          opacity: 0.92;
        }
        /* Flower — theme-aware, still the hero art */
        .flower {
          position: absolute;
          top: 13.5dvh;
          left: 57.2vw;
          height: 106dvh;
          z-index: 2;
          transform: translate(var(--flower-x, -50%), var(--flower-y, 0px));
          pointer-events: none;
          opacity: 1;
        }
        .dark .flower {
          opacity: 0.92;
        }
        .flower__sizer {
          display: block;
          height: 100%;
          width: auto;
          visibility: hidden;
        }
        .flower__layer {
          position: absolute;
          inset: 0;
        }
        .flower__layer img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
        }
        .flower__layer--top {
          -webkit-mask-image: linear-gradient(#0000, #0000);
          mask-image: linear-gradient(#0000, #0000);
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
        }

        /* Contained content — theme aware */
        .hero-container {
          position: relative;
          z-index: 4;
          width: 100%;
          max-width: 80rem;
          margin-inline: auto;
          padding-inline: 1rem;
          display: flex;
          align-items: center;
          min-height: max(88dvh, 640px);
          padding-top: 96px;
          padding-bottom: 24px;
          margin-top: -96px;
          margin-bottom: -24px;
          pointer-events: none;
        }
        @media (min-width: 640px) {
          .hero-container { padding-inline: 1.5rem; }
        }
        @media (min-width: 1024px) {
          .hero-container { padding-inline: 2rem; }
        }
        .hero-content {
          pointer-events: auto;
          width: min(560px, 100%);
          max-width: 560px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .hero-title {
          margin: 0 0 14px;
          font-family: "Poppins", system-ui, sans-serif;
          font-size: clamp(32px, 4.05vw, 54px);
          line-height: 0.98;
          letter-spacing: -0.03em;
          font-weight: 600;
          color: var(--foreground);
          text-wrap: balance;
        }
        .hero-title__accent {
          background: linear-gradient(180deg, var(--bloom-from) 0%, var(--bloom-to) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .hero-desc {
          margin: 0 0 26px;
          font-size: clamp(15px, 1.28vw, 18px);
          line-height: 1.55;
          color: var(--muted-foreground);
          max-width: 36ch;
          text-wrap: pretty;
        }
        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 8px;
        }
        .hero-actions .hero-btn-primary {
          background: var(--primary);
          color: var(--primary-foreground);
          border: 1px solid var(--primary);
          font-weight: 600;
          box-shadow: 0 8px 32px color-mix(in oklab, var(--primary) 22%, transparent), 0 1px 0 rgba(255,255,255,0.12) inset;
        }
        .hero-actions .hero-btn-primary:hover {
          filter: brightness(1.05);
          transform: translateY(-1px);
        }
        .hero-actions .hero-btn-ghost {
          background: var(--surface-1);
          color: var(--foreground);
          border: 1px solid var(--border);
          font-weight: 500;
        }
        .hero-actions .hero-btn-ghost:hover {
          background: var(--surface-2);
          border-color: var(--border-strong);
          color: var(--foreground);
        }
        .hero-hint {
          margin: 18px 0 0;
          font-size: 11.5px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--muted-foreground);
          opacity: 0.72;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        /* Entrance */
        @keyframes fastorbit-word {
          from { transform: translateY(118%); }
          to { transform: translateY(0); }
        }
        @keyframes fastorbit-subject {
          from { opacity: 0; transform: translate(var(--flower-x, -50%), calc(var(--flower-y, 0px) + 3.4dvh)); }
          to { opacity: 1; transform: translate(var(--flower-x, -50%), var(--flower-y, 0px)); }
        }
        @keyframes fastorbit-corner {
          from { opacity: 0; transform: translateY(1.2dvh); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fastorbit-quiet {
          from { opacity: 0; transform: translateY(0.9dvh); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fastorbit-stage { from { opacity: 0; } to { opacity: 1; } }
        .fastorbit-hero--anim .flower { animation: fastorbit-subject 1150ms var(--orb-reveal) 660ms both; }
        .fastorbit-hero--anim .support-copy__inner { animation: fastorbit-corner 720ms var(--orb-soft) 980ms both; }
        .fastorbit-hero--anim .hero-content { animation: fastorbit-quiet 720ms var(--orb-soft) 840ms both; }
        @media (prefers-reduced-motion: reduce) {
          .fastorbit-hero--anim .flower,
          .fastorbit-hero--anim .support-copy__inner,
          .fastorbit-hero--anim .hero-content { animation: none; }
          .fastorbit-hero--anim .fastorbit-hero__stage { animation: fastorbit-stage 280ms ease-out both; }
        }
        /* Responsive — tablet */
        @media (max-width: 1100px), (max-aspect-ratio: 4 / 5) {
          .flower { left: 58vw; }
        }
        /* Mobile — stack */
        @media (max-width: 860px), (max-aspect-ratio: 4 / 5) {
          .fastorbit-hero__stage {
            min-height: auto;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            padding-top: 84px;
            padding-bottom: 0;
          }
          .flower {
            position: relative;
            top: auto;
            left: auto;
            right: auto;
            height: min(52dvh, 92vw);
            width: fit-content;
            max-width: 92vw;
            margin: 8px auto 4px;
            transform: none;
            display: block;
          }
          .fastorbit-hero--anim .flower {
            animation-name: fastorbit-quiet;
            animation-duration: 800ms;
          }
          .hero-container {
            min-height: auto;
            margin-top: 0;
            margin-bottom: 0;
            padding-top: 18px;
            padding-bottom: 28px;
            align-items: flex-start;
          }
          .hero-content {
            width: 100%;
            max-width: none;
          }
          .hero-title { font-size: clamp(30px, 8.2vw, 42px); }
          .hero-desc { font-size: 16px; }
          .hero-hint { display: none; }
        }
        @media (max-aspect-ratio: 4 / 5) {
          .flower { height: min(46dvh, 98vw); }
        }
        .fastorbit-hero__stage { cursor: default; }
        .hero-content a, .hero-content button { pointer-events: auto; }
      `}</style>

      <div ref={stageRef} className='fastorbit-hero__stage'>
        <div className='fastorbit-hero__glow' aria-hidden />

        <div ref={flowerRef} className='flower' aria-hidden>
          <img className='flower__sizer' src={FLOWER_BG} alt='' aria-hidden />
          <div ref={bgLayerRef} className='flower__layer flower__layer--bg'>
            <img
              src={FLOWER_BG}
              alt='Pixel-art pink and violet lily bloom — Fast Orbit hero flower'
              decoding='async'
              fetchPriority='high'
              draggable={false}
            />
          </div>
          <div ref={topLayerRef} className='flower__layer flower__layer--top' aria-hidden>
            <img src={FLOWER_FG} alt='' decoding='async' draggable={false} />
          </div>
        </div>

        <div className='hero-container'>
          <div className='hero-content'>
            <h1 className='hero-title'>
              Build faster with <span className='hero-title__accent'>Fast Orbit</span>
            </h1>

            <p className='hero-desc'>
              A TanStack Start SSG starter on Cloudflare Pages. Type-safe routing, Query caching, Charts & Table — all
              wired with Base UI, Tailwind and virtualized patterns. Clone and ship.
            </p>

            <div className='hero-actions'>
              <Link
                to='/'
                hash='quick-start'
                onClick={(e) => {
                  const id = "quick-start";
                  const el = document.querySelector(`#${id}`);
                  if (el) {
                    e.preventDefault();
                    const offset = 80;
                    const top = el.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: "smooth" });
                    history.pushState(null, "", `/#${id}`);
                  }
                }}
                className='w-full sm:w-auto'>
                <Button size='lg' className='hero-btn-primary w-full gap-2 rounded-full px-7'>
                  Get Started
                  <ArrowRight className='size-4' aria-hidden />
                </Button>
              </Link>
            </div>

            <p className='hero-hint'>
              <MousePointerClick className='size-3' aria-hidden />
              Move your cursor across the bloom — watch it reveal
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
