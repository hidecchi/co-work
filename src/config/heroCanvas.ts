/** Must match `getHeroImageUrl` / matchMedia in heroCanvas.ts */
export const HERO_MOBILE_IMAGE_BREAKPOINT = 500;

export const HERO_IMAGES = {
  desktop: "/164.jpg",
  mobile: "/164.jpg",
} as const;

/** Intrinsic size of hero image — keeps layout height in sync with `width:100%; height:auto` */
export const HERO_IMAGE_WIDTH = 9059;
export const HERO_IMAGE_HEIGHT = 4096;

export const heroMobilePreloadMedia = `(max-width: ${HERO_MOBILE_IMAGE_BREAKPOINT - 1}px)`;
export const heroDesktopPreloadMedia = `(min-width: ${HERO_MOBILE_IMAGE_BREAKPOINT}px)`;
