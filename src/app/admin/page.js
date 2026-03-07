"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import getSupabase from "../../lib/supabase";

const PER_PAGE = 50;
const GOLD = "#c8a84b";
const BG = "#090807";
const CARD_BG = "rgba(255,255,255,0.03)";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#f0ebe0";
const DIM = "rgba(255,255,255,0.4)";
const ADMIN_EMAIL = "tylerjyoung5@gmail.com";

function StatCard({ label, value }) {
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 20px", flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 9, color: DIM, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: GOLD }}>{value ?? "..."}</div>
    </div>
  );
}

function Pagination({ page, setPage, total }) {
  const maxPage = Math.max(1, Math.ceil(total / PER_PAGE));
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontSize: 11, color: DIM }}>
      <span>Page {page} of {maxPage} ({total} total)</span>
      <div style={{ display: "flex", gap: 8 }}>
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "5px 14px", color: page <= 1 ? "rgba(255,255,255,0.15)" : TEXT, cursor: page <= 1 ? "default" : "pointer", fontSize: 11, fontFamily: "inherit" }}>Prev</button>
        <button disabled={page >= maxPage} onClick={() => setPage(p => p + 1)} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "5px 14px", color: page >= maxPage ? "rgba(255,255,255,0.15)" : TEXT, cursor: page >= maxPage ? "default" : "pointer", fontSize: 11, fontFamily: "inherit" }}>Next</button>
      </div>
    </div>
  );
}

