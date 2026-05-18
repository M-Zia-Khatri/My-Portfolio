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
      for (let s = 0; s <= SEGMENTS; s++) yValues[s] = (s / SEGMENTS) * h;

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
      const phasePrimary = new Float32Array(count);
      const phaseSecondary = new Float32Array(count);
      const ampPrimary = new Float32Array(count);
      const ampSecondary = new Float32Array(count);
      const speedPrimary = new Float32Array(count);
      const speedSecondary = new Float32Array(count);
      const turbulenceAmp = new Float32Array(count);
      const turbulenceSpeed = new Float32Array(count);
      const turbulencePhase = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        baseXValues[i] = i * 10.5;

        const seedA = Math.sin(i * 12.9898) * 43758.5453;
        const seedB = Math.sin((i + 13) * 78.233) * 19341.9812;
        const seedC = Math.sin((i + 29) * 23.193) * 9317.1231;

        const randA = seedA - Math.floor(seedA);
        const randB = seedB - Math.floor(seedB);
        const randC = seedC - Math.floor(seedC);

        phasePrimary[i] = i * 0.29 + randA * Math.PI * 2;
        phaseSecondary[i] = i * 0.19 + randB * Math.PI * 2;

        ampPrimary[i] = 8.5 + randA * 5.5;
        ampSecondary[i] = 4.5 + randB * 4.25;

        speedPrimary[i] = 1.05 + randA * 0.55;
        speedSecondary[i] = 0.7 + randB * 0.45;

        turbulenceAmp[i] = 0.9 + randC * 1.8;
        turbulenceSpeed[i] = 0.45 + randC * 0.45;
        turbulencePhase[i] = randC * Math.PI * 2;
      }

      const driftAmplitude = 14;
      const driftFrequency = 0.13;
      const waveFreqPrimary = 0.02;
      const waveFreqSecondary = 0.036;
      const turbulenceFreq = 0.085;
      const mouseRadius = 52;
      const mouseRadiusSq = mouseRadius ** 2;
      const carveStrength = 0.82;
      const pushDist = mouseRadius * carveStrength;
      const mouseLerpFactor = 0.22;

      const state = { t: 0 };

      animation = gsap.to(state, {
        t: Math.PI * 2,
        duration: 7.5,
        repeat: -1,
        ease: "none",
        onUpdate: () => {
          const lines = linesRef.current;
          const t = state.t;

          smoothMouseRef.current.x +=
            (mouseRef.current.x - smoothMouseRef.current.x) * mouseLerpFactor;
          smoothMouseRef.current.y +=
            (mouseRef.current.y - smoothMouseRef.current.y) * mouseLerpFactor;

          const mx = smoothMouseRef.current.x;
          const my = smoothMouseRef.current.y;
          const isActive = mouseRef.current.x !== -9999;

          for (let i = 0; i < lines.length; i++) {
            const baseX = baseXValues[i] + Math.sin(t + i * driftFrequency) * driftAmplitude;

            for (let s = 0; s <= SEGMENTS; s++) {
              const y = yValues[s];
              const waveA = Math.sin(y * waveFreqPrimary + t * speedPrimary[i] + phasePrimary[i]);
              const waveB = Math.sin(
                y * waveFreqSecondary - t * speedSecondary[i] + phaseSecondary[i],
              );
              const micro = Math.sin(
                y * turbulenceFreq + t * turbulenceSpeed[i] + turbulencePhase[i],
              );

              let x =
                baseX + waveA * ampPrimary[i] + waveB * ampSecondary[i] + micro * turbulenceAmp[i];

              if (isActive) {
                const dx = x - mx;
                const dy = y - my;
                const distSq = dx * dx + dy * dy;

                if (distSq < mouseRadiusSq) {
                  const dist = Math.sqrt(distSq);
                  const angle = Math.atan2(dy, dx);
                  const blend = 1 - dist / mouseRadius;
                  const smooth = blend * blend * (3 - 2 * blend);
                  const eased = smooth * smooth;

                  const targetX = mx + Math.cos(angle) * (dist + (pushDist - dist) * eased);
                  x += (targetX - x) * 0.72;
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
