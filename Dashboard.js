const links = document.querySelectorAll("[data-view]");
const views = document.querySelectorAll(".view-panel");

links.forEach((link) => link.addEventListener("click", (event) => {
  event.preventDefault();
  const view = document.getElementById(`${link.dataset.view}View`);
  views.forEach((panel) => panel.hidden = panel !== view);
  links.forEach((item) => item.classList.toggle("active", item === link));
  document.getElementById("pageTitle").textContent = view.dataset.title;
  document.getElementById("dashboardSubtitle").textContent = view.dataset.subtitle;
  document.getElementById("dateControls").hidden = link.dataset.view !== "dashboard";
}));

document.getElementById("todayBtn").addEventListener("click", () => {
  subtitle.textContent = `Today's activity · ${new Date().toLocaleDateString()}`;
});

document.getElementById("thisMonthBtn").addEventListener("click", () => {
  subtitle.textContent = "Track your monthly activities";
});