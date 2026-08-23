export function initHeaderMenu() {
  const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
  const mobileNav = document.querySelector<HTMLElement>("#mobile-nav");
  if (!toggle || !mobileNav) return;

  const menuOpenLabel = toggle.dataset.menuOpen ?? "";
  const menuCloseLabel = toggle.dataset.menuClose ?? "";

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? menuOpenLabel : menuCloseLabel);
    mobileNav.hidden = isOpen;
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", menuOpenLabel);
    });
  });
}

initHeaderMenu();
