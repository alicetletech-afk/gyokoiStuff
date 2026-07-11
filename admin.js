(() => {
  "use strict";

  const CONFIG = window.GYOKOI_ADMIN_CONFIG || {};
  const STORAGE_KEY = "gyokoiHubApps";
  const SESSION_KEY = "gyokoiHubAdminUnlocked";

  const $ = (selector) => document.querySelector(selector);
  const loginView = $("#loginView");
  const adminView = $("#adminView");
  const loginForm = $("#loginForm");
  const passwordInput = $("#password");
  const loginError = $("#loginError");
  const appForm = $("#appForm");
  const appList = $("#appList");
  const emptyState = $("#emptyState");
  const searchInput = $("#searchInput");
  const toast = $("#toast");

  const fields = {
    id: $("#appId"),
    name: $("#name"),
    description: $("#description"),
    icon: $("#icon"),
    url: $("#url"),
    category: $("#category"),
    order: $("#order"),
    visible: $("#visible")
  };

  const preview = {
    icon: $("#iconPreview"),
    name: $("#namePreview"),
    description: $("#descriptionPreview")
  };

  let apps = loadApps();

  init();

  function init() {
    bindEvents();
    if (sessionStorage.getItem(SESSION_KEY) === "true") unlock();
    updatePreview();
    renderApps();
  }

  function bindEvents() {
    loginForm.addEventListener("submit", handleLogin);
    $("#togglePassword").addEventListener("click", () => {
      passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    });
    $("#logoutButton").addEventListener("click", logout);
    $("#resetButton").addEventListener("click", resetForm);
    appForm.addEventListener("submit", saveApp);
    searchInput.addEventListener("input", renderApps);
    [fields.name, fields.description, fields.icon].forEach((field) => field.addEventListener("input", updatePreview));
  }

  function handleLogin(event) {
    event.preventDefault();
    if (passwordInput.value === CONFIG.TEMP_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      loginError.textContent = "";
      unlock();
      showToast("Welcome back, Gyokoi 💜");
      return;
    }
    loginError.textContent = "รหัสผ่านไม่ถูกต้อง";
    passwordInput.select();
  }

  function unlock() {
    loginView.classList.add("hidden");
    adminView.classList.remove("hidden");
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    passwordInput.value = "";
    adminView.classList.add("hidden");
    loginView.classList.remove("hidden");
  }

  function saveApp(event) {
    event.preventDefault();
    const item = {
      id: fields.id.value || crypto.randomUUID(),
      name: fields.name.value.trim(),
      description: fields.description.value.trim(),
      icon: fields.icon.value.trim(),
      url: fields.url.value.trim(),
      category: fields.category.value,
      order: Number(fields.order.value) || 1,
      visible: fields.visible.checked,
      updatedAt: new Date().toISOString()
    };

    const index = apps.findIndex((app) => app.id === item.id);
    if (index >= 0) apps[index] = item;
    else apps.push(item);

    persist();
    resetForm();
    renderApps();
    showToast(index >= 0 ? "อัปเดตแอปแล้ว" : "เพิ่มแอปแล้ว");
  }

  function editApp(id) {
    const app = apps.find((item) => item.id === id);
    if (!app) return;
    fields.id.value = app.id;
    fields.name.value = app.name;
    fields.description.value = app.description;
    fields.icon.value = app.icon;
    fields.url.value = app.url;
    fields.category.value = app.category;
    fields.order.value = app.order;
    fields.visible.checked = app.visible;
    $("#formTitle").textContent = "Edit app";
    updatePreview();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteApp(id) {
    const app = apps.find((item) => item.id === id);
    if (!app || !window.confirm(`ลบ ${app.name} ออกจาก Hub ใช่ไหม?`)) return;
    apps = apps.filter((item) => item.id !== id);
    persist();
    renderApps();
    showToast("ลบแอปแล้ว");
  }

  function renderApps() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = [...apps]
      .filter((app) => `${app.name} ${app.description} ${app.category}`.toLowerCase().includes(query))
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

    appList.innerHTML = "";
    $("#appCount").textContent = `${apps.length} app${apps.length === 1 ? "" : "s"}`;
    emptyState.classList.toggle("hidden", filtered.length !== 0);

    filtered.forEach((app, index) => {
      const item = document.createElement("article");
      item.className = "app-item";
      item.style.animationDelay = `${Math.min(index * 45, 240)}ms`;
      item.innerHTML = `
        <img class="app-icon" src="${escapeAttribute(app.icon)}" alt="${escapeAttribute(app.name)} icon" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Crect width=%22120%22 height=%22120%22 rx=%2230%22 fill=%22%238b5cf6%22/%3E%3Ctext x=%2260%22 y=%2273%22 text-anchor=%22middle%22 font-size=%2244%22 fill=%22white%22 font-family=%22Arial%22%3EG%3C/text%3E%3C/svg%3E'" />
        <div class="app-copy">
          <h3>${escapeHtml(app.name)}</h3>
          <p>${escapeHtml(app.description)}</p>
          <div class="meta-row">
            <span class="meta-chip">${escapeHtml(app.category)}</span>
            <span class="meta-chip">Order ${app.order}</span>
            <span class="meta-chip ${app.visible ? "" : "off"}">${app.visible ? "Visible" : "Hidden"}</span>
          </div>
        </div>
        <div class="app-actions">
          <button class="action-button" data-edit="${app.id}">Edit</button>
          <button class="action-button delete" data-delete="${app.id}">Delete</button>
        </div>`;
      appList.appendChild(item);
    });

    appList.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => editApp(button.dataset.edit)));
    appList.querySelectorAll("[data-delete]").forEach((button) => button.addEventListener("click", () => deleteApp(button.dataset.delete)));
  }

  function updatePreview() {
    preview.name.textContent = fields.name.value.trim() || "New App";
    preview.description.textContent = fields.description.value.trim() || "Your app description appears here.";
    preview.icon.src = fields.icon.value.trim() || fallbackIcon();
    preview.icon.onerror = () => { preview.icon.src = fallbackIcon(); };
  }

  function resetForm() {
    appForm.reset();
    fields.id.value = "";
    fields.order.value = apps.length + 1;
    fields.visible.checked = true;
    $("#formTitle").textContent = "Add new app";
    updatePreview();
  }

  function loadApps() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function fallbackIcon() {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' rx='30' fill='%238b5cf6'/%3E%3Ctext x='60' y='73' text-anchor='middle' font-size='44' fill='white' font-family='Arial'%3EG%3C/text%3E%3C/svg%3E";
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }
})();
