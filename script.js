const root = document.documentElement;
const appGrid = document.querySelector("#appGrid");
const template = document.querySelector("#appCardTemplate");
const inlineSearch = document.querySelector("#inlineSearch");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const sectionTitle = document.querySelector("#sectionTitle");
const launchpad = document.querySelector(".launchpad");
const spotlight = document.querySelector("#spotlight");
const spotlightInput = document.querySelector("#spotlightInput");
const spotlightResults = document.querySelector("#spotlightResults");

let currentFilter = "all";
let currentQuery = "";

const labels = {
  all: "All Apps",
  personal: "Personal",
  work: "Work",
  business: "Business",
  internal: "Internal"
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function filteredApps() {
  return APPS.filter(app => {
    const matchesFilter = currentFilter === "all" || app.category === currentFilter;
    const haystack = `${app.title} ${app.description} ${app.categoryLabel}`.toLowerCase();
    const matchesQuery = haystack.includes(currentQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });
}

function renderApps() {
  const items = filteredApps();
  appGrid.innerHTML = "";

  if (!items.length) {
    appGrid.innerHTML = '<div class="empty-state">No apps found.</div>';
    return;
  }

  items.forEach(app => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".app-card");
    const icon = node.querySelector(".app-icon");
    const status = node.querySelector(".status-badge");
    const category = node.querySelector(".app-category");
    const title = node.querySelector(".app-title");
    const description = node.querySelector(".app-description");
    const open = node.querySelector(".open-app");
    const secondary = node.querySelector(".secondary-link");

    card.style.setProperty("--app-color", app.color);
    icon.textContent = app.icon;
    status.textContent = app.status;
    status.classList.add(app.status);
    category.textContent = app.categoryLabel;
    title.textContent = app.title;
    description.textContent = app.description;
    open.href = app.url;

    if (app.secondaryUrl) {
      secondary.hidden = false;
      secondary.href = app.secondaryUrl;
      secondary.textContent = app.secondaryLabel || "Admin";
    }

    appGrid.appendChild(node);
  });
}

function animateLaunchpad() {
  launchpad?.classList.remove("is-arriving");
  void launchpad?.offsetWidth;
  launchpad?.classList.add("is-arriving");

  window.clearTimeout(window.__launchpadMotion);
  window.__launchpadMotion = window.setTimeout(() => {
    launchpad?.classList.remove("is-arriving");
  }, 1100);
}

function scrollToLaunchpad() {
  window.setTimeout(() => {
    launchpad?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 80);
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    currentQuery = "";
    inlineSearch.value = "";

    filterButtons.forEach(item =>
      item.classList.toggle("active", item === button)
    );

    sectionTitle.textContent = labels[currentFilter] || "Apps";
    renderApps();
    animateLaunchpad();
    scrollToLaunchpad();
  });
});

inlineSearch.addEventListener("input", () => {
  currentQuery = inlineSearch.value.trim();
  renderApps();
  animateLaunchpad();
});

function updateClock() {
  const now = new Date();
  document.querySelector("#currentTime").textContent =
    now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  document.querySelector("#currentDate").textContent =
    now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
}

document.querySelector("#appCount").textContent = APPS.length;
updateClock();
setInterval(updateClock, 30000);

document.querySelector("[data-toggle-theme]").addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  localStorage.setItem("gyokoi-hub-theme", next);
});

const savedTheme = localStorage.getItem("gyokoi-hub-theme");
if (savedTheme) root.dataset.theme = savedTheme;

function openSpotlight() {
  if (typeof spotlight.showModal === "function") spotlight.showModal();
  spotlightInput.value = "";
  renderSpotlight("");
  setTimeout(() => spotlightInput.focus(), 50);
}

document.querySelectorAll("[data-open-search]").forEach(button => {
  button.addEventListener("click", openSpotlight);
});

document.addEventListener("keydown", event => {
  const command = navigator.platform.toLowerCase().includes("mac")
    ? event.metaKey
    : event.ctrlKey;

  if (command && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSpotlight();
  }
});

spotlight.addEventListener("click", event => {
  if (event.target === spotlight) spotlight.close();
});

spotlightInput.addEventListener("input", () => {
  renderSpotlight(spotlightInput.value.trim());
});

function renderSpotlight(query) {
  const q = query.toLowerCase();
  const items = APPS.filter(app =>
    `${app.title} ${app.description} ${app.categoryLabel}`
      .toLowerCase()
      .includes(q)
  );

  spotlightResults.innerHTML = items.map(app => `
    <button class="search-result" type="button" data-search-id="${escapeHtml(app.id)}">
      <span class="search-result-icon" style="--result-color:${escapeHtml(app.color)}">${escapeHtml(app.icon)}</span>
      <span>
        <strong>${escapeHtml(app.title)}</strong>
        <small>${escapeHtml(app.categoryLabel)}</small>
      </span>
      <span>↗</span>
    </button>
  `).join("");

  spotlightResults.querySelectorAll("[data-search-id]").forEach(button => {
    button.addEventListener("click", () => {
      const app = APPS.find(item => item.id === button.dataset.searchId);
      if (app) window.open(app.url, "_blank", "noopener,noreferrer");
    });
  });
}

document.querySelectorAll("[data-dock]").forEach(button => {
  button.addEventListener("click", () => {
    const app = APPS.find(item => item.id === button.dataset.dock);
    if (app) window.open(app.url, "_blank", "noopener,noreferrer");
  });
});

renderApps();
renderSpotlight("");
