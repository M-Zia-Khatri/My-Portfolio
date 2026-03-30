import { useEffect, useState } from 'react';

type Subscriber = (isActive: boolean) => void;

type SectionObserverController = {
  id: string;
  isActive: boolean;
  observer: IntersectionObserver | null;
  target: HTMLElement | null;
  subscribers: Set<Subscriber>;
  debounceTimer: ReturnType<typeof setTimeout> | null;
  attachTimer: ReturnType<typeof setInterval> | null;
};

const ACTIVE_THRESHOLD = 0.5;
const UPDATE_DEBOUNCE_MS = 90;
const ATTACH_RETRY_MS = 180;
const controllers = new Map<string, SectionObserverController>();

function emit(controller: SectionObserverController, nextValue: boolean) {
  if (controller.isActive === nextValue) return;
  controller.isActive = nextValue;
  controller.subscribers.forEach((notify) => notify(nextValue));
}

function teardownController(controller: SectionObserverController) {
  controller.observer?.disconnect();
  controller.observer = null;

  if (controller.debounceTimer) {
    clearTimeout(controller.debounceTimer);
    controller.debounceTimer = null;
  }

  if (controller.attachTimer) {
    clearInterval(controller.attachTimer);
    controller.attachTimer = null;
  }
}

function attachObserver(controller: SectionObserverController) {
  if (typeof window === 'undefined') return;
  if (controller.observer || controller.target) return;

  const maybeAttach = () => {
    const sectionElement = document.getElementById(controller.id);
    if (!sectionElement) return;

    controller.target = sectionElement;
    controller.observer = new IntersectionObserver(
      ([entry]) => {
        const nextValue = entry.isIntersecting && entry.intersectionRatio >= ACTIVE_THRESHOLD;

        if (controller.debounceTimer) clearTimeout(controller.debounceTimer);
        controller.debounceTimer = setTimeout(() => {
          emit(controller, nextValue);
        }, UPDATE_DEBOUNCE_MS);
      },
      { threshold: ACTIVE_THRESHOLD },
    );

    controller.observer.observe(sectionElement);

    if (controller.attachTimer) {
      clearInterval(controller.attachTimer);
      controller.attachTimer = null;
    }
  };

  maybeAttach();

  if (!controller.target) {
    controller.attachTimer = setInterval(maybeAttach, ATTACH_RETRY_MS);
  }
}

function getOrCreateController(sectionId: string): SectionObserverController {
  const existing = controllers.get(sectionId);
  if (existing) return existing;

  const controller: SectionObserverController = {
    id: sectionId,
    isActive: false,
    observer: null,
    target: null,
    subscribers: new Set(),
    debounceTimer: null,
    attachTimer: null,
  };

  controllers.set(sectionId, controller);
  attachObserver(controller);
  return controller;
}

export function useSectionActive(sectionId: string): boolean {
  const [isActive, setIsActive] = useState<boolean>(() => getOrCreateController(sectionId).isActive);

  useEffect(() => {
    const controller = getOrCreateController(sectionId);
    const subscriber: Subscriber = (nextValue) => setIsActive(nextValue);
    controller.subscribers.add(subscriber);

    attachObserver(controller);

    return () => {
      controller.subscribers.delete(subscriber);

      if (controller.subscribers.size === 0) {
        teardownController(controller);
        controllers.delete(sectionId);
      }
    };
  }, [sectionId]);

  return isActive;
}
