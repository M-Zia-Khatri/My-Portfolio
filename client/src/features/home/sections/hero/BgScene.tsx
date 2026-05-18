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

      const count = Math.ceil(w / 9);
      const SEGMENTS = 180;

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
      const phaseTertiary = new Float32Array(count);
      const ampPrimary = new Float32Array(count);
      const ampSecondary = new Float32Array(count);
      const ampTertiary = new Float32Array(count);
      const speedPrimary = new Float32Array(count);
      const speedSecondary = new Float32Array(count);
      const speedTertiary = new Float32Array(count);
      const turbulenceAmp = new Float32Array(count);
      const turbulenceSpeed = new Float32Array(count);
      const turbulencePhase = new Float32Array(count);
      const lineInfluence = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        baseXValues[i] = i * 10.5;

        const seedA = Math.sin(i * 12.9898) * 43758.5453;
        const seedB = Math.sin((i + 13) * 78.233) * 19341.9812;
        const seedC = Math.sin((i + 29) * 23.193) * 9317.1231;
        const seedD = Math.sin((i + 47) * 5.398) * 13249.6517;

        const randA = seedA - Math.floor(seedA);
        const randB = seedB - Math.floor(seedB);
        const randC = seedC - Math.floor(seedC);
        const randD = seedD - Math.floor(seedD);

        phasePrimary[i] = i * 0.26 + randA * Math.PI * 2;
        phaseSecondary[i] = i * 0.17 + randB * Math.PI * 2;
        phaseTertiary[i] = i * 0.11 + randD * Math.PI * 2;

        ampPrimary[i] = 7.5 + randA * 4.5;
        ampSecondary[i] = 2.8 + randB * 3.2;
        ampTertiary[i] = 1.2 + randD * 1.9;

        speedPrimary[i] = 0.85 + randA * 0.42;
        speedSecondary[i] = 0.52 + randB * 0.34;
        speedTertiary[i] = 0.34 + randD * 0.25;

        turbulenceAmp[i] = 0.35 + randC * 0.85;
        turbulenceSpeed[i] = 0.22 + randC * 0.23;
        turbulencePhase[i] = randC * Math.PI * 2;
        lineInfluence[i] = 0.75 + randD * 0.35;
      }

      const driftAmplitude = 9;
      const driftFrequency = 0.09;
      const waveFreqPrimary = 0.017;
      const waveFreqSecondary = 0.029;
      const waveFreqTertiary = 0.051;
      const turbulenceFreq = 0.079;
      const mouseRadius = 64;
      const mouseRadiusSq = mouseRadius ** 2;
      const carveStrength = 0.7;
      const pushDist = mouseRadius * carveStrength;
      const mouseLerpFactor = 0.14;

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
              const waveC = Math.sin(
                y * waveFreqTertiary + t * speedTertiary[i] + phaseTertiary[i],
              );
              const micro = Math.sin(
                y * turbulenceFreq + t * turbulenceSpeed[i] + turbulencePhase[i],
              );

              let x =
                baseX +
                (waveA * ampPrimary[i] + waveB * ampSecondary[i] + waveC * ampTertiary[i]) *
                  lineInfluence[i] +
                micro * turbulenceAmp[i];

              if (isActive) {
                const dx = x - mx;
                const dy = y - my;
                const distSq = dx * dx + dy * dy;

                if (distSq < mouseRadiusSq) {
                  const dist = Math.sqrt(distSq);
                  const angle = Math.atan2(dy, dx);
                  const blend = 1 - dist / mouseRadius;
                  const smooth = blend * blend * (3 - 2 * blend);
                  const eased = smooth * smooth * (1.5 - 0.5 * smooth);

                  const targetX = mx + Math.cos(angle) * (dist + (pushDist - dist) * eased);
                  x += (targetX - x) * 0.48;
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
