export function initHeaderMenu() {
  const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
  const mobileNav = document.querySelector<HTMLElement>("#mobile-nav");
  if (!toggle || !mobileNav) return;

  const menuOpenLabel = toggle.dataset.menuOpen ?? "";
  const menuCloseLabel = toggle.dataset.menuClose ?? "";

  const onToggle = () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    const nextOpen = !isOpen;
    toggle.setAttribute("aria-expanded", String(nextOpen));
    toggle.setAttribute("aria-label", nextOpen ? menuCloseLabel : menuOpenLabel);
    mobileNav.hidden = !nextOpen;
  };

  const closeMenu = () => {
    mobileNav.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", menuOpenLabel);
  };

  toggle.addEventListener("click", onToggle);

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  return () => {
    toggle.removeEventListener("click", onToggle);
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.removeEventListener("click", closeMenu);
    });
  };
}

let disposeHeaderMenu = initHeaderMenu();

document.addEventListener("astro:page-load", () => {
  disposeHeaderMenu?.();
  disposeHeaderMenu = initHeaderMenu();
});
