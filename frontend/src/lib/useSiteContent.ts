"use client";

import { useEffect, useState } from "react";
import { fetchSiteContent, DEFAULT_SITE_CONTENT, SiteContentMap, getErrorMessage } from "./api";

const STORAGE_KEY = "petronesia_cms_content_v2";

function isContentMap(value: unknown): value is SiteContentMap {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.values(value).every(item => typeof item === "string");
}

export function useSiteContent(section?: string) {
  const [content, setContent] = useState<SiteContentMap>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    fetchSiteContent(section).then(res => {
      if (!active) return;
      setContent({ ...DEFAULT_SITE_CONTENT, ...res.map });
      setError(null);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(res.map)); } catch {}
    }).catch(err => {
      if (!active) return;
      setError(getErrorMessage(err, "Gagal memuat konten dinamis"));
      try {
        const cached: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        if (isContentMap(cached)) setContent({ ...DEFAULT_SITE_CONTENT, ...cached });
      } catch {}
    }).finally(() => { if (active) setLoading(false); });

    function handleStorageUpdate(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      try {
        const parsed: unknown = JSON.parse(e.newValue || "{}");
        if (isContentMap(parsed)) setContent({ ...DEFAULT_SITE_CONTENT, ...parsed });
      } catch {}
    }
    function handleCustomUpdate(e: Event) {
      if (e instanceof CustomEvent && isContentMap(e.detail)) {
        setContent(prev => ({ ...prev, ...e.detail }));
      }
    }
    window.addEventListener("storage", handleStorageUpdate);
    window.addEventListener("cms_content_updated", handleCustomUpdate);
    return () => {
      active = false;
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener("cms_content_updated", handleCustomUpdate);
    };
  }, [section, version]);

  return { content, loading, error, reload: () => { setLoading(true); setVersion(v => v + 1); } };
}

export function broadcastContentUpdate(newMap: SiteContentMap) {
  let existing: SiteContentMap = {};
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (isContentMap(parsed)) existing = parsed;
  } catch {}
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...newMap })); } catch {}
  window.dispatchEvent(new CustomEvent("cms_content_updated", { detail: newMap }));
}
