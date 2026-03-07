"use client";
import { useEffect } from "react";
import getSupabase from "../../lib/supabase";

function getSessionId() {
  if (typeof sessionStorage === "undefined") return null;
  let id = sessionStorage.getItem("ip_session_id");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("ip_session_id", id);
  }
  return id;
}

let lastRecorded = 0;

function recordPageView() {
  const now = Date.now();
  if (now - lastRecorded < 5000) return; // 5-second debounce
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/admin")) return;

  lastRecorded = now;
  const supabase = getSupabase();
  if (!supabase) return;

  supabase.from("page_views").insert({
    path: window.location.pathname + window.location.hash,
    referrer: document.referrer || null,
    user_agent: navigator.userAgent,
    session_id: getSessionId(),
    screen_width: window.innerWidth,
  }).then(() => {});
}

export default function PageTracker() {
  useEffect(() => {
    recordPageView();
    const handler = () => recordPageView();
    window.addEventListener("ip:modechange", handler);
    return () => window.removeEventListener("ip:modechange", handler);
  }, []);

  return null;
}