const thStyle = { textAlign: "left", padding: "8px 10px", fontSize: 9, color: GOLD, letterSpacing: 2, textTransform: "uppercase", borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap" };
const tdStyle = { padding: "8px 10px", fontSize: 11, color: "rgba(255,255,255,0.65)", borderBottom: "1px solid rgba(255,255,255,0.04)", whiteSpace: "nowrap", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" };

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(null);
  const [tab, setTab] = useState("users");
  const [stats, setStats] = useState({});

  // Data + pagination
  const [users, setUsers] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [usersPage, setUsersPage] = useState(1);

  const [searches, setSearches] = useState([]);
  const [searchesCount, setSearchesCount] = useState(0);
  const [searchesPage, setSearchesPage] = useState(1);

  const [gyms, setGyms] = useState([]);
  const [gymsCount, setGymsCount] = useState(0);
  const [gymsPage, setGymsPage] = useState(1);

  const [stamps, setStamps] = useState([]);
  const [stampsCount, setStampsCount] = useState(0);
  const [stampsPage, setStampsPage] = useState(1);

  const [battles, setBattles] = useState([]);
  const [battlesCount, setBattlesCount] = useState(0);
  const [battlesPage, setBattlesPage] = useState(1);

  // Analytics state
  const [analyticsStats, setAnalyticsStats] = useState({});
  const [dailyViews, setDailyViews] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [analyticsDays, setAnalyticsDays] = useState(7);

  // SEO state
  const [seoData, setSeoData] = useState(null);
  const [seoError, setSeoError] = useState(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoDays, setSeoDays] = useState(7);

  // Add Gym form state
  const [gymForm, setGymForm] = useState({
    name: "", city: "", country: "", type: "Traditional Gym", address: "", neighborhood: "",
    description: "", dayPassPrice: "", weekPassPrice: "", passNotes: "",
    contactPhone: "", contactEmail: "", contactWebsite: "", contactInstagram: "",
    equipment: 75, cleanliness: 75, amenities: 75, staff: 75,
    atmosphere: 75, value: 75, recovery: 75, classes: 75,
  });
  const [gymFormStatus, setGymFormStatus] = useState(null);

  // Add City form state
  const [cityForm, setCityForm] = useState({
    name: "", country: "", region: "", description: "",
    nearbyDestinations: "", relatedCities: "",
  });
  const [cityFormStatus, setCityFormStatus] = useState(null);

  // Rankings editor state
  const [rankGyms, setRankGyms] = useState([]);
  const [rankCity, setRankCity] = useState("");
  const [rankCities, setRankCities] = useState([]);
  const [rankSaving, setRankSaving] = useState(null);

  // Auth check
  useEffect(() => {
    try {
      const email = localStorage.getItem("ip_email");
      setAuthorized(email === ADMIN_EMAIL);
    } catch {
      setAuthorized(false);
    }
  }, []);

  // Load ranking cities list
  useEffect(() => {
    if (!authorized || tab !== "rankings") return;
    (async () => {
      const { data } = await getSupabase().from("cities").select("slug, name").order("name");
      setRankCities(data || []);
    })();
  }, [authorized, tab]);

  // Load ranking gyms when city changes
  useEffect(() => {
    if (!authorized || !rankCity) return;
    (async () => {
      const { data } = await getSupabase()
        .from("gyms")
        .select("id, name, slug, scores")
        .eq("city_slug", rankCity)
        .order("name");
      setRankGyms(data || []);
    })();
  }, [authorized, rankCity]);

  function makeSlug(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }

  async function handleAddGym(e) {
    e.preventDefault();
    setGymFormStatus("saving");
    const f = gymForm;
    const slug = makeSlug(`${f.name} ${f.city}`);
    const citySlug = makeSlug(f.city);

    // Auto-create city if it doesn't exist
    const { data: existingCity } = await getSupabase().from("cities").select("slug").eq("slug", citySlug).single();
    if (!existingCity) {
      await getSupabase().from("cities").insert({
        slug: citySlug, name: f.city, country: f.country,
        nearby_destinations: [], related_cities: [],
      });
    }

    const row = {
      name: f.name, city: f.city, country: f.country, type: f.type,
      address: f.address, neighborhood: f.neighborhood || null,
      description: f.description, slug, city_slug: citySlug,
      scores: {
        equipment: Number(f.equipment), cleanliness: Number(f.cleanliness),
        amenities: Number(f.amenities), staff: Number(f.staff),
        atmosphere: Number(f.atmosphere), value: Number(f.value),
        recovery: Number(f.recovery), classes: Number(f.classes),
      },
      day_pass_price: f.dayPassPrice || null,
      week_pass_price: f.weekPassPrice || null,
      pass_notes: f.passNotes || null,
      contact_phone: f.contactPhone || null,
      contact_email: f.contactEmail || null,
      contact_website: f.contactWebsite || null,
      contact_instagram: f.contactInstagram || null,
      tags: [], highlights: [], equipment_list: [], recovery_amenities: [],
      data_source: "admin",
    };

    const { error } = await getSupabase().from("gyms").upsert(row, { onConflict: "slug" });
    if (error) {
      setGymFormStatus(`Error: ${error.message}`);
    } else {
      setGymFormStatus("Gym added successfully!");
      // Cloudflare rebuild triggered automatically via Supabase webhook
      setGymForm({ ...gymForm, name: "", address: "", neighborhood: "", description: "", dayPassPrice: "", weekPassPrice: "", passNotes: "" });
    }
  }

  async function handleAddCity(e) {
    e.preventDefault();
    setCityFormStatus("saving");
    const f = cityForm;
    const slug = makeSlug(f.name);

    const row = {
      slug, name: f.name, country: f.country, region: f.region || null,
      description: f.description || null,
      nearby_destinations: f.nearbyDestinations ? f.nearbyDestinations.split(",").map(s => s.trim()).filter(Boolean) : [],
      related_cities: f.relatedCities ? f.relatedCities.split(",").map(s => s.trim()).filter(Boolean) : [],
    };

    const { error } = await getSupabase().from("cities").upsert(row, { onConflict: "slug" });
    if (error) {
      setCityFormStatus(`Error: ${error.message}`);
    } else {
      setCityFormStatus("City added successfully!");
      // Cloudflare rebuild triggered automatically via Supabase webhook
      setCityForm({ name: "", country: "", region: "", description: "", nearbyDestinations: "", relatedCities: "" });
    }
  }

  async function handleScoreUpdate(gymId, slug, citySlug, scores) {
    setRankSaving(gymId);
    const { error } = await getSupabase().from("gyms").update({ scores }).eq("id", gymId);
    if (!error) {
      // Cloudflare rebuild triggered automatically via Supabase webhook
      setRankGyms(prev => prev.map(g => g.id === gymId ? { ...g, scores } : g));
    }
    setRankSaving(null);
  }

  // Load stats
  useEffect(() => {
    if (!authorized) return;
    (async () => {
      const [u, s, g, st, b] = await Promise.all([
        getSupabase().from("users").select("*", { count: "exact", head: true }),
        getSupabase().from("searches").select("*", { count: "exact", head: true }),
        getSupabase().from("gyms").select("*", { count: "exact", head: true }),
        getSupabase().from("stamps").select("*", { count: "exact", head: true }),
        getSupabase().from("gym_battles").select("*", { count: "exact", head: true }),
      ]);
      const today = new Date().toISOString().slice(0, 10);
      const ts = await getSupabase().from("searches").select("*", { count: "exact", head: true }).gte("created_at", today);
      setStats({ users: u.count, searches: s.count, gyms: g.count, todaySearches: ts.count, stamps: st.count, battles: b.count });
    })();
  }, [authorized]);

  // Load tab data
  useEffect(() => {
    if (!authorized) return;
    if (tab === "users") {
      (async () => {
        const { count } = await getSupabase().from("users").select("*", { count: "exact", head: true });
        setUsersCount(count || 0);
        const { data } = await getSupabase().from("users").select("*").order("created_at", { ascending: false }).range((usersPage - 1) * PER_PAGE, usersPage * PER_PAGE - 1);
        setUsers(data || []);
      })();
    }
  }, [authorized, tab, usersPage]);

  useEffect(() => {
    if (!authorized) return;
    if (tab === "searches") {
      (async () => {
        const { count } = await getSupabase().from("searches").select("*", { count: "exact", head: true });
        setSearchesCount(count || 0);
        const { data } = await getSupabase().from("searches").select("*").order("created_at", { ascending: false }).range((searchesPage - 1) * PER_PAGE, searchesPage * PER_PAGE - 1);
        setSearches(data || []);
      })();
    }
  }, [authorized, tab, searchesPage]);

  useEffect(() => {
    if (!authorized) return;
    if (tab === "gyms") {
      (async () => {
        const { count } = await getSupabase().from("gyms").select("*", { count: "exact", head: true });
        setGymsCount(count || 0);
        const { data } = await getSupabase().from("gyms").select("*").order("created_at", { ascending: false }).range((gymsPage - 1) * PER_PAGE, gymsPage * PER_PAGE - 1);
        setGyms(data || []);
      })();
    }
  }, [authorized, tab, gymsPage]);

  useEffect(() => {
    if (!authorized) return;
    if (tab === "stamps") {
      (async () => {
        const { count } = await getSupabase().from("stamps").select("*", { count: "exact", head: true });
        setStampsCount(count || 0);
        const { data } = await getSupabase().from("stamps").select("*, gyms(name)").order("created_at", { ascending: false }).range((stampsPage - 1) * PER_PAGE, stampsPage * PER_PAGE - 1);
        setStamps(data || []);
      })();
    }
  }, [authorized, tab, stampsPage]);

  useEffect(() => {
    if (!authorized) return;
    if (tab === "battles") {
      (async () => {
        const { count } = await getSupabase().from("gym_battles").select("*", { count: "exact", head: true });
        setBattlesCount(count || 0);
        const { data } = await getSupabase().from("gym_battles").select("*").order("created_at", { ascending: false }).range((battlesPage - 1) * PER_PAGE, battlesPage * PER_PAGE - 1);
        // Get vote counts per battle
        const battlesWithVotes = await Promise.all((data || []).map(async (b) => {
          const { count: voteCount } = await getSupabase().from("battle_votes").select("*", { count: "exact", head: true }).eq("battle_id", b.id);
          return { ...b, voteCount: voteCount || 0 };
        }));
        setBattles(battlesWithVotes);
      })();
    }
  }, [authorized, tab, battlesPage]);

  // Load analytics data
  useEffect(() => {
    if (!authorized || tab !== "analytics") return;
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - analyticsDays);
      const sinceStr = since.toISOString();
      const todayStr = new Date().toISOString().slice(0, 10);

      const { data: rows } = await getSupabase()
        .from("page_views")
        .select("path, referrer, session_id, created_at")
        .gte("created_at", sinceStr)
        .order("created_at", { ascending: false })
        .limit(5000);

      if (!rows) return;

      // Stats
      const uniqueSessions = new Set(rows.map(r => r.session_id)).size;
      const todayViews = rows.filter(r => r.created_at?.startsWith(todayStr)).length;
      const refCounts = {};
      rows.forEach(r => {
        if (!r.referrer) return;
        try {
          const host = new URL(r.referrer).hostname.replace(/^www\./, "");
          refCounts[host] = (refCounts[host] || 0) + 1;
        } catch {}
      });
      const topRef = Object.entries(refCounts).sort((a, b) => b[1] - a[1])[0];
      setAnalyticsStats({ total: rows.length, unique: uniqueSessions, today: todayViews, topReferrer: topRef ? topRef[0] : "Direct" });

      // Daily views
      const dayCounts = {};
      rows.forEach(r => {
        const day = r.created_at?.slice(0, 10);
        if (day) dayCounts[day] = (dayCounts[day] || 0) + 1;
      });
      const days = [];
      for (let i = analyticsDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        days.push({ date: key, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), count: dayCounts[key] || 0 });
      }
      setDailyViews(days);

      // Top referrers
      const refSorted = Object.entries(refCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([host, count]) => ({ host, count }));
      setTopReferrers(refSorted);

      // Top pages
      const pageCounts = {};
      rows.forEach(r => { pageCounts[r.path] = (pageCounts[r.path] || 0) + 1; });
      const pageSorted = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([path, count]) => ({ path, count }));
      setTopPages(pageSorted);
    })();
  }, [authorized, tab, analyticsDays]);

  // Load SEO data
  useEffect(() => {
    if (!authorized || tab !== "seo") return;
    (async () => {
      setSeoLoading(true);
      setSeoError(null);
      try {
        const res = await fetch("https://iron-passport-worker.tylerjyoung5.workers.dev/gsc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ days: seoDays }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setSeoData(data);
      } catch (err) {
        setSeoError(err.message);
        setSeoData(null);
      } finally {
        setSeoLoading(false);
      }
    })();
  }, [authorized, tab, seoDays]);

  if (authorized === null) return null;

  if (!authorized) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 24, color: TEXT, marginBottom: 8 }}>Access Denied</div>
          <p style={{ fontSize: 13, color: DIM }}>You must be signed in as the admin to view this page.</p>
        </div>
      </div>
    );
  }

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
  const fmtDate = (d) => d || "—";

  const tabs = ["users", "searches", "gyms", "stamps", "battles", "analytics", "seo", "add-gym", "add-city", "rankings"];

  return (
    <div style={{ "--serif": "'Cormorant Garamond','Palatino Linotype',Georgia,serif", minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(200,168,75,0.3);border-radius:2px}`}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 26, height: 26, background: `linear-gradient(135deg,${GOLD},#8a6f28)`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✈</div>
            <span style={{ fontFamily: "var(--serif)", fontSize: 19, color: TEXT }}>Iron</span>
            <span style={{ fontFamily: "var(--serif)", fontSize: 19, color: GOLD, marginLeft: -2 }}>Passport</span>
          </a>
          <span style={{ fontSize: 9, background: "rgba(200,168,75,0.14)", border: "1px solid rgba(200,168,75,0.3)", borderRadius: 4, padding: "2px 8px", color: GOLD, letterSpacing: 2, textTransform: "uppercase", marginLeft: 6 }}>Admin</span>
        </div>
        <div style={{ fontSize: 10, color: DIM }}>{ADMIN_EMAIL}</div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px 80px" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
          <StatCard label="Total Users" value={stats.users} />
          <StatCard label="Total Searches" value={stats.searches} />
          <StatCard label="Today's Searches" value={stats.todaySearches} />
          <StatCard label="Total Gyms" value={stats.gyms} />
          <StatCard label="Total Stamps" value={stats.stamps} />
          <StatCard label="Total Battles" value={stats.battles} />
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: `1px solid ${BORDER}` }}>
          {tabs.map(t => (
            <button key={t} onClick={() => { setTab(t); }} style={{
              background: tab === t ? "rgba(200,168,75,0.1)" : "transparent",
              border: "none", borderBottom: tab === t ? `2px solid ${GOLD}` : "2px solid transparent",
              borderRadius: "6px 6px 0 0", padding: "9px 18px", cursor: "pointer",
              color: tab === t ? GOLD : DIM, fontSize: 12, fontWeight: tab === t ? 600 : 400,
              letterSpacing: 1, textTransform: "capitalize", fontFamily: "inherit", transition: "all 0.2s",
            }}>{t}</button>
          ))}
        </div>

        {/* Users tab */}
        {tab === "users" && (
          <div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Tier</th>
                    <th style={thStyle}>Newsletter</th>
                    <th style={thStyle}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={tdStyle}>{u.email}</td>
                      <td style={tdStyle}><span style={{ background: u.tier === "pro" ? "rgba(200,168,75,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${u.tier === "pro" ? "rgba(200,168,75,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: 4, padding: "2px 8px", fontSize: 10, color: u.tier === "pro" ? GOLD : DIM }}>{u.tier}</span></td>
                      <td style={tdStyle}>{u.newsletter ? "Yes" : "No"}</td>
                      <td style={tdStyle}>{fmt(u.created_at)}</td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan={4} style={{ ...tdStyle, textAlign: "center", padding: 24 }}>No users yet</td></tr>}
                </tbody>
              </table>
            </div>
            <Pagination page={usersPage} setPage={setUsersPage} total={usersCount} />
          </div>
        )}

        {/* Searches tab */}
        {tab === "searches" && (
          <div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>User</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Query</th>
                    <th style={thStyle}>Trip</th>
                    <th style={thStyle}>Tier</th>
                    <th style={thStyle}>Results</th>
                    <th style={thStyle}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {searches.map(s => (
                    <tr key={s.id}>
                      <td style={tdStyle}>{s.user_email || "—"}</td>
                      <td style={tdStyle}><span style={{ background: s.search_type === "finder" ? "rgba(200,168,75,0.1)" : "rgba(96,165,250,0.1)", border: `1px solid ${s.search_type === "finder" ? "rgba(200,168,75,0.25)" : "rgba(96,165,250,0.25)"}`, borderRadius: 4, padding: "2px 8px", fontSize: 10, color: s.search_type === "finder" ? GOLD : "#93c5fd" }}>{s.search_type}</span></td>
                      <td style={{ ...tdStyle, maxWidth: 180 }}>{s.query}</td>
                      <td style={tdStyle}>{s.trip_type || "—"}</td>
                      <td style={tdStyle}>{s.tier_at_time}</td>
                      <td style={tdStyle}>{s.result_count}</td>
                      <td style={tdStyle}>{fmt(s.created_at)}</td>
                    </tr>
                  ))}
                  {searches.length === 0 && <tr><td colSpan={7} style={{ ...tdStyle, textAlign: "center", padding: 24 }}>No searches yet</td></tr>}
                </tbody>
              </table>
            </div>
            <Pagination page={searchesPage} setPage={setSearchesPage} total={searchesCount} />
          </div>
        )}

        {/* Gyms tab */}
        {tab === "gyms" && (
          <div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>City</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Day Pass</th>
                    <th style={thStyle}>Week Pass</th>
                    <th style={thStyle}>Phone</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Website</th>
                    <th style={thStyle}>Instagram</th>
                  </tr>
                </thead>
                <tbody>
                  {gyms.map(g => (
                    <tr key={g.id}>
                      <td style={{ ...tdStyle, color: TEXT, fontWeight: 500 }}>{g.name}</td>
                      <td style={tdStyle}>{g.city || "—"}</td>
                      <td style={tdStyle}>{g.type || "—"}</td>
                      <td style={{ ...tdStyle, color: g.day_pass_price ? GOLD : DIM }}>{g.day_pass_price || "—"}</td>
                      <td style={{ ...tdStyle, color: g.week_pass_price ? GOLD : DIM }}>{g.week_pass_price || "—"}</td>
                      <td style={tdStyle}>{g.contact_phone || "—"}</td>
                      <td style={tdStyle}>{g.contact_email || "—"}</td>
                      <td style={tdStyle}>{g.contact_website ? <a href={g.contact_website} target="_blank" rel="noopener noreferrer" style={{ color: "#93c5fd", textDecoration: "none" }}>Link</a> : "—"}</td>
                      <td style={tdStyle}>{g.contact_instagram || "—"}</td>
                    </tr>
                  ))}
                  {gyms.length === 0 && <tr><td colSpan={9} style={{ ...tdStyle, textAlign: "center", padding: 24 }}>No gyms yet</td></tr>}
                </tbody>
              </table>
            </div>
            <Pagination page={gymsPage} setPage={setGymsPage} total={gymsCount} />
          </div>
        )}

        {/* Stamps tab */}
        {tab === "stamps" && (
          <div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>User</th>
                    <th style={thStyle}>Gym</th>
                    <th style={thStyle}>Rating</th>
                    <th style={thStyle}>Review</th>
                    <th style={thStyle}>Visited</th>
                    <th style={thStyle}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {stamps.map(s => (
                    <tr key={s.id}>
                      <td style={tdStyle}>{s.user_email}</td>
                      <td style={{ ...tdStyle, color: TEXT, fontWeight: 500 }}>{s.gyms?.name || `#${s.gym_id}`}</td>
                      <td style={tdStyle}>{s.rating ? <span style={{ color: "#FFD700" }}>{"★".repeat(s.rating)}{"☆".repeat(5 - s.rating)}</span> : "—"}</td>
                      <td style={{ ...tdStyle, maxWidth: 200 }}>{s.review || "—"}</td>
                      <td style={tdStyle}>{fmtDate(s.visited_at)}</td>
                      <td style={tdStyle}>{fmt(s.created_at)}</td>
                    </tr>
                  ))}
                  {stamps.length === 0 && <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center", padding: 24 }}>No stamps yet</td></tr>}
                </tbody>
              </table>
            </div>
            <Pagination page={stampsPage} setPage={setStampsPage} total={stampsCount} />
          </div>
        )}

        {/* Battles tab */}
        {tab === "battles" && (
          <div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>User</th>
                    <th style={thStyle}>Location</th>
                    <th style={thStyle}>Votes</th>
                    <th style={thStyle}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {battles.map(b => (
                    <tr key={b.id}>
                      <td style={tdStyle}>{b.user_email || "Anonymous"}</td>
                      <td style={{ ...tdStyle, color: TEXT }}>{b.location_text}</td>
                      <td style={tdStyle}><span style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: 4, padding: "2px 8px", fontSize: 10, color: "#f97316" }}>{b.voteCount}</span></td>
                      <td style={tdStyle}>{fmt(b.created_at)}</td>
                    </tr>
                  ))}
                  {battles.length === 0 && <tr><td colSpan={4} style={{ ...tdStyle, textAlign: "center", padding: 24 }}>No battles yet</td></tr>}
                </tbody>
              </table>
            </div>
            <Pagination page={battlesPage} setPage={setBattlesPage} total={battlesCount} />
          </div>
        )}

        {/* Analytics tab */}
        {tab === "analytics" && (
          <div>
            {/* Day toggle */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {[7, 30].map(d => (
                <button key={d} onClick={() => setAnalyticsDays(d)} style={{
                  background: analyticsDays === d ? "rgba(200,168,75,0.15)" : CARD_BG,
                  border: `1px solid ${analyticsDays === d ? "rgba(200,168,75,0.4)" : BORDER}`,
                  borderRadius: 6, padding: "5px 14px", cursor: "pointer",
                  color: analyticsDays === d ? GOLD : DIM, fontSize: 11, fontFamily: "inherit",
                }}>{d} days</button>
              ))}
            </div>

            {/* Stat cards */}
            <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
              <StatCard label="Total Page Views" value={analyticsStats.total} />
              <StatCard label="Unique Visitors" value={analyticsStats.unique} />
              <StatCard label="Views Today" value={analyticsStats.today} />
              <StatCard label="Top Referrer" value={analyticsStats.topReferrer} />
            </div>

            {/* Bar chart */}
            {dailyViews.length > 0 && (() => {
              const maxCount = Math.max(...dailyViews.map(d => d.count), 1);
              return (
                <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 20px 14px", marginBottom: 28 }}>
                  <div style={{ fontSize: 9, color: DIM, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Page Views Over Time</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120 }}>
                    {dailyViews.map((d, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ fontSize: 9, color: DIM }}>{d.count || ""}</div>
                        <div style={{
                          width: "100%", maxWidth: 32,
                          height: Math.max(2, (d.count / maxCount) * 90),
                          background: `linear-gradient(180deg, ${GOLD}, #8a6f28)`,
                          borderRadius: "3px 3px 0 0",
                          transition: "height 0.3s ease",
                        }} />
                        <div style={{ fontSize: 8, color: DIM, whiteSpace: "nowrap" }}>{d.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Two-column grid: referrers + pages */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Traffic Sources */}
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 9, color: DIM, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>Traffic Sources</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Source</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topReferrers.map((r, i) => (
                      <tr key={i}>
                        <td style={tdStyle}>{r.host}</td>
                        <td style={{ ...tdStyle, textAlign: "right", color: GOLD }}>{r.count}</td>
                      </tr>
                    ))}
                    {topReferrers.length === 0 && (
                      <tr><td colSpan={2} style={{ ...tdStyle, textAlign: "center", padding: 20 }}>No referrer data yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Top Pages */}
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 9, color: DIM, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>Top Pages</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Page</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPages.map((p, i) => (
                      <tr key={i}>
                        <td style={tdStyle}>{p.path}</td>
                        <td style={{ ...tdStyle, textAlign: "right", color: GOLD }}>{p.count}</td>
                      </tr>
                    ))}
                    {topPages.length === 0 && (
                      <tr><td colSpan={2} style={{ ...tdStyle, textAlign: "center", padding: 20 }}>No page data yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add Gym tab */}
        {tab === "add-gym" && (
          <div>
            <form onSubmit={handleAddGym} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 700 }}>
              {[
                ["name", "Gym Name *", "text", true],
                ["city", "City *", "text", true],
                ["country", "Country *", "text", true],
                ["type", "Type", "text", false],
                ["address", "Address", "text", false],
                ["neighborhood", "Neighborhood", "text", false],
                ["dayPassPrice", "Day Pass Price", "text", false],
                ["weekPassPrice", "Week Pass Price", "text", false],
                ["contactPhone", "Phone", "text", false],
                ["contactEmail", "Email", "text", false],
                ["contactWebsite", "Website", "text", false],
                ["contactInstagram", "Instagram", "text", false],
              ].map(([key, label, type, req]) => (
                <label key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 10, color: DIM, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
                  <input type={type} required={req} value={gymForm[key]} onChange={e => setGymForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 10px", color: TEXT, fontSize: 12, fontFamily: "inherit" }} />
                </label>
              ))}
              <label style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 10, color: DIM, letterSpacing: 1, textTransform: "uppercase" }}>Description</span>
                <textarea value={gymForm.description} onChange={e => setGymForm(f => ({ ...f, description: e.target.value }))} rows={3}
                  style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 10px", color: TEXT, fontSize: 12, fontFamily: "inherit", resize: "vertical" }} />
              </label>
              <label style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 10, color: DIM, letterSpacing: 1, textTransform: "uppercase" }}>Pass Notes</span>
                <input type="text" value={gymForm.passNotes} onChange={e => setGymForm(f => ({ ...f, passNotes: e.target.value }))}
                  style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 10px", color: TEXT, fontSize: 12, fontFamily: "inherit" }} />
              </label>
              <div style={{ gridColumn: "1 / -1", fontSize: 10, color: GOLD, letterSpacing: 2, textTransform: "uppercase", marginTop: 8 }}>Scores (0–100)</div>
              {["equipment", "cleanliness", "amenities", "staff", "atmosphere", "value", "recovery", "classes"].map(key => (
                <label key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 10, color: DIM, textTransform: "capitalize" }}>{key}: {gymForm[key]}</span>
                  <input type="range" min="0" max="100" value={gymForm[key]} onChange={e => setGymForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ accentColor: GOLD }} />
                </label>
              ))}
              <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
                <button type="submit" disabled={gymFormStatus === "saving"}
                  style={{ background: `linear-gradient(135deg,${GOLD},#8a6f28)`, border: "none", borderRadius: 8, padding: "10px 28px", color: "#090807", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  {gymFormStatus === "saving" ? "Saving..." : "Add Gym"}
                </button>
                {gymFormStatus && gymFormStatus !== "saving" && (
                  <span style={{ fontSize: 12, color: gymFormStatus.startsWith("Error") ? "#ef4444" : "#22c55e" }}>{gymFormStatus}</span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Add City tab */}
        {tab === "add-city" && (
          <div>
            <form onSubmit={handleAddCity} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 700 }}>
              {[
                ["name", "City Name *", true],
                ["country", "Country *", true],
                ["region", "Region", false],
              ].map(([key, label, req]) => (
                <label key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 10, color: DIM, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
                  <input type="text" required={req} value={cityForm[key]} onChange={e => setCityForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 10px", color: TEXT, fontSize: 12, fontFamily: "inherit" }} />
                </label>
              ))}
              <label style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 10, color: DIM, letterSpacing: 1, textTransform: "uppercase" }}>Description</span>
                <textarea value={cityForm.description} onChange={e => setCityForm(f => ({ ...f, description: e.target.value }))} rows={3}
                  style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 10px", color: TEXT, fontSize: 12, fontFamily: "inherit", resize: "vertical" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 10, color: DIM, letterSpacing: 1, textTransform: "uppercase" }}>Nearby Destinations (comma-separated slugs)</span>
                <input type="text" value={cityForm.nearbyDestinations} onChange={e => setCityForm(f => ({ ...f, nearbyDestinations: e.target.value }))} placeholder="e.g. new-york, boston"
                  style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 10px", color: TEXT, fontSize: 12, fontFamily: "inherit" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 10, color: DIM, letterSpacing: 1, textTransform: "uppercase" }}>Related Cities (comma-separated slugs)</span>
                <input type="text" value={cityForm.relatedCities} onChange={e => setCityForm(f => ({ ...f, relatedCities: e.target.value }))} placeholder="e.g. los-angeles, miami"
                  style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 10px", color: TEXT, fontSize: 12, fontFamily: "inherit" }} />
              </label>
              <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
                <button type="submit" disabled={cityFormStatus === "saving"}
                  style={{ background: `linear-gradient(135deg,${GOLD},#8a6f28)`, border: "none", borderRadius: 8, padding: "10px 28px", color: "#090807", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  {cityFormStatus === "saving" ? "Saving..." : "Add City"}
                </button>
                {cityFormStatus && cityFormStatus !== "saving" && (
                  <span style={{ fontSize: 12, color: cityFormStatus.startsWith("Error") ? "#ef4444" : "#22c55e" }}>{cityFormStatus}</span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Rankings tab */}
        {tab === "rankings" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, color: DIM, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Select City</label>
              <select value={rankCity} onChange={e => setRankCity(e.target.value)}
                style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 14px", color: TEXT, fontSize: 12, fontFamily: "inherit", minWidth: 200 }}>
                <option value="">Choose a city...</option>
                {rankCities.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            {rankCity && rankGyms.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Gym</th>
                      {["equipment", "cleanliness", "amenities", "staff", "atmosphere", "value", "recovery", "classes"].map(k => (
                        <th key={k} style={{ ...thStyle, textAlign: "center", fontSize: 8 }}>{k.slice(0, 5).toUpperCase()}</th>
                      ))}
                      <th style={thStyle}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankGyms.map(g => {
                      const scores = g.scores || {};
                      return (
                        <tr key={g.id}>
                          <td style={{ ...tdStyle, color: TEXT, fontWeight: 500, whiteSpace: "nowrap" }}>{g.name}</td>
                          {["equipment", "cleanliness", "amenities", "staff", "atmosphere", "value", "recovery", "classes"].map(k => (
                            <td key={k} style={{ ...tdStyle, textAlign: "center", padding: "4px 2px" }}>
                              <input type="number" min="0" max="100" value={scores[k] || 0}
                                onChange={e => {
                                  const val = Math.min(100, Math.max(0, Number(e.target.value)));
                                  setRankGyms(prev => prev.map(rg =>
                                    rg.id === g.id ? { ...rg, scores: { ...rg.scores, [k]: val } } : rg
                                  ));
                                }}
                                style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`, borderRadius: 4, padding: "4px", color: GOLD, fontSize: 11, width: 44, textAlign: "center", fontFamily: "inherit" }} />
                            </td>
                          ))}
                          <td style={tdStyle}>
                            <button onClick={() => handleScoreUpdate(g.id, g.slug, rankCity, g.scores)}
                              disabled={rankSaving === g.id}
                              style={{ background: "rgba(200,168,75,0.15)", border: `1px solid rgba(200,168,75,0.3)`, borderRadius: 4, padding: "4px 10px", color: GOLD, fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>
                              {rankSaving === g.id ? "..." : "Save"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {rankCity && rankGyms.length === 0 && (
              <p style={{ color: DIM, fontSize: 13 }}>No gyms found for this city.</p>
            )}
          </div>
        )}

        {/* SEO tab */}
        {tab === "seo" && (
          <div>
            {/* Day toggle */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {[7, 28].map(d => (
                <button key={d} onClick={() => setSeoDays(d)} style={{
                  background: seoDays === d ? "rgba(200,168,75,0.15)" : CARD_BG,
                  border: `1px solid ${seoDays === d ? "rgba(200,168,75,0.4)" : BORDER}`,
                  borderRadius: 6, padding: "5px 14px", cursor: "pointer",
                  color: seoDays === d ? GOLD : DIM, fontSize: 11, fontFamily: "inherit",
                }}>{d} days</button>
              ))}
            </div>

            {seoLoading && (
              <div style={{ textAlign: "center", padding: 40, color: DIM, fontSize: 13 }}>Loading SEO data...</div>
            )}

            {seoError && !seoData && !seoLoading && (
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "32px 28px" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: TEXT, marginBottom: 12 }}>Google Search Console Setup</div>
                <p style={{ fontSize: 12, color: DIM, lineHeight: 1.8, marginBottom: 20 }}>
                  To see SEO data, connect Google Search Console via the Cloudflare Worker proxy.
                </p>
                <ol style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 2.2, paddingLeft: 20 }}>
                  <li>Create a GCP service account with Search Console API access</li>
                  <li>Add the service account email as a user in your Search Console property</li>
                  <li>Store the service account JSON key in your Cloudflare Worker secrets as <code style={{ background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 3, fontSize: 11 }}>GSC_SERVICE_ACCOUNT</code></li>
                  <li>Store your Search Console site URL as <code style={{ background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 3, fontSize: 11 }}>GSC_SITE_URL</code></li>
                  <li>Deploy the <code style={{ background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 3, fontSize: 11 }}>POST /gsc</code> endpoint on your Cloudflare Worker</li>
                </ol>
                <div style={{ marginTop: 16, fontSize: 10, color: DIM }}>Error: {seoError}</div>
              </div>
            )}

            {seoData && !seoLoading && (
              <>
                {/* SEO stat cards */}
                <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
                  <StatCard label="Clicks" value={seoData.totals?.clicks ?? 0} />
                  <StatCard label="Impressions" value={seoData.totals?.impressions ?? 0} />
                  <StatCard label="CTR" value={seoData.totals?.ctr != null ? (seoData.totals.ctr * 100).toFixed(1) + "%" : "—"} />
                  <StatCard label="Avg Position" value={seoData.totals?.position != null ? seoData.totals.position.toFixed(1) : "—"} />
                </div>

                {/* Search queries table */}
                <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 9, color: DIM, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>Search Queries</div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Query</th>
                          <th style={{ ...thStyle, textAlign: "right" }}>Clicks</th>
                          <th style={{ ...thStyle, textAlign: "right" }}>Impressions</th>
                          <th style={{ ...thStyle, textAlign: "right" }}>CTR</th>
                          <th style={{ ...thStyle, textAlign: "right" }}>Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(seoData.rows || []).map((r, i) => (
                          <tr key={i}>
                            <td style={tdStyle}>{r.keys?.[0] || "—"}</td>
                            <td style={{ ...tdStyle, textAlign: "right", color: GOLD }}>{r.clicks}</td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>{r.impressions}</td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>{(r.ctr * 100).toFixed(1)}%</td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>{r.position.toFixed(1)}</td>
                          </tr>
                        ))}
                        {(!seoData.rows || seoData.rows.length === 0) && (
                          <tr><td colSpan={5} style={{ ...tdStyle, textAlign: "center", padding: 24 }}>No search query data</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
