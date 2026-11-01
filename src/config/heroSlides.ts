export const HERO_SLIDES = [
  { file: "hero-slide-desk-row.jpg", altKey: "slide1" as const },
  { file: "hero-slide-open-space.jpg", altKey: "slide2" as const },
  { file: "hero-slide-shared-desk.jpg", altKey: "slide3" as const },
] as const;

export function heroSlideSrc(file: string) {
  return `/${encodeURI(file)}`;
}

export const HERO_SLIDE_PRELOAD = heroSlideSrc(HERO_SLIDES[0].file);
