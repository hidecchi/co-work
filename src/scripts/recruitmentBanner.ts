export function initRecruitmentBanner() {
  const banner = document.getElementById("recruitment-banner");
  const closeBtn = document.querySelector<HTMLButtonElement>("[data-recruitment-close]");
  if (!banner || !closeBtn) return;

  closeBtn.addEventListener("click", () => {
    banner.hidden = true;
  });
}

initRecruitmentBanner();
