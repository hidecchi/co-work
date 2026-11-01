export const HERO_SLIDES = [
  { file: "164 (2).jpg", altKey: "slide1" as const },
  { file: "166.jpg", altKey: "slide2" as const },
  { file: "169 (2).jpg", altKey: "slide3" as const },
] as const;

export function heroSlideSrc(file: string) {
  return `/${encodeURI(file)}`;
}

export const HERO_SLIDE_PRELOAD = heroSlideSrc(HERO_SLIDES[0].file);
