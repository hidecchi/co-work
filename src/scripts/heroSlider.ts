const INTERVAL = 4000;
const TRANSITION = "transform 1s cubic-bezier(0.65, 0, 0.35, 1)";

export function initHeroSlider(root: HTMLElement | null) {
  const track = root?.querySelector<HTMLElement>("[data-hero-track]");
  if (!root || !track) return () => {};

  const slides = [...track.children] as HTMLElement[];
  // The track renders the slide set three times so it can loop seamlessly.
  const setSize = slides.length / 3;
  if (setSize < 2) return () => {};

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  let index = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  const step = () => slides[1].offsetLeft - slides[0].offsetLeft;

  const apply = (animate: boolean) => {
    track.style.transition = animate ? TRANSITION : "none";
    track.style.transform = `translateX(${-index * step()}px)`;
  };

  const next = () => {
    index += 1;
    apply(true);
  };

  const onTransitionEnd = () => {
    if (index < setSize) return;
    index -= setSize;
    apply(false);
  };

  const start = () => {
    if (!timer) timer = setInterval(next, INTERVAL);
  };

  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  const onVisibility = () => (document.hidden ? stop() : start());
  const onResize = () => apply(false);

  track.addEventListener("transitionend", onTransitionEnd);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("resize", onResize);
  start();

  return () => {
    stop();
    track.removeEventListener("transitionend", onTransitionEnd);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("resize", onResize);
  };
}
