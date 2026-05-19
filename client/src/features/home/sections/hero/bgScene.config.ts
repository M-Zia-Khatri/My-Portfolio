export type BgSceneConfig = {
  animation: {
    cycleRadians: number;
    durationSeconds: number;
    repeat: number;
  };
  svg: {
    namespace: string;
    gradient: {
      id: string;
      x1: string;
      y1: string;
      x2: string;
      y2: string;
      stops: Array<{
        offset: string;
        color: string;
        opacity: string;
      }>;
    };
    line: {
      strokeWidth: string;
      opacity: string;
      fill: string;
    };
  };
  layout: {
    baseXStep: number;
    horizontalOverscanLines: number;
    lineSpacingDivisorDesktop: number;
    lineSpacingDivisorTablet: number;
    lineSpacingDivisorMobile: number;
    segmentsDesktop: number;
    segmentsTablet: number;
    segmentsMobile: number;
    resizeDebounceMs: number;
    initRetryDelayMs: number;
    maxInitRetries: number;
  };
  breakpoints: {
    mobileMaxWidth: number;
    tabletMaxWidth: number;
  };
  interaction: {
    inactiveMouse: { x: number; y: number };
    mouseRadius: number;
    carveStrength: number;
    lerpFactor: number;
  };
  wave: {
    driftAmplitude: number;
    driftFrequency: number;
    primary: { amplitude: number; frequency: number; speed: number };
    secondary: { amplitude: number; frequency: number; speed: number };
    linePhasePrimaryMultiplier: number;
    linePhaseSecondaryMultiplier: number;
  };
};

export const BG_SCENE_CONFIG: BgSceneConfig = {
  animation: {
    cycleRadians: Math.PI * 2,
    durationSeconds: 6,
    repeat: -1,
  },
  svg: {
    namespace: "http://www.w3.org/2000/svg",
    gradient: {
      id: "bg-line-stroke-gradient",
      x1: "0%",
      y1: "0%",
      x2: "0%",
      y2: "100%",
      stops: [
        { offset: "0%", color: "#76c7eb", opacity: "1" },
        { offset: "85%", color: "#76c7eb", opacity: "1" },
        { offset: "100%", color: "#76c7eb", opacity: "0" },
      ],
    },
    line: {
      strokeWidth: "1",
      opacity: "0.5",
      fill: "none",
    },
  },
  layout: {
    baseXStep: 10.5,
    horizontalOverscanLines: 4,
    lineSpacingDivisorDesktop: 10,
    lineSpacingDivisorTablet: 12,
    lineSpacingDivisorMobile: 14,
    segmentsDesktop: 160,
    segmentsTablet: 120,
    segmentsMobile: 88,
    resizeDebounceMs: 200,
    initRetryDelayMs: 80,
    maxInitRetries: 40,
  },
  breakpoints: {
    mobileMaxWidth: 767,
    tabletMaxWidth: 1023,
  },
  interaction: {
    inactiveMouse: { x: -9999, y: -9999 },
    mouseRadius: 40,
    carveStrength: 0.95,
    lerpFactor: 0.3,
  },
  wave: {
    driftAmplitude: 18,
    driftFrequency: 0.2,
    primary: { amplitude: 11, frequency: 0.022, speed: 1.35 },
    secondary: { amplitude: 6, frequency: 0.038, speed: 0.95 },
    linePhasePrimaryMultiplier: 0.31,
    linePhaseSecondaryMultiplier: 0.17,
  },
};
