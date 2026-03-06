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

  // Auth check
  useEffect(() => {
    try {
      const email = localStorage.getItem("ip_email");
      setAuthorized(email === ADMIN_EMAIL);
    } catch {
      setAuthorized(false);
    }
  }, []);

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

  const tabs = ["users", "searches", "gyms", "stamps", "battles"];

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
      </div>
    </div>
  );
}
