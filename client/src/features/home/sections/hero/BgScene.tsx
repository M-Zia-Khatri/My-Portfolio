import gsap from "gsap";
import { useEffect, useRef } from "react";

type SVGWithCleanup = SVGSVGElement & {
  _cleanup?: () => void;
};

export default function BgScene() {
  const svgRef = useRef<SVGWithCleanup | null>(null);
  const linesRef = useRef<SVGPathElement[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const smoothMouseRef = useRef({ x: -9999, y: -9999 });
  const rectCacheRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    let animation: gsap.core.Tween | null = null;

    const init = () => {
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (!w || !h) {
        requestAnimationFrame(init);
        return;
      }

      sizeRef.current = { w, h };
      rectCacheRef.current = rect;

      while (svg.firstChild) svg.removeChild(svg.firstChild);
      linesRef.current = [];

      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

      const count = Math.ceil(w / 10);
      const SEGMENTS = 160;

      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
      gradient.setAttribute("id", "bg-line-stroke-gradient");
      gradient.setAttribute("x1", "0%");
      gradient.setAttribute("y1", "0%");
      gradient.setAttribute("x2", "0%");
      gradient.setAttribute("y2", "100%");

      const topStop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      topStop.setAttribute("offset", "0%");
      topStop.setAttribute("stop-color", "#76c7eb");
      topStop.setAttribute("stop-opacity", "1");

      const holdStop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      holdStop.setAttribute("offset", "85%");
      holdStop.setAttribute("stop-color", "#76c7eb");
      holdStop.setAttribute("stop-opacity", "1");

      const fadeStop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      fadeStop.setAttribute("offset", "100%");
      fadeStop.setAttribute("stop-color", "#76c7eb");
      fadeStop.setAttribute("stop-opacity", "0");

      gradient.append(topStop, holdStop, fadeStop);
      defs.appendChild(gradient);
      svg.appendChild(defs);

      const parts: string[] = new Array(SEGMENTS + 1);

      const yValues = new Float32Array(SEGMENTS + 1);
      for (let s = 0; s <= SEGMENTS; s++) {
        yValues[s] = (s / SEGMENTS) * h;
      }

      for (let i = 0; i < count; i++) {
        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        ) as SVGPathElement;

        path.setAttribute("stroke", "url(#bg-line-stroke-gradient)");
        path.setAttribute("stroke-width", "1");
        path.setAttribute("opacity", "0.5");
        path.setAttribute("fill", "none");

        svg.appendChild(path);
        linesRef.current[i] = path;
      }

      const baseXValues = new Float32Array(count);
      const linePhasePrimary = new Float32Array(count);
      const linePhaseSecondary = new Float32Array(count);
      const linePhaseDrift = new Float32Array(count);
      const lineWaveMix = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        baseXValues[i] = i * 10.5;

        const seedA = Math.sin(i * 12.9898) * 43758.5453;
        const seedB = Math.sin((i + 19) * 78.233) * 19341.9812;
        const seedC = Math.sin((i + 37) * 23.193) * 9317.1231;

        const randA = seedA - Math.floor(seedA);
        const randB = seedB - Math.floor(seedB);
        const randC = seedC - Math.floor(seedC);

        linePhasePrimary[i] = i * 0.24 + randA * Math.PI * 2;
        linePhaseSecondary[i] = i * 0.13 + randB * Math.PI * 2;
        linePhaseDrift[i] = i * 0.09 + randC * Math.PI * 2;
        lineWaveMix[i] = 0.8 + randC * 0.4;
      }

      const driftAmplitude = 11;
      const driftFrequency = 0.08;
      const waveAmpPrimary = 9.5;
      const waveAmpSecondary = 4.5;
      const waveAmpTertiary = 1.8;
      const waveFreqPrimary = 0.017;
      const waveFreqSecondary = 0.031;
      const waveFreqTertiary = 0.062;
      const waveSpeedPrimary = 0.85;
      const waveSpeedSecondary = 0.58;
      const waveSpeedTertiary = 0.33;
      const fieldCoupling = 0.0048;
      const mouseRadius = 40;
      const mouseRadiusSq = mouseRadius ** 2;
      const carveStrength = 0.95;
      const pushDist = mouseRadius * carveStrength;
      const lerpFactor = 0.3;

      const state = { t: 0 };

      animation = gsap.to(state, {
        t: 1000000,
        duration: 1200000,
        ease: "none",
        onUpdate: () => {
          const lines = linesRef.current;
          const t = state.t;

          // Smooth mouse
          smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * lerpFactor;
          smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * lerpFactor;

          const mx = smoothMouseRef.current.x;
          const my = smoothMouseRef.current.y;
          const isActive = mouseRef.current.x !== -9999;

          for (let i = 0; i < lines.length; i++) {
            const localMix = lineWaveMix[i];
            const baseX =
              baseXValues[i] +
              Math.sin(t * 0.42 + linePhaseDrift[i] + i * driftFrequency) *
                driftAmplitude *
                localMix;
            const phasePrimary = linePhasePrimary[i];
            const phaseSecondary = linePhaseSecondary[i];

            for (let s = 0; s <= SEGMENTS; s++) {
              const y = yValues[s];
              const fieldPhase = y * fieldCoupling + i * 0.021;
              const flowPrimary = Math.sin(
                y * waveFreqPrimary + t * waveSpeedPrimary + phasePrimary + fieldPhase,
              );
              const flowSecondary = Math.sin(
                y * waveFreqSecondary - t * waveSpeedSecondary + phaseSecondary + fieldPhase * 0.7,
              );
              const flowTertiary = Math.sin(
                y * waveFreqTertiary + t * waveSpeedTertiary + phasePrimary * 0.35,
              );
              let x =
                baseX +
                flowPrimary * waveAmpPrimary * localMix +
                flowSecondary * waveAmpSecondary +
                flowTertiary * waveAmpTertiary;

              if (isActive) {
                const dx = x - mx;
                const dy = y - my;
                const distSq = dx * dx + dy * dy;

                if (distSq < mouseRadiusSq) {
                  const dist = Math.sqrt(distSq);
                  const angle = Math.atan2(dy, dx);
                  const blend = 1 - dist / mouseRadius;
                  const smooth = blend * blend * (3 - 2 * blend);

                  x = mx + Math.cos(angle) * (dist + (pushDist - dist) * smooth);
                }
              }

              parts[s] =
                s === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : `L${x.toFixed(2)} ${y.toFixed(2)}`;
            }

            lines[i].setAttribute("d", parts.join(" "));
          }
        },
      });

      const handleMouseMove = (e: MouseEvent) => {
        const r = rectCacheRef.current;
        if (!r) return;

        mouseRef.current = {
          x: e.clientX - r.left,
          y: e.clientY - r.top,
        };
      };

      const handleMouseLeave = () => {
        mouseRef.current = { x: -9999, y: -9999 };
      };

      let resizeTimer: ReturnType<typeof setTimeout>;

      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          animation?.kill();
          init();
        }, 200);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("resize", handleResize);

      svg._cleanup = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseleave", handleMouseLeave);
        window.removeEventListener("resize", handleResize);
        animation?.kill();
      };
    };

    requestAnimationFrame(init);

    return () => {
      svgRef.current?._cleanup?.();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 h-dvh w-full">
      <svg ref={svgRef} className="h-full w-full" />
    </div>
  );
}
