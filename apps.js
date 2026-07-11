const HUB_API_URL = "PASTE_YOUR_APPS_SCRIPT_EXEC_URL_HERE";

const FALLBACK_APPS = [
  {
    id: "portfolio",
    title: "Portfolio",
    description: "Personal brand, journey, projects, recognition and selected work.",
    category: "personal",
    categoryLabel: "Personal Brand",
    status: "live",
    icon: "P",
    color: "#8b6df6",
    url: "https://alicetletech-afk.github.io/gyokoispace/",
    secondaryLabel: "Admin",
    secondaryUrl: "https://alicetletech-afk.github.io/gyokoispace/admin"
  },
  {
    id: "alicejens",
    title: "AliceJens",
    description: "AI executive workspace for memory, planning, workflow and decision support.",
    category: "personal",
    categoryLabel: "AI Workspace",
    status: "demo",
    icon: "A",
    color: "#b46cff",
    url: "https://alicetletech-afk.github.io/smallgirlsmallworld/"
  },
  {
    id: "workspace",
    title: "Gstar Workspace",
    description: "Internal workspace for product information, sales, support and management.",
    category: "work",
    categoryLabel: "Internal Workspace",
    status: "internal",
    icon: "W",
    color: "#4f8cff",
    url: "https://gstarcadthai-spacee.github.io/gstarspace/"
  },
  {
    id: "emailhub",
    title: "PTCAD Email Hub",
    description: "Sales enablement hub for reusable email templates and communication flows.",
    category: "work",
    categoryLabel: "Sales Tool",
    status: "internal",
    icon: "E",
    color: "#45b7d1",
    url: "https://alicetletech-afk.github.io/PTCAD-Sales/"
  },
  {
    id: "campaign",
    title: "Campaign Manager",
    description: "Campaign operations system for planning, content, timelines and team coordination.",
    category: "work",
    categoryLabel: "Marketing Operations",
    status: "internal",
    icon: "C",
    color: "#f0935b",
    url: "https://thaigstarcad.com/partner-centercampaign-manager"
  },
  {
    id: "productcenter",
    title: "Product Center",
    description: "Corporate product information and digital experience for GstarCAD solutions.",
    category: "work",
    categoryLabel: "Product Website",
    status: "live",
    icon: "G",
    color: "#2f7fe7",
    url: "https://thaigstarcad.com/"
  },
  {
    id: "kk",
    title: "K&K Car Rental",
    description: "Family business booking system for checking availability and reserving rental cars.",
    category: "business",
    categoryLabel: "Family Business",
    status: "live",
    icon: "K",
    color: "#e0aa35",
    url: "https://alicetletech-afk.github.io/kk-hatyai-car-rental/booking.html"
  },
  {
    id: "hubaccess",
    title: "Hub Access",
    description: "Private gateway for internal tools and team access.",
    category: "internal",
    categoryLabel: "Internal Gateway",
    status: "internal",
    icon: "H",
    color: "#68758f",
    url: "https://thaigstarcad.com/hub-access"
  }
];

const APP_STYLE_BY_URL = {
  "https://alicetletech-afk.github.io/gyokoispace/": {
    id: "portfolio",
    categoryLabel: "Personal Brand",
    status: "live",
    color: "#8b6df6",
    secondaryLabel: "Admin",
    secondaryUrl: "https://alicetletech-afk.github.io/gyokoispace/admin"
  },
  "https://alicetletech-afk.github.io/smallgirlsmallworld/": {
    id: "alicejens",
    categoryLabel: "AI Workspace",
    status: "demo",
    color: "#b46cff"
  },
  "https://gstarcadthai-spacee.github.io/gstarspace/": {
    id: "workspace",
    categoryLabel: "Internal Workspace",
    status: "internal",
    color: "#4f8cff"
  },
  "https://alicetletech-afk.github.io/PTCAD-Sales/": {
    id: "emailhub",
    categoryLabel: "Sales Tool",
    status: "internal",
    color: "#45b7d1"
  },
  "https://thaigstarcad.com/partner-centercampaign-manager": {
    id: "campaign",
    categoryLabel: "Marketing Operations",
    status: "internal",
    color: "#f0935b"
  },
  "https://thaigstarcad.com/": {
    id: "productcenter",
    categoryLabel: "Product Website",
    status: "live",
    color: "#2f7fe7"
  },
  "https://alicetletech-afk.github.io/kk-hatyai-car-rental/booking.html": {
    id: "kk",
    categoryLabel: "Family Business",
    status: "live",
    color: "#e0aa35"
  },
  "https://thaigstarcad.com/hub-access": {
    id: "hubaccess",
    categoryLabel: "Internal Gateway",
    status: "internal",
    color: "#68758f"
  }
};

const CATEGORY_STYLE = {
  personal: {
    categoryLabel: "Personal",
    status: "live",
    color: "#8b6df6"
  },
  work: {
    categoryLabel: "Work",
    status: "internal",
    color: "#4f8cff"
  },
  business: {
    categoryLabel: "Business",
    status: "live",
    color: "#e0aa35"
  },
  internal: {
    categoryLabel: "Internal",
    status: "internal",
    color: "#68758f"
  }
};

let APPS = [];

async function loadHubApps() {
  try {
    if (!HUB_API_URL || HUB_API_URL.includes("PASTE_YOUR")) {
      throw new Error("Hub API URL is not configured.");
    }

    const response = await fetch(`${HUB_API_URL}?action=list`, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Hub API request failed.");
    }

    const result = await response.json();

    if (!result.ok || !Array.isArray(result.apps)) {
      throw new Error(result.error || "Invalid Hub API response.");
    }

    APPS = result.apps
      .filter(app => app.visible !== false)
      .map(normalizeApiApp)
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

    return APPS;
  } catch (error) {
    console.warn("Gyokoi Hub is using fallback data:", error);
    APPS = FALLBACK_APPS.map((app, index) => ({
      ...app,
      order: index + 1
    }));
    return APPS;
  }
}

function normalizeApiApp(app, index) {
  const category = String(app.category || "personal").trim().toLowerCase();
  const url = String(app.url || "").trim();
  const savedStyle = APP_STYLE_BY_URL[url] || {};
  const categoryStyle = CATEGORY_STYLE[category] || CATEGORY_STYLE.personal;
  const title = String(app.name || "Untitled App").trim();
  const iconValue = String(app.icon || "").trim();

  return {
    id: savedStyle.id || String(app.id || slugify(title)),
    title,
    description: String(app.description || "").trim(),
    category,
    categoryLabel: savedStyle.categoryLabel || categoryStyle.categoryLabel,
    status: savedStyle.status || categoryStyle.status,
    icon: iconValue || title.charAt(0).toUpperCase(),
    iconIsImage: isImageSource(iconValue),
    color: savedStyle.color || categoryStyle.color,
    url,
    secondaryLabel: savedStyle.secondaryLabel || "",
    secondaryUrl: savedStyle.secondaryUrl || "",
    order: Number(app.order) || index + 1
  };
}

function isImageSource(value) {
  if (!value) return false;

  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    value.startsWith("./") ||
    value.startsWith("../") ||
    /\.(png|jpe?g|gif|svg|webp|ico)(\?.*)?$/i.test(value)
  );
}

function slugify(value) {
  return String(value || "app")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "app";
}
