(() => {
  "use strict";

  const CONFIG = window.GYOKOI_ADMIN_CONFIG || {};
  const SESSION_KEY = "gyokoiHubAdminUnlocked";
  const PASSWORD_KEY = "gyokoiHubAdminPassword";

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
    adminUrl: $("#adminUrl"),
    showAdmin: $("#showAdmin"),
    category: $("#category"),
    order: $("#order"),
    visible: $("#visible")
  };

  const preview = {
    icon: $("#iconPreview"),
    name: $("#namePreview"),
    description: $("#descriptionPreview")
  };

  let apps = [];

  init();

  async function init() {
    bindEvents();

    if (sessionStorage.getItem(SESSION_KEY) === "true") {
      unlock();
      await loadApps();
    }

    updatePreview();
    renderApps();
  }

  function bindEvents() {
    loginForm.addEventListener("submit", handleLogin);

    $("#togglePassword").addEventListener("click", () => {
      passwordInput.type =
        passwordInput.type === "password" ? "text" : "password";
    });

    $("#logoutButton").addEventListener("click", logout);
    $("#resetButton").addEventListener("click", resetForm);
    appForm.addEventListener("submit", saveApp);
    searchInput.addEventListener("input", renderApps);

    [fields.name, fields.description, fields.icon].forEach((field) => {
      field.addEventListener("input", updatePreview);
    });

    fields.adminUrl.addEventListener("input", () => {
      if (!fields.adminUrl.value.trim()) fields.showAdmin.checked = false;
    });
  }

  async function handleLogin(event) {
    event.preventDefault();

    const password = passwordInput.value.trim();
    loginError.textContent = "";

    try {
      const result = await callApi({
        action: "login",
        password
      });

      if (!result.ok) {
        throw new Error(result.error || "รหัสผ่านไม่ถูกต้อง");
      }

      sessionStorage.setItem(SESSION_KEY, "true");
      sessionStorage.setItem(PASSWORD_KEY, password);

      unlock();
      await loadApps();
      showToast("Welcome back, Gyokoi 💜");
    } catch (error) {
      loginError.textContent = error.message || "รหัสผ่านไม่ถูกต้อง";
      passwordInput.select();
    }
  }

  function unlock() {
    loginView.classList.add("hidden");
    adminView.classList.remove("hidden");
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(PASSWORD_KEY);

    passwordInput.value = "";
    apps = [];

    adminView.classList.add("hidden");
    loginView.classList.remove("hidden");

    renderApps();
  }

  async function saveApp(event) {
    event.preventDefault();

    const isEditing = Boolean(fields.id.value.trim());

    if (fields.showAdmin.checked && !fields.adminUrl.value.trim()) {
      showToast("กรุณาใส่ลิงก์ Admin ก่อนเปิดปุ่ม Admin");
      fields.adminUrl.focus();
      return;
    }

    const item = {
      id: fields.id.value.trim(),
      name: fields.name.value.trim(),
      description: fields.description.value.trim(),
      icon: fields.icon.value.trim(),
      url: fields.url.value.trim(),
      adminUrl: fields.adminUrl.value.trim(),
      showAdmin: fields.showAdmin.checked,
      category: fields.category.value,
      order: Number(fields.order.value) || 1,
      visible: fields.visible.checked
    };

    try {
      const result = await callApi({
        action: isEditing ? "update" : "create",
        password: getPassword(),
        app: item
      });

      if (!result.ok) {
        throw new Error(result.error || "บันทึกข้อมูลไม่สำเร็จ");
      }

      resetForm();
      await loadApps();

      showToast(isEditing ? "อัปเดตแอปแล้ว" : "เพิ่มแอปแล้ว");
    } catch (error) {
      showToast(error.message || "บันทึกข้อมูลไม่สำเร็จ");
    }
  }

  function editApp(id) {
    const app = apps.find((item) => item.id === id);
    if (!app) return;

    fields.id.value = app.id;
    fields.name.value = app.name;
    fields.description.value = app.description;
    fields.icon.value = app.icon;
    fields.url.value = app.url;
    fields.adminUrl.value = app.adminUrl || "";
    fields.showAdmin.checked = Boolean(app.showAdmin && app.adminUrl);
    fields.category.value = app.category;
    fields.order.value = app.order;
    fields.visible.checked = app.visible;

    $("#formTitle").textContent = "Edit app";
    updatePreview();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteApp(id) {
    const app = apps.find((item) => item.id === id);

    if (!app || !window.confirm(`ลบ ${app.name} ออกจาก Hub ใช่ไหม?`)) {
      return;
    }

    try {
      const result = await callApi({
        action: "delete",
        password: getPassword(),
        id
      });

      if (!result.ok) {
        throw new Error(result.error || "ลบข้อมูลไม่สำเร็จ");
      }

      await loadApps();
      showToast("ลบแอปแล้ว");
    } catch (error) {
      showToast(error.message || "ลบข้อมูลไม่สำเร็จ");
    }
  }

  function renderApps() {
    const query = searchInput.value.trim().toLowerCase();

    const filtered = [...apps]
      .filter((app) =>
        `${app.name} ${app.description} ${app.category}`
          .toLowerCase()
          .includes(query)
      )
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

    appList.innerHTML = "";
    $("#appCount").textContent = `${apps.length} app${
      apps.length === 1 ? "" : "s"
    }`;
    emptyState.classList.toggle("hidden", filtered.length !== 0);

    filtered.forEach((app, index) => {
      const item = document.createElement("article");
      item.className = "app-item";
      item.style.animationDelay = `${Math.min(index * 45, 240)}ms`;

      item.innerHTML = `
        <img
          class="app-icon"
          src="${escapeAttribute(app.icon)}"
          alt="${escapeAttribute(app.name)} icon"
          onerror="this.src='${fallbackIcon()}'"
        />
        <div class="app-copy">
          <h3>${escapeHtml(app.name)}</h3>
          <p>${escapeHtml(app.description)}</p>
          <div class="meta-row">
            <span class="meta-chip">${escapeHtml(app.category)}</span>
            <span class="meta-chip">Order ${app.order}</span>
            <span class="meta-chip ${app.visible ? "" : "off"}">
              ${app.visible ? "Visible" : "Hidden"}
            </span>
            <span class="meta-chip ${app.showAdmin && app.adminUrl ? "" : "off"}">
              ${app.showAdmin && app.adminUrl ? "Admin On" : "Admin Off"}
            </span>
          </div>
        </div>
        <div class="app-actions">
          <button class="action-button" data-edit="${escapeAttribute(app.id)}">
            Edit
          </button>
          <button
            class="action-button delete"
            data-delete="${escapeAttribute(app.id)}"
          >
            Delete
          </button>
        </div>
      `;

      appList.appendChild(item);
    });

    appList.querySelectorAll("[data-edit]").forEach((button) => {
      button.addEventListener("click", () => editApp(button.dataset.edit));
    });

    appList.querySelectorAll("[data-delete]").forEach((button) => {
      button.addEventListener("click", () => deleteApp(button.dataset.delete));
    });
  }

  function updatePreview() {
    preview.name.textContent = fields.name.value.trim() || "New App";
    preview.description.textContent =
      fields.description.value.trim() ||
      "Your app description appears here.";

    preview.icon.src = fields.icon.value.trim() || fallbackIcon();
    preview.icon.onerror = () => {
      preview.icon.src = fallbackIcon();
    };
  }

  function resetForm() {
    appForm.reset();
    fields.id.value = "";
    fields.order.value = apps.length + 1;
    fields.visible.checked = true;
    fields.adminUrl.value = "";
    fields.showAdmin.checked = false;
    $("#formTitle").textContent = "Add new app";
    updatePreview();
  }

  async function loadApps() {
    try {
      const result = await callApi({
        action: "listAdmin",
        password: getPassword()
      });

      if (!result.ok) {
        throw new Error(result.error || "โหลดข้อมูลไม่สำเร็จ");
      }

      apps = Array.isArray(result.apps) ? result.apps : [];
      renderApps();
    } catch (error) {
      apps = [];
      renderApps();
      showToast(error.message || "โหลดข้อมูลไม่สำเร็จ");
    }
  }

  async function callApi(payload) {
    if (!CONFIG.API_URL) {
      throw new Error("ยังไม่ได้ตั้งค่า API_URL ใน config.js");
    }

    const response = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("ไม่สามารถเชื่อมต่อ Apps Script ได้");
    }

    return response.json();
  }

  function getPassword() {
    return sessionStorage.getItem(PASSWORD_KEY) || "";
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }

  function fallbackIcon() {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' rx='30' fill='%238b5cf6'/%3E%3Ctext x='60' y='73' text-anchor='middle' font-size='44' fill='white' font-family='Arial'%3EG%3C/text%3E%3C/svg%3E";
  }

  function escapeHtml(value) {
    return String(value).replace(
      /[&<>'"]/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;"
        })[char]
    );
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }
})();
