export function initHeaderMenu() {
  const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
  const mobileNav = document.querySelector<HTMLElement>("#mobile-nav");
  if (!toggle || !mobileNav) return;

  const menuOpenLabel = toggle.dataset.menuOpen ?? "";
  const menuCloseLabel = toggle.dataset.menuClose ?? "";

  const setMenuOpen = (open: boolean) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? menuCloseLabel : menuOpenLabel);
    mobileNav.hidden = !open;
    document.body.classList.toggle("mobile-nav-open", open);
  };

  const onToggle = () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  toggle.addEventListener("click", onToggle);

  const links = mobileNav.querySelectorAll("a");
  links.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  return () => {
    toggle.removeEventListener("click", onToggle);
    links.forEach((link) => {
      link.removeEventListener("click", closeMenu);
    });
    document.body.classList.remove("mobile-nav-open");
  };
}

let disposeHeaderMenu = initHeaderMenu();

document.addEventListener("astro:page-load", () => {
  disposeHeaderMenu?.();
  disposeHeaderMenu = initHeaderMenu();
});
