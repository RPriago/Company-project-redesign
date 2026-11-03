"use client";

import { createContext, createElement, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { fetchSiteContent, DEFAULT_SITE_CONTENT, type SiteContentMap, getErrorMessage } from "./api";

type ContentState = { content: SiteContentMap; loading: boolean; error: string | null; reload: () => void };
const ContentContext = createContext<ContentState>({ content: DEFAULT_SITE_CONTENT, loading: true, error: null, reload: () => {} });
let pending: ReturnType<typeof fetchSiteContent> | undefined;
function load() {
  if (!pending) pending = fetchSiteContent().finally(() => { pending = undefined; });
  return pending;
}
export function SiteContentProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [content, setContent] = useState(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion(v => v + 1), []);
  useEffect(() => {
    let active = true;
    load().then(res => { if (active) { setContent({ ...DEFAULT_SITE_CONTENT, ...res.map }); setError(null); } })
      .catch(err => { if (active) setError(getErrorMessage(err, "Gagal memuat konten dinamis")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [pathname, version]);
  useEffect(() => {
    localStorage.removeItem("petronesia_cms_content_v2");
    window.addEventListener("focus", reload);
    window.addEventListener("cms_content_updated", reload);
    return () => { window.removeEventListener("focus", reload); window.removeEventListener("cms_content_updated", reload); };
  }, [reload]);
  return createElement(ContentContext.Provider, { value: { content, loading, error, reload } }, children);
}
// One canonical full-site map prevents section requests from overwriting each other.
export function useSiteContent(_section?: string) { void _section; return useContext(ContentContext); }
export function broadcastContentUpdate(newMap: SiteContentMap) {
  void newMap;
  window.dispatchEvent(new Event("cms_content_updated"));
}
