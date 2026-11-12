import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ANALYTICS_CONFIG } from "@/data/siteConfig";

const STORAGE_KEY = "bp_portfolio_analytics_v1";
let gaInitialized = false;

function readStats() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore storage errors in restricted contexts
  }
  return {
    totalPageViews: 0,
    routes: {},
    events: {},
    lastUpdated: null,
  };
}

function writeStats(stats) {
  try {
    stats.lastUpdated = new Date().toISOString();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    window.__portfolioAnalytics = stats;
  } catch {
    // Ignore storage errors
  }
}

export function initAnalytics() {
  if (!ANALYTICS_CONFIG.enabled || typeof window === "undefined") return;
  const id = (ANALYTICS_CONFIG.ga4MeasurementId || "").trim();
  if (!id || gaInitialized) return;

  gaInitialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", id, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

export function trackPageView(path) {
  if (!ANALYTICS_CONFIG.enabled || typeof window === "undefined") return;
  const stats = readStats();
  stats.totalPageViews = (stats.totalPageViews || 0) + 1;
  stats.routes[path] = (stats.routes[path] || 0) + 1;
  writeStats(stats);

  const id = (ANALYTICS_CONFIG.ga4MeasurementId || "").trim();
  if (id && typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: path,
      page_title: document.title,
    });
  }
}

export function trackEvent(name, params = {}) {
  if (!ANALYTICS_CONFIG.enabled || typeof window === "undefined") return;
  const stats = readStats();
  stats.events[name] = (stats.events[name] || 0) + 1;
  writeStats(stats);

  const id = (ANALYTICS_CONFIG.ga4MeasurementId || "").trim();
  if (id && typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}

export function AnalyticsTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
