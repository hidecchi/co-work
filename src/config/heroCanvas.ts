/** Must match `getHeroImageUrl` / matchMedia in heroCanvas.ts */
export const HERO_MOBILE_IMAGE_BREAKPOINT = 500;

export const HERO_IMAGES = {
  desktop: "/sample.jpg",
  mobile: "/sample-sp.jpg",
} as const;

export const heroMobilePreloadMedia = `(max-width: ${HERO_MOBILE_IMAGE_BREAKPOINT - 1}px)`;
export const heroDesktopPreloadMedia = `(min-width: ${HERO_MOBILE_IMAGE_BREAKPOINT}px)`;
