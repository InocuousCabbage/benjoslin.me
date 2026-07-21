"use client";

import { useEffect, useRef, useState } from "react";

/**
 * V2 signature moment: footer constellation.
 *
 * A dark canvas layer rendered above the footer copyright, showing a
 * scattered field of ~90 white dots at low opacity plus faint
 * connecting lines between neighbors within ~120px. Ambient drift
 * moves each dot slowly with a small per-particle sine offset so
 * nothing feels lock-stepped.
 *
 * Cursor interactivity: when the cursor is within the canvas bounds
 * plus a small margin, dots within ~120px of the cursor push away with
 * a soft inverse-square-ish force, then relax back toward their
 * ambient drift. Feels like a small physics playground under the eye.
 *
 * Battery discipline:
 * - IntersectionObserver-gated: rAF only runs while the canvas is at
 *   least 5% in the viewport. Scroll away, loop parks.
 * - prefers-reduced-motion: skip the rAF loop entirely; render a
 *   static one-frame field of dots + lines so the constellation still
 *   reads visually without motion.
 * - coarse pointer: skip the cursor-tracking branch (touch devices
 *   have no persistent cursor); ambient drift still plays.
 * matchMedia change listeners cover mid-session toggles.
 *
 * Pointer semantics: the canvas is pointer-events-none decoration so
 * it never intercepts clicks or blocks V3's glitch-hover on the
 * copyright line. Cursor tracking uses a window-level mousemove and
 * getBoundingClientRect on the canvas to check if the pointer is over
 * the constellation.
 */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  phase: number;
};

const PARTICLE_COUNT = 90;
const NEIGHBOR_RADIUS = 120;
const CURSOR_RADIUS = 120;
const CURSOR_FORCE = 0.8;
const DRIFT = 0.02;

function seedParticles(width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      baseX: x,
      baseY: y,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return particles;
}

export function FooterParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const cursorRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });
  const [motionOk, setMotionOk] = useState(true);
  const [visible, setVisible] = useState(false);
  const [trackCursor, setTrackCursor] = useState(false);

  // matchMedia gates.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverFine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const evaluate = () => {
      setMotionOk(!reduce.matches);
      setTrackCursor(hoverFine.matches);
    };
    evaluate();
    reduce.addEventListener("change", evaluate);
    hoverFine.addEventListener("change", evaluate);
    return () => {
      reduce.removeEventListener("change", evaluate);
      hoverFine.removeEventListener("change", evaluate);
    };
  }, []);

  // IntersectionObserver: park the loop when scrolled offscreen.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);
    return () => io.disconnect();
  }, []);

  // Cursor tracking: window-level mousemove so the canvas can stay
  // pointer-events-none decoration.
  useEffect(() => {
    if (!trackCursor) return;
    const onMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const withinX = e.clientX >= rect.left && e.clientX <= rect.right;
      const withinY = e.clientY >= rect.top && e.clientY <= rect.bottom;
      cursorRef.current.x = e.clientX - rect.left;
      cursorRef.current.y = e.clientY - rect.top;
      cursorRef.current.active = withinX && withinY;
    };
    const onLeave = () => {
      cursorRef.current.active = false;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [trackCursor]);

  // Canvas rendering loop (or single static frame for reduced-motion).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize handler.
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = seedParticles(rect.width, rect.height);
    };
    resize();
    const resizeObs = new ResizeObserver(resize);
    resizeObs.observe(canvas);

    const drawStatic = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      const particles = particlesRef.current;
      // Draw connecting lines.
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < NEIGHBOR_RADIUS) {
            const alpha = (1 - dist / NEIGHBOR_RADIUS) * 0.15;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      // Draw dots.
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (!motionOk) {
      // Reduced-motion path: paint one static frame + skip the loop.
      drawStatic();
      return () => {
        resizeObs.disconnect();
      };
    }

    if (!visible) {
      // Not scrolled in: paint the current state once so if the canvas
      // ends up in view without moving (short pages) the field is
      // visible, but don't start the rAF loop.
      drawStatic();
      return () => {
        resizeObs.disconnect();
      };
    }

    const tick = (t: number) => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      const particles = particlesRef.current;
      const cursor = cursorRef.current;

      // Update each particle: ambient drift + optional cursor repel.
      for (const p of particles) {
        // Ambient sine drift around base position.
        const t2 = t * 0.0004 + p.phase;
        p.vx += Math.sin(t2) * DRIFT;
        p.vy += Math.cos(t2 * 1.3) * DRIFT;
        p.vx *= 0.9;
        p.vy *= 0.9;

        // Cursor repel if within radius.
        if (cursor.active) {
          const dx = p.x - cursor.x;
          const dy = p.y - cursor.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < CURSOR_RADIUS * CURSOR_RADIUS && distSq > 0.5) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / CURSOR_RADIUS) * CURSOR_FORCE;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Spring back toward base position so drift + cursor pushes
        // don't scatter the field permanently.
        p.vx += (p.baseX - p.x) * 0.003;
        p.vy += (p.baseY - p.y) * 0.003;
        p.x += p.vx;
        p.y += p.vy;
      }

      // Connecting lines.
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < NEIGHBOR_RADIUS) {
            const alpha = (1 - dist / NEIGHBOR_RADIUS) * 0.15;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Dots.
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      resizeObs.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [motionOk, visible]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none block h-32 w-full sm:h-40"
    />
  );
}
