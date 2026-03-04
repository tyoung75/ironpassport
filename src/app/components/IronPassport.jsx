"use client";
import { useState, useEffect } from "react";

const API = "https://ironpassport-api.YOUR_SUBDOMAIN.workers.dev";

// TIERS
// anonymous : 1 free search, results 2-6 visible, result #1 blurred
// free      : 5 searches/mo, all 6 results visible (unlocked with email only)
// pro       : unlimited searches, all results

const TIERS = {
  anonymous: { searches: 1,        topLocked: true,  label: "Guest" },
  free:      { searches: 5,        topLocked: false, label: "Free"  },
  pro:       { searches: Infinity, topLocked: false, label: "Pro"   },
};

const GYM_CRITERIA = [
  { key: "equipment",   label: "Equipment",        icon: "⊕", weight: 0.20 },
  { key: "cleanliness", label: "Cleanliness",      icon: "✦", weight: 0.18 },
  { key: "amenities",   label: "Amenities",        icon: "◉", weight: 0.14 },
  { key: "staff",       label: "Staff & Trainers", icon: "◈", weight: 0.12 },
  { key: "atmosphere",  label: "Atmosphere",       icon: "◎", weight: 0.11 },
  { key: "value",       label: "Value",            icon: "◇", weight: 0.10 },
  { key: "recovery",    label: "Recovery",         icon: "⊛", weight: 0.08 },
  { key: "classes",     label: "Classes",          icon: "◫", weight: 0.07 },
];

const TRIP_TAGS = [
  { key: "work",      label: "Work / Conference", emoji: "💼" },
  { key: "vacation",  label: "Vacation",          emoji: "🌴" },
  { key: "adventure", label: "Adventure",         emoji: "🏔️" },
  { key: "wellness",  label: "Wellness",          emoji: "🧘" },
  { key: "weekend",   label: "Weekend",           emoji: "🚗" },
  { key: "luxury",    label: "Luxury",            emoji: "✨" },
];

const DISCOVERY_PROMPTS = [
  "A mountain destination with world-class gyms",
  "Tropical beach trip with serious lifting facilities",
  "European city break with premium fitness culture",
  "Wellness retreat with elite recovery facilities",
];

const FINDER_PROMPTS = [
  { label: "Conference in Las Vegas", trip: "work"     },
  { label: "Work trip to New York",   trip: "work"     },
  { label: "Vacation in Bali",        trip: "vacation" },
  { label: "Weekend in Miami",        trip: "weekend"  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function calcScore(scores) {
  if (!scores) return 0;
  return Math.round(GYM_CRITERIA.reduce((a, c) => a + (scores[c.key] || 0) * c.weight, 0));
}
function scoreColor(s) {
  return s >= 85 ? "#FFD700" : s >= 72 ? "#c8a84b" : s >= 58 ? "#94a3b8" : "#6b7280";
}

// ─── Atoms ────────────────────────────────────────────────────────────────────
function Ring({ value, size = 52, color }) {
  const col = color || scoreColor(value);
  const stroke = 3.5, r = (size - stroke * 2) / 2, circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(circ);
  useEffect(() => {
    const t = setTimeout(() => setDash(circ * (1 - value / 100)), 450);
    return () => clearTimeout(t);
  }, [value, circ]);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute", inset: 0 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--serif)", fontSize: size > 52 ? 18 : 14, color: "#f0ebe0", lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 7, color: "rgba(255,255,255,0.28)", letterSpacing: 0.8, marginTop: 1 }}>SCORE</span>
      </div>
    </div>
  );
}

function ScoreBar({ value, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 180 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: "#c8a84b", borderRadius: 2, transition: "width 1s cubic-bezier(.16,1,.3,1)" }} />
    </div>
  );
}

function RankNum({ n }) {
  const c = { 1: "#FFD700", 2: "#C0C0C0", 3: "#CD7F32" }[n] || "rgba(255,255,255,0.18)";
  return (
    <div style={{ width: 34, height: 34, border: `1.5px solid ${c}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: "var(--serif)", fontSize: n <= 3 ? 15 : 13, color: c, fontWeight: 700 }}>{n}</span>
    </div>
  );
}

function PassPill({ type, price }) {
  if (!price) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(200,168,75,0.1)", border: "1px solid rgba(200,168,75,0.22)", borderRadius: 4, padding: "2px 8px", fontSize: 10, color: "#c8a84b" }}>
      {type === "day" ? "☀" : "📅"} {type === "day" ? "Day" : "Week"} pass · <span style={{ color: "#e8d494" }}>{price}</span>
    </span>
  );
}

function TravelRow({ travel, stayingAt }) {
  if (!travel) return null;
  const rows = [
    { icon: "🚶", label: "Walk",    time: travel.walkingTime, cost: null },
    { icon: "🚇", label: "Transit", time: travel.transitTime, cost: travel.transitCost },
    { icon: "🚗", label: "Uber",    time: travel.uberTime,    cost: travel.uberCost },
  ].filter(r => r.time);
  if (!rows.length) return null;
  return (
    <div style={{ marginTop: 9 }}>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 7 }}>From {stayingAt}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {rows.map(r => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: "5px 10px" }}>
            <span style={{ fontSize: 13 }}>{r.icon}</span>
            <div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{r.label}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{r.time}{r.cost && <span style={{ color: "#c8a84b", marginLeft: 4 }}>{r.cost}</span>}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Gym Detail Drawer ────────────────────────────────────────────────────────
function GymDrawer({ gym, rank, stayingAt, onClose }) {
  if (!gym) return null;
  const score = calcScore(gym.scores);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(14px)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(160deg,#141108 0%,#0c0b08 100%)", border: "1px solid rgba(200,168,75,0.18)", borderRadius: 20, maxWidth: 560, width: "100%", maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ padding: "22px 22px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 14, alignItems: "flex-start" }}>
          <RankNum n={rank} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "var(--serif)", fontSize: 20, color: "#f0ebe0" }}>{gym.name}</span>
                  {rank === 1 && <span style={{ fontSize: 8, background: "#c8a84b", color: "#0a0806", borderRadius: 3, padding: "2px 6px", fontWeight: 700, letterSpacing: 1 }}>TOP PICK</span>}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", marginTop: 3 }}>{gym.type} · {gym.address}</div>
              </div>
              <Ring value={score} size={54} />
            </div>
            <p style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.52)", lineHeight: 1.7, fontStyle: "italic" }}>{gym.description}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: "rgba(255,255,255,0.45)", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
        </div>
        <div style={{ padding: "18px 22px", display: "grid", gap: 18 }}>
          <div style={{ background: "rgba(200,168,75,0.05)", border: "1px solid rgba(200,168,75,0.14)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, color: "#c8a84b", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Visitor Access</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: 1, marginBottom: 3 }}>DAY PASS</div>
                {gym.dayPassAvailable
                  ? <div style={{ fontSize: 15, color: "#e8d494" }}>{gym.dayPassPrice}<span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginLeft: 4 }}>/ visit</span></div>
                  : <div style={{ fontSize: 11, color: "rgba(255,255,255,0.22)" }}>Not available</div>}
              </div>
              <div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: 1, marginBottom: 3 }}>WEEK PASS</div>
                {gym.weekPassAvailable
                  ? <div style={{ fontSize: 15, color: "#e8d494" }}>{gym.weekPassPrice}<span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginLeft: 4 }}>/ week</span></div>
                  : <div style={{ fontSize: 11, color: "rgba(255,255,255,0.22)" }}>Not available</div>}
              </div>
            </div>
            {gym.passNotes && <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>{gym.passNotes}</div>}
          </div>
          {stayingAt && gym.travel && (
            <div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>From {stayingAt}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {[
                  { icon: "🚶", label: "Walking", time: gym.travel.walkingTime, cost: null },
                  { icon: "🚇", label: "Transit",  time: gym.travel.transitTime, cost: gym.travel.transitCost },
                  { icon: "🚗", label: "Uber",     time: gym.travel.uberTime,    cost: gym.travel.uberCost },
                ].map(m => m.time ? (
                  <div key={m.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{m.icon}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>{m.label}</div>
                    <div style={{ fontSize: 13, color: "#f0ebe0" }}>{m.time}</div>
                    {m.cost && <div style={{ fontSize: 11, color: "#c8a84b", marginTop: 2 }}>{m.cost}</div>}
                  </div>
                ) : null)}
              </div>
            </div>
          )}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: 3, textTransform: "uppercase" }}>Quality Breakdown</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 20, color: "#c8a84b" }}>{score}<span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)" }}>/100</span></div>
            </div>
            <div style={{ display: "grid", gap: 9 }}>
              {GYM_CRITERIA.map((c, i) => (
                <div key={c.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{c.icon} {c.label} <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 9 }}>({Math.round(c.weight * 100)}%)</span></span>
                    <span style={{ fontSize: 11, color: "#c8a84b" }}>{gym.scores?.[c.key] || 0}</span>
                  </div>
                  <ScoreBar value={gym.scores?.[c.key] || 0} delay={i * 45} />
                </div>
              ))}
            </div>
          </div>
          {gym.highlights?.length > 0 && (
            <div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>What Makes It Special</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {gym.highlights.map((h, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "8px 10px" }}>
                    <span style={{ fontSize: 13 }}>{h.icon}</span>
                    <div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)" }}>{h.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>{h.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Gym card (visible) ───────────────────────────────────────────────────────
function GymCard({ gym, rank, stayingAt, onClick }) {
  const score = calcScore(gym.scores);
  const isTop = rank === 1;
  return (
    <div onClick={onClick} className="card-hover" style={{
      background: isTop ? "linear-gradient(135deg,rgba(200,168,75,0.07),rgba(255,255,255,0.02))" : "rgba(255,255,255,0.025)",
      border: `1px solid ${isTop ? "rgba(200,168,75,0.22)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 14, padding: "16px 18px", cursor: "pointer", position: "relative", overflow: "hidden",
    }}>
      {isTop && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, background: "linear-gradient(90deg,transparent,#c8a84b,transparent)", opacity: 0.8 }} />}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <RankNum n={rank} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--serif)", fontSize: 17, color: "#f0ebe0" }}>{gym.name}</span>
                {isTop && <span style={{ fontSize: 8, background: "#c8a84b", color: "#0a0806", borderRadius: 3, padding: "2px 5px", fontWeight: 700, letterSpacing: 1 }}>TOP PICK</span>}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{gym.type} · {gym.neighborhood || gym.address}</div>
            </div>
            <Ring value={score} size={48} />
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.52)", lineHeight: 1.6, margin: "6px 0 9px", fontStyle: "italic" }}>{gym.whyRecommended}</p>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {gym.dayPassAvailable && <PassPill type="day" price={gym.dayPassPrice} />}
            {gym.weekPassAvailable && <PassPill type="week" price={gym.weekPassPrice} />}
            {!gym.dayPassAvailable && !gym.weekPassAvailable && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>Members only</span>}
          </div>
          {stayingAt && gym.travel && <TravelRow travel={gym.travel} stayingAt={stayingAt} />}
          {gym.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
              {gym.tags.slice(0, 5).map((t, i) => (
                <span key={i} style={{ fontSize: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, padding: "2px 6px", color: "rgba(255,255,255,0.36)", letterSpacing: 0.5, textTransform: "uppercase" }}>{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Blurred #1 card with email CTA overlay ───────────────────────────────────
function BlurredTopResult({ gym, onSignUp }) {
  const score = calcScore(gym?.scores);
  return (
    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(200,168,75,0.4)" }}>
      {/* Gold shimmer top edge */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#FFD700 30%,#e8d494 50%,#FFD700 70%,transparent)", zIndex: 3 }} />

      {/* Real card content — blurred beneath the overlay */}
      <div style={{ filter: "blur(8px)", userSelect: "none", pointerEvents: "none", background: "linear-gradient(135deg,rgba(200,168,75,0.07),rgba(255,255,255,0.02))", padding: "16px 18px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 34, height: 34, border: "1.5px solid #FFD700", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontFamily: "var(--serif)", fontSize: 15, color: "#FFD700", fontWeight: 700 }}>1</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontFamily: "var(--serif)", fontSize: 17, color: "#f0ebe0" }}>{gym?.name || "Top Ranked Gym"}</span>
                  <span style={{ fontSize: 8, background: "#c8a84b", color: "#0a0806", borderRadius: 3, padding: "2px 5px", fontWeight: 700, letterSpacing: 1 }}>TOP PICK</span>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{gym?.type} · {gym?.neighborhood || gym?.address}</div>
              </div>
              <div style={{ width: 48, height: 48, background: "rgba(200,168,75,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "var(--serif)", fontSize: 16, color: "#c8a84b" }}>{score}</span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.52)", lineHeight: 1.6, margin: "0 0 10px", fontStyle: "italic" }}>{gym?.whyRecommended}</p>
            <div style={{ display: "flex", gap: 5 }}>
              <div style={{ height: 20, background: "rgba(200,168,75,0.2)", borderRadius: 4, width: 90 }} />
              <div style={{ height: 20, background: "rgba(200,168,75,0.12)", borderRadius: 4, width: 75 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,rgba(9,8,7,0.78) 0%,rgba(14,10,4,0.88) 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "24px 28px", cursor: "pointer", zIndex: 2 }} onClick={onSignUp}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>🏆</span>
          <div style={{ fontFamily: "var(--serif)", fontSize: 20, color: "#e8d494", lineHeight: 1.2 }}>
            Your #1 Result is Hidden
          </div>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", textAlign: "center", lineHeight: 1.7, maxWidth: 300, margin: 0 }}>
          Sign up today to see the top-ranked gym for your search.<br />
          <strong style={{ color: "rgba(255,255,255,0.8)" }}>No payment necessary — email only.</strong>
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "linear-gradient(135deg,#c8a84b,#9a7228)", borderRadius: 10, padding: "11px 24px", boxShadow: "0 6px 24px rgba(200,168,75,0.45)", transition: "opacity 0.2s" }}>
          <span style={{ fontSize: 14 }}>✉️</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#0a0806", letterSpacing: 1.3, textTransform: "uppercase" }}>Sign Up Free to Reveal</span>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 0.5 }}>Takes 10 seconds · No credit card</div>
      </div>
    </div>
  );
}

// ─── Email Sign-up Modal ──────────────────────────────────────────────────────
function SignUpModal({ onClose, onSuccess }) {
  const [email,      setEmail]      = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [loading,    setLoading]    = useState(false);
  const [done,       setDone]       = useState(false);

  function handleSubmit() {
    if (!email.includes("@")) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      setTimeout(() => { onSuccess(email); onClose(); }, 1200);
    }, 900);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(18px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(160deg,#18140a 0%,#0e0c08 100%)", border: "1px solid rgba(200,168,75,0.25)", borderRadius: 22, maxWidth: 400, width: "100%", overflow: "hidden", position: "relative" }}>
        <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#FFD700 30%,#e8d494 50%,#FFD700 70%,transparent)" }} />
        <div style={{ padding: "28px 28px 26px" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>

          {!done ? (
            <>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🏆</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 26, color: "#f0ebe0", lineHeight: 1.2, marginBottom: 10 }}>Reveal Your #1 Gym</div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.75 }}>
                  Enter your email to instantly unlock the top result — plus get <span style={{ color: "#c8a84b" }}>5 free searches</span> per month.
                </p>
              </div>

              {/* What you unlock */}
              <div style={{ background: "rgba(200,168,75,0.06)", border: "1px solid rgba(200,168,75,0.15)", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
                {[
                  { icon: "🥇", text: "Your #1 ranked gym revealed immediately" },
                  { icon: "🔍", text: "5 full searches per month, free"          },
                  { icon: "📋", text: "All 6 results visible on every search"    },
                  { icon: "📬", text: "Weekly gym intel newsletter"               },
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < 3 ? 9 : 0 }}>
                    <span style={{ fontSize: 15 }}>{f.icon}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.62)" }}>{f.text}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Your email</div>
                <input
                  value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  placeholder="you@example.com" autoFocus
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10, padding: "12px 14px", color: "#f0ebe0", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div onClick={() => setNewsletter(!newsletter)} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, cursor: "pointer", userSelect: "none" }}>
                <div style={{ width: 18, height: 18, background: newsletter ? "#c8a84b" : "transparent", border: `1.5px solid ${newsletter ? "#c8a84b" : "rgba(255,255,255,0.2)"}`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                  {newsletter && <span style={{ fontSize: 11, color: "#0a0806", fontWeight: 700 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>Subscribe to Weekly Gym Intel</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>New destination guides, top gym openings & travel tips</div>
                </div>
              </div>

              <button onClick={handleSubmit} disabled={!email.includes("@") || loading}
                style={{ width: "100%", background: email.includes("@") ? "linear-gradient(135deg,#c8a84b,#9a7228)" : "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: "13px", color: email.includes("@") ? "#0a0806" : "rgba(255,255,255,0.2)", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: email.includes("@") ? "pointer" : "default", fontFamily: "inherit", transition: "opacity 0.2s" }}>
                {loading ? "Unlocking…" : "Reveal My #1 Gym — Free →"}
              </button>
              <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 10 }}>
                No credit card · No payment · Unsubscribe any time
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0 10px" }}>
              <div style={{ fontSize: 42, marginBottom: 14 }}>✅</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 24, color: "#f0ebe0", marginBottom: 8 }}>You're in!</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>Revealing your top result now…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pro Upgrade Modal (for free users hitting search limit) ──────────────────
function ProModal({ onClose, onUpgrade }) {
  const [email,   setEmail]   = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [step,    setStep]    = useState("main");
  const [loading, setLoading] = useState(false);

  function handlePay() {
    if (!cardNum || !cardExp || !cardCvc) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onUpgrade(email); setStep("success"); }, 1200);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(18px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(160deg,#18140a,#0e0c08)", border: "1px solid rgba(200,168,75,0.25)", borderRadius: 22, maxWidth: 400, width: "100%", overflow: "hidden", position: "relative" }}>
        <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#c8a84b 40%,#e8d494 60%,transparent)" }} />
        <div style={{ padding: "26px 26px 24px" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>

          {step === "main" && (
            <>
              <div style={{ fontSize: 9, color: "#c8a84b", letterSpacing: 4, textTransform: "uppercase", marginBottom: 10 }}>⭐ IronPassport Pro</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 24, color: "#f0ebe0", marginBottom: 8 }}>Unlimited searches</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.7, marginBottom: 20 }}>You've used all your free searches. Go Pro for $5/month — unlimited access, forever.</p>
              {["Unlimited searches, always","All 6 results on every search","Full score breakdowns & pass info","Hotel proximity ranking","Priority support"].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: "#c8a84b", fontSize: 11, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.58)" }}>{f}</span>
                </div>
              ))}
              <div style={{ marginTop: 20, marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Email</div>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9, padding: "11px 13px", color: "#f0ebe0", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <button onClick={() => email.includes("@") && setStep("payment")} style={{ width: "100%", background: email.includes("@") ? "linear-gradient(135deg,#c8a84b,#9a7228)" : "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: "13px", color: email.includes("@") ? "#0a0806" : "rgba(255,255,255,0.2)", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: email.includes("@") ? "pointer" : "default", fontFamily: "inherit" }}>
                Get Pro — $5/month →
              </button>
            </>
          )}

          {step === "payment" && (
            <>
              <div style={{ fontSize: 9, color: "#c8a84b", letterSpacing: 4, textTransform: "uppercase", marginBottom: 10 }}>Secure Payment</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "#f0ebe0", marginBottom: 6 }}>IronPassport Pro</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(200,168,75,0.07)", border: "1px solid rgba(200,168,75,0.18)", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#f0ebe0" }}>Pro Monthly</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", marginTop: 2 }}>Unlimited · Cancel any time</div>
                </div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "#c8a84b" }}>$5<span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>/mo</span></div>
              </div>
              {[
                { label: "Card number", val: cardNum, set: setCardNum, placeholder: "1234 5678 9012 3456", maxLen: 19 },
                { label: "Expiry",      val: cardExp, set: setCardExp, placeholder: "MM / YY",            maxLen: 7  },
                { label: "CVC",         val: cardCvc, set: setCardCvc, placeholder: "123",                maxLen: 4  },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>{f.label}</div>
                  <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} maxLength={f.maxLen}
                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9, padding: "10px 13px", color: "#f0ebe0", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", marginBottom: 18, display: "flex", alignItems: "center", gap: 5 }}>🔒 256-bit SSL · Powered by Stripe</div>
              <button onClick={handlePay} disabled={!cardNum || !cardExp || !cardCvc || loading}
                style={{ width: "100%", background: cardNum && cardExp && cardCvc ? "linear-gradient(135deg,#c8a84b,#9a7228)" : "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: "13px", color: cardNum && cardExp && cardCvc ? "#0a0806" : "rgba(255,255,255,0.2)", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: cardNum && cardExp && cardCvc ? "pointer" : "default", fontFamily: "inherit" }}>
                {loading ? "Processing…" : "Start Pro — $5/month →"}
              </button>
            </>
          )}

          {step === "success" && (
            <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>🎉</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 24, color: "#f0ebe0", marginBottom: 8 }}>Welcome to Pro</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: 22 }}>Unlimited searches unlocked. The world's best gyms are yours.</p>
              <button onClick={onClose} style={{ background: "linear-gradient(135deg,#c8a84b,#9a7228)", border: "none", borderRadius: 10, padding: "12px 28px", color: "#0a0806", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>Start Exploring →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Result list (handles blurred #1 vs visible 2-6) ─────────────────────────
function ResultsList({ gyms, tier, stayingAt, onSignUp }) {
  const [selected, setSelected] = useState(null);
  const [selRank,  setSelRank]  = useState(null);
  const topLocked = TIERS[tier].topLocked;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 7, marginBottom: 12, fontSize: 10, color: "rgba(255,255,255,0.28)" }}>
        <span>{topLocked ? "Sign up free to unlock your #1 result" : `Click any gym for full breakdown${stayingAt ? ` · proximity to ${stayingAt}` : ""}`}</span>
        <span style={{ display: "flex", gap: 10 }}>
          <span style={{ color: "#FFD700" }}>● 1st</span>
          <span style={{ color: "#C0C0C0" }}>● 2nd</span>
          <span style={{ color: "#CD7F32" }}>● 3rd</span>
        </span>
      </div>

      <div style={{ display: "grid", gap: 9 }}>
        {gyms.map((gym, i) => (
          <div key={i} className="fade-up" style={{ animationDelay: `${i * 65}ms` }}>
            {/* Rank #1 blurred for anonymous users, shown normally for free/pro */}
            {i === 0 && topLocked
              ? <BlurredTopResult gym={gym} onSignUp={onSignUp} />
              : <GymCard gym={gym} rank={i + 1} stayingAt={stayingAt} onClick={() => { setSelected(gym); setSelRank(i + 1); }} />
            }
          </div>
        ))}
      </div>

      <GymDrawer gym={selected} rank={selRank} stayingAt={stayingAt} onClose={() => setSelected(null)} />
    </div>
  );
}

// ─── Gym Finder Flow ──────────────────────────────────────────────────────────
function GymFinder({ tier, searchCount, onSearch, onBack, onSignUp, onProModal }) {
  const [destination, setDestination] = useState("");
  const [stayingAt,   setStayingAt]   = useState("");
  const [tripType,    setTripType]    = useState("work");
  const [gyms,        setGyms]        = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastDest,    setLastDest]    = useState("");

  const canSearch = tier === "pro" || searchCount < TIERS[tier].searches;

  async function doSearch(ovDest, ovTrip) {
    const dest = ovDest || destination;
    const trip = ovTrip || tripType;
    if (!dest.trim()) return;
    if (!canSearch) { onProModal(); return; }
    setLoading(true); setError(null); setGyms([]); setHasSearched(true); setLastDest(dest);
    onSearch();
    const tripLabel = TRIP_TAGS.find(t => t.key === trip)?.label || trip;
    const locCtx = stayingAt ? `User staying near: "${stayingAt}". Factor proximity into ranking. Estimate realistic walk/transit/uber times.` : "No hotel provided.";
    const sys = `You are IronPassport. Find the top 6 real gyms stack-ranked for a traveler.
TRIP TYPE: ${tripLabel} | LOCATION: ${dest}
${locCtx}
SCORING (0-100 per criterion):
${GYM_CRITERIA.map(c => `- ${c.key} (${Math.round(c.weight * 100)}%)`).join("\n")}
Return JSON array of exactly 6:
{"name":string,"type":string,"address":string,"neighborhood":string,"whyRecommended":string,"description":string,"scores":{"equipment":0-100,"cleanliness":0-100,"amenities":0-100,"staff":0-100,"atmosphere":0-100,"value":0-100,"recovery":0-100,"classes":0-100},"dayPassAvailable":bool,"dayPassPrice":"$XX"|null,"weekPassAvailable":bool,"weekPassPrice":"$XX"|null,"passNotes":string|null,"tags":[3-6 strings],"highlights":[{"icon":emoji,"label":string,"value":string}x4-5]${stayingAt ? `,"travel":{"walkingTime":"X min"|null,"transitTime":"X min"|null,"transitCost":"$X"|null,"uberTime":"X-X min"|null,"uberCost":"$X-XX"|null}` : ""}}
Use real gym names. Differentiate scores. Respond ONLY with valid JSON array.`;
    try {
      const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 5000, system: sys, messages: [{ role: "user", content: `Best gyms: ${dest}` }] }) });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      setGyms(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch { setError("Couldn't load gyms. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <button onClick={onBack} className="back-btn">← Back</button>
      {!hasSearched && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: "#c8a84b", letterSpacing: 4, textTransform: "uppercase", marginBottom: 10 }}>📍 Local Gym Finder</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(26px,4vw,40px)", fontWeight: 400, color: "#f0ebe0", lineHeight: 1.15, marginBottom: 10 }}>I know where<br />I'm going</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.8 }}>Conference in Vegas. Work trip to London. Vacation in Bali.<br />Get top gyms stack-ranked for your exact trip.</p>
        </div>
      )}
      {hasSearched && !loading && gyms.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 24, color: "#f0ebe0" }}>Best Gyms in {lastDest}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
            {TRIP_TAGS.find(t => t.key === tripType)?.emoji} {TRIP_TAGS.find(t => t.key === tripType)?.label}
            {stayingAt ? ` · proximity to ${stayingAt}` : ""}
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {TRIP_TAGS.map(t => (
          <button key={t.key} onClick={() => setTripType(t.key)} className="pill"
            style={{ background: tripType === t.key ? "rgba(200,168,75,0.14)" : "rgba(255,255,255,0.04)", border: `1px solid ${tripType === t.key ? "rgba(200,168,75,0.38)" : "rgba(255,255,255,0.08)"}`, color: tripType === t.key ? "#c8a84b" : "rgba(255,255,255,0.42)" }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        {[
          { label: "Where are you going?",  placeholder: "Las Vegas, NYC, Tokyo…", icon: "📍", val: destination, set: setDestination },
          { label: "Staying at? (optional)", placeholder: "Hotel name or address…", icon: "🏨", val: stayingAt,   set: setStayingAt   },
        ].map(f => (
          <div key={f.label}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>{f.label}</div>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9, padding: "9px 12px", gap: 7 }}>
              <span style={{ opacity: 0.45 }}>{f.icon}</span>
              <input value={f.val} onChange={e => f.set(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch()} placeholder={f.placeholder}
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#f0ebe0", fontSize: 12, fontFamily: "inherit" }} />
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => doSearch()} disabled={loading || !destination.trim()} className="cta-btn" style={{ opacity: destination.trim() ? 1 : 0.35 }}>
        {loading ? "Scouting gyms…" : "Find My Gym →"}
      </button>
      {!hasSearched && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Quick searches</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FINDER_PROMPTS.map((s, i) => (
              <button key={i} onClick={() => { setDestination(s.label); setTripType(s.trip); setTimeout(() => doSearch(s.label, s.trip), 60); }} className="suggestion-btn">
                {TRIP_TAGS.find(t => t.key === s.trip)?.emoji} {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <div style={{ fontFamily: "var(--serif)", fontSize: 17, color: "rgba(255,255,255,0.38)" }}>Scouting gyms in {destination}…</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: 2, marginTop: 7 }}>SCORING · CHECKING PASSES · RANKING</div>
        </div>
      )}
      {error && <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.16)", borderRadius: 9, padding: "13px 16px", color: "#f87171", fontSize: 12 }}>{error}</div>}
      {!loading && gyms.length > 0 && (
        <ResultsList gyms={gyms} tier={tier} stayingAt={stayingAt} onSignUp={onSignUp} />
      )}
    </div>
  );
}

// ─── Destination Discovery Flow ───────────────────────────────────────────────
function DestDiscovery({ tier, searchCount, onSearch, onBack, onSignUp, onProModal }) {
  const [query,        setQuery]        = useState("");
  const [tripType,     setTripType]     = useState("adventure");
  const [destinations, setDestinations] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [hasSearched,  setHasSearched]  = useState(false);
  const [expanded,     setExpanded]     = useState(null);

  const canSearch = tier === "pro" || searchCount < TIERS[tier].searches;
  const topLocked = TIERS[tier].topLocked;

  async function doSearch(ovQ, ovT) {
    const q = ovQ || query;
    const trip = ovT || tripType;
    if (!q.trim()) return;
    if (!canSearch) { onProModal(); return; }
    setLoading(true); setError(null); setDestinations([]); setHasSearched(true); setExpanded(null);
    onSearch();
    const tripLabel = TRIP_TAGS.find(t => t.key === trip)?.label || trip;
    const sys = `You are IronPassport. Recommend top travel DESTINATIONS ranked by gym quality + destination fit.
TRIP VIBE: ${tripLabel}
SCORING:
${GYM_CRITERIA.map(c => `- ${c.key} (${Math.round(c.weight * 100)}%)`).join("\n")}
Combined = 50% destination + 50% top gym score.
Return JSON array of 6 destinations each with 3 gyms:
{"city":string,"country":string,"region":string,"tagline":string,"destinationScore":0-100,"highlights":[{"icon":emoji,"label":string,"value":string}x4],"gyms":[{"name":string,"type":string,"address":string,"whyRecommended":string,"scores":{"equipment":0-100,"cleanliness":0-100,"amenities":0-100,"staff":0-100,"atmosphere":0-100,"value":0-100,"recovery":0-100,"classes":0-100},"dayPassAvailable":bool,"dayPassPrice":"$XX"|null,"weekPassAvailable":bool,"weekPassPrice":"$XX"|null,"passNotes":string|null,"tags":[3-5]}x3]}
Use real gym names. Differentiate scores. Sort best to worst. Respond ONLY with valid JSON array.`;
    try {
      const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 7000, system: sys, messages: [{ role: "user", content: q }] }) });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setDestinations(parsed.map(d => ({ ...d, topGym: d.gyms?.[0] })));
    } catch { setError("Couldn't load destinations. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <button onClick={onBack} className="back-btn">← Back</button>
      {!hasSearched && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: "#60a5fa", letterSpacing: 4, textTransform: "uppercase", marginBottom: 10 }}>🧭 Destination Discovery</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(26px,4vw,40px)", fontWeight: 400, color: "#f0ebe0", lineHeight: 1.15, marginBottom: 10 }}>Help me find<br />where to go</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.8 }}>Describe your ideal trip. We rank destinations by gym quality + destination fit.</p>
        </div>
      )}
      {hasSearched && !loading && destinations.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 24, color: "#f0ebe0" }}>6 Destinations Ranked</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{TRIP_TAGS.find(t => t.key === tripType)?.emoji} {TRIP_TAGS.find(t => t.key === tripType)?.label} · gym + destination score</div>
        </div>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {TRIP_TAGS.map(t => (
          <button key={t.key} onClick={() => setTripType(t.key)} className="pill"
            style={{ background: tripType === t.key ? "rgba(96,165,250,0.14)" : "rgba(255,255,255,0.04)", border: `1px solid ${tripType === t.key ? "rgba(96,165,250,0.38)" : "rgba(255,255,255,0.08)"}`, color: tripType === t.key ? "#93c5fd" : "rgba(255,255,255,0.42)" }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9, padding: "9px 13px", gap: 8, marginBottom: 10 }}>
        <span style={{ opacity: 0.45 }}>🧭</span>
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch()}
          placeholder="A mountain destination with world-class gyms…"
          style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#f0ebe0", fontSize: 13, fontFamily: "inherit" }} />
      </div>
      <button onClick={() => doSearch()} disabled={loading || !query.trim()} className="cta-btn cta-blue" style={{ opacity: query.trim() ? 1 : 0.35 }}>
        {loading ? "Discovering…" : "Find My Destination →"}
      </button>
      {!hasSearched && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Try asking</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {DISCOVERY_PROMPTS.map((s, i) => (
              <button key={i} onClick={() => { setQuery(s); setTimeout(() => doSearch(s, tripType), 60); }} className="suggestion-btn">{s}</button>
            ))}
          </div>
        </div>
      )}
      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <div style={{ fontFamily: "var(--serif)", fontSize: 17, color: "rgba(255,255,255,0.38)" }}>Ranking destinations by gym quality…</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: 2, marginTop: 7 }}>SCORING · EVALUATING · RANKING</div>
        </div>
      )}
      {error && <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.16)", borderRadius: 9, padding: "13px 16px", color: "#f87171", fontSize: 12 }}>{error}</div>}
      {!loading && destinations.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", padding: "8px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 7, marginBottom: 12 }}>
            {topLocked ? "Sign up free to reveal your #1 destination" : "Expand any destination to see its ranked gyms & pass info"}
          </div>
          <div style={{ display: "grid", gap: 10, marginBottom: 40 }}>
            {destinations.map((dest, i) => {
              const topGymScore = dest.topGym ? calcScore(dest.topGym.scores) : 0;
              const combined = Math.round((dest.destinationScore * 0.5) + (topGymScore * 0.5));

              // Blur #1 for anonymous
              if (i === 0 && topLocked) {
                return (
                  <div key={i} className="fade-up" style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(200,168,75,0.4)" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#FFD700 30%,#e8d494 50%,#FFD700 70%,transparent)", zIndex: 3 }} />
                    <div style={{ filter: "blur(7px)", userSelect: "none", pointerEvents: "none", background: "rgba(200,168,75,0.05)", padding: "16px 18px" }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                        <RankNum n={1} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "#f0ebe0" }}>{dest.city}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{dest.country} · {dest.region}</div>
                          <p style={{ marginTop: 7, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, fontStyle: "italic" }}>{dest.tagline}</p>
                        </div>
                        <div style={{ width: 50, height: 50, background: "rgba(200,168,75,0.12)", borderRadius: "50%" }} />
                      </div>
                    </div>
                    <div onClick={onSignUp} style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,rgba(9,8,7,0.78),rgba(14,10,4,0.88))", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "24px 28px", cursor: "pointer", zIndex: 2 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 24 }}>🏆</span>
                        <div style={{ fontFamily: "var(--serif)", fontSize: 19, color: "#e8d494", lineHeight: 1.2 }}>Your #1 Destination is Hidden</div>
                      </div>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", textAlign: "center", lineHeight: 1.7, maxWidth: 300, margin: 0 }}>
                        Sign up today to see the top-ranked result for your search.<br />
                        <strong style={{ color: "rgba(255,255,255,0.8)" }}>No payment necessary — email only.</strong>
                      </p>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "linear-gradient(135deg,#c8a84b,#9a7228)", borderRadius: 10, padding: "11px 24px", boxShadow: "0 6px 24px rgba(200,168,75,0.4)" }}>
                        <span style={{ fontSize: 13 }}>✉️</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#0a0806", letterSpacing: 1.3, textTransform: "uppercase" }}>Sign Up Free to Reveal</span>
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Takes 10 seconds · No credit card</div>
                    </div>
                  </div>
                );
              }

              const isExp = expanded === i;
              return (
                <div key={i} className="fade-up" style={{ animationDelay: `${i * 65}ms`, border: `1px solid ${isExp ? "rgba(200,168,75,0.28)" : "rgba(255,255,255,0.07)"}`, borderRadius: 16, overflow: "hidden", transition: "border-color 0.25s" }}>
                  <div onClick={() => setExpanded(isExp ? null : i)} className="card-hover" style={{ background: isExp ? "rgba(200,168,75,0.05)" : "rgba(255,255,255,0.025)", padding: "16px 18px", cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <RankNum n={i + 1} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <div>
                          <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "#f0ebe0" }}>{dest.city}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{dest.country} · {dest.region}</div>
                        </div>
                        <Ring value={combined} size={50} color={scoreColor(combined)} />
                      </div>
                      <p style={{ marginTop: 7, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, fontStyle: "italic" }}>{dest.tagline}</p>
                      <div style={{ display: "flex", gap: 7, marginTop: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "3px 9px", color: "rgba(255,255,255,0.45)" }}>🏋️ Gym <span style={{ color: "#c8a84b", marginLeft: 3 }}>{topGymScore}</span></span>
                        <span style={{ fontSize: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "3px 9px", color: "rgba(255,255,255,0.45)" }}>🌍 Dest <span style={{ color: "#c8a84b", marginLeft: 3 }}>{dest.destinationScore}</span></span>
                        {dest.topGym && <span style={{ fontSize: 10, background: "rgba(200,168,75,0.08)", border: "1px solid rgba(200,168,75,0.18)", borderRadius: 6, padding: "3px 9px", color: "#c8a84b" }}>Top: {dest.topGym.name}</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", flexShrink: 0, marginTop: 4, transform: isExp ? "rotate(90deg)" : "none", transition: "transform 0.25s" }}>▶</div>
                  </div>
                  {isExp && dest.gyms?.length > 0 && (
                    <div style={{ background: "rgba(0,0,0,0.28)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "14px 16px" }}>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Top Gyms in {dest.city}</div>
                      <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
                        {dest.gyms.map((gym, j) => {
                          const gs = calcScore(gym.scores);
                          return (
                            <div key={j} style={{ display: "flex", gap: 10, alignItems: "center", background: j === 0 ? "rgba(200,168,75,0.05)" : "rgba(255,255,255,0.02)", border: `1px solid ${j === 0 ? "rgba(200,168,75,0.18)" : "rgba(255,255,255,0.05)"}`, borderRadius: 10, padding: "11px 13px" }}>
                              <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: j === 0 ? "#c8a84b" : "rgba(255,255,255,0.25)", minWidth: 20, textAlign: "center" }}>#{j + 1}</div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontFamily: "var(--serif)", fontSize: 14, color: "#f0ebe0" }}>{gym.name}</span>
                                  {j === 0 && <span style={{ fontSize: 7, background: "#c8a84b", color: "#0a0806", borderRadius: 3, padding: "1px 5px", fontWeight: 700, letterSpacing: 1 }}>BEST</span>}
                                </div>
                                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>{gym.type}</div>
                                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "4px 0 6px", lineHeight: 1.55, fontStyle: "italic" }}>{gym.whyRecommended}</p>
                                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                  {gym.dayPassAvailable && <PassPill type="day" price={gym.dayPassPrice} />}
                                  {gym.weekPassAvailable && <PassPill type="week" price={gym.weekPassPrice} />}
                                </div>
                              </div>
                              <Ring value={gs} size={44} />
                            </div>
                          );
                        })}
                      </div>
                      {dest.highlights?.length > 0 && (
                        <div style={{ paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 9 }}>Why {dest.city}</div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                            {dest.highlights.map((h, k) => (
                              <div key={k} style={{ display: "flex", gap: 7, background: "rgba(255,255,255,0.02)", borderRadius: 7, padding: "7px 9px" }}>
                                <span style={{ fontSize: 13 }}>{h.icon}</span>
                                <div>
                                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{h.label}</div>
                                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.58)", marginTop: 1 }}>{h.value}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [mode,        setMode]        = useState(null);        // null | "finder" | "discovery"
  const [tier,        setTier]        = useState("anonymous"); // anonymous | free | pro
  const [searchCount, setSearchCount] = useState(0);
  const [userEmail,   setUserEmail]   = useState("");
  const [showSignUp,  setShowSignUp]  = useState(false);
  const [showPro,     setShowPro]     = useState(false);

  // Load persisted state
  useEffect(() => {
    try {
      const t  = localStorage.getItem("ip_tier");
      const sc = localStorage.getItem("ip_search_count");
      const em = localStorage.getItem("ip_email");
      if (t)  setTier(t);
      if (sc) setSearchCount(parseInt(sc) || 0);
      if (em) setUserEmail(em);
    } catch {}
  }, []);

  async function incrementSearch() {
    const next = searchCount + 1;
    setSearchCount(next);
    localStorage.setItem("ip_search_count", String(next));
  }

  async function handleFreeSignUp(email) {
    setTier("free"); setUserEmail(email); setSearchCount(0);
    localStorage.setItem("ip_tier", "free");
    localStorage.setItem("ip_email", email);
    localStorage.setItem("ip_search_count", "0");
  }

  async function handleProUpgrade(email) {
    const em = email || userEmail;
    setTier("pro"); setUserEmail(em); setSearchCount(0);
    localStorage.setItem("ip_tier", "pro");
    localStorage.setItem("ip_email", em);
    localStorage.setItem("ip_search_count", "0");
  }

  async function handleSignOut() {
    setTier("anonymous"); setSearchCount(0); setUserEmail(""); setMode(null);
    localStorage.removeItem("ip_tier");
    localStorage.removeItem("ip_search_count");
    localStorage.removeItem("ip_email");
  }

  const searchesLeft = tier === "pro" ? "∞" : Math.max(0, TIERS[tier].searches - searchCount);

  return (
    <div style={{ "--serif": "'Cormorant Garamond','Palatino Linotype',Georgia,serif", minHeight: "100vh", background: "#090807", color: "#f0ebe0", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(200,168,75,0.3);border-radius:2px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .fade-up{animation:fadeUp 0.42s ease both}
        .fade-in{animation:fadeIn 0.35s ease both}
        .spinner{width:36px;height:36px;border:2px solid rgba(200,168,75,0.15);border-top-color:#c8a84b;border-radius:50%;animation:spin 0.85s linear infinite}
        .card-hover{transition:background 0.2s,border-color 0.2s}
        .card-hover:hover{background:rgba(255,255,255,0.04)!important;border-color:rgba(200,168,75,0.28)!important}
        .pill{border-radius:20px;padding:5px 12px;cursor:pointer;font-size:11px;display:inline-flex;align-items:center;gap:5px;transition:all 0.2s;font-family:inherit;border:1px solid transparent}
        .suggestion-btn{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:7px;padding:5px 11px;cursor:pointer;color:rgba(255,255,255,0.38);font-size:11px;transition:all 0.2s;font-family:inherit}
        .suggestion-btn:hover{border-color:rgba(200,168,75,0.28);color:rgba(255,255,255,0.65)}
        .cta-btn{width:100%;background:linear-gradient(135deg,#c8a84b,#9a7228);border:none;border-radius:9px;padding:12px;color:#0a0806;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;transition:opacity 0.2s;margin-bottom:22px;font-family:inherit}
        .cta-btn:hover{opacity:0.88}
        .cta-blue{background:linear-gradient(135deg,#3b82f6,#1d4ed8)!important;color:#fff!important}
        .back-btn{background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.3);font-size:12px;display:flex;align-items:center;gap:6px;padding:0 0 20px;letter-spacing:1px;font-family:inherit}
        .back-btn:hover{color:rgba(255,255,255,0.6)}
        .mode-card{transition:transform 0.25s,box-shadow 0.25s;cursor:pointer}
        .mode-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,0.4)}
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0 20px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => setMode(null)} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <div style={{ width: 26, height: 26, background: "linear-gradient(135deg,#c8a84b,#8a6f28)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✈</div>
          <span style={{ fontFamily: "var(--serif)", fontSize: 19, color: "#f0ebe0" }}>Iron</span>
          <span style={{ fontFamily: "var(--serif)", fontSize: 19, color: "#c8a84b", marginLeft: -2 }}>Passport</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Search count */}
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "3px 10px" }}>
            {tier === "pro" ? "∞ searches" : `${searchesLeft} / ${TIERS[tier].searches} searches`}
          </div>
          {/* Tier badge */}
          {tier === "pro" && <div style={{ fontSize: 10, background: "rgba(200,168,75,0.14)", border: "1px solid rgba(200,168,75,0.3)", borderRadius: 20, padding: "3px 10px", color: "#c8a84b" }}>⭐ Pro</div>}
          {tier === "free" && <div style={{ fontSize: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "3px 10px", color: "rgba(255,255,255,0.5)" }}>Free</div>}
          {/* User / auth */}
          {tier !== "anonymous" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 26, height: 26, background: "linear-gradient(135deg,#c8a84b,#8a6f28)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#0a0806", fontWeight: 700 }}>
                {userEmail ? userEmail[0].toUpperCase() : "?"}
              </div>
              <button onClick={handleSignOut} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: 10, letterSpacing: 1, fontFamily: "inherit" }}>Sign out</button>
            </div>
          ) : (
            <button onClick={() => setShowSignUp(true)} style={{ background: "rgba(200,168,75,0.12)", border: "1px solid rgba(200,168,75,0.28)", borderRadius: 8, padding: "5px 12px", cursor: "pointer", color: "#c8a84b", fontSize: 11, fontWeight: 600, fontFamily: "inherit" }}>Sign up free</button>
          )}
          {tier === "free" && (
            <button onClick={() => setShowPro(true)} style={{ background: "linear-gradient(135deg,#c8a84b,#9a7228)", border: "none", borderRadius: 8, padding: "5px 12px", cursor: "pointer", color: "#0a0806", fontSize: 11, fontWeight: 700, fontFamily: "inherit" }}>Go Pro</button>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 740, margin: "0 auto", padding: "0 20px 80px" }}>

        {/* Home */}
        {mode === null && (
          <div className="fade-in">
            <div style={{ textAlign: "center", padding: "52px 0 40px" }}>
              <div style={{ fontSize: 10, color: "#c8a84b", letterSpacing: 5, textTransform: "uppercase", marginBottom: 14 }}>✦ Never Skip a Workout on the Road ✦</div>
              <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(36px,6vw,60px)", fontWeight: 400, lineHeight: 1.08, marginBottom: 16 }}>
                The world's best gyms,<br /><em style={{ color: "#c8a84b" }}>wherever you travel</em>
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto", lineHeight: 1.85 }}>
                Two ways to find your next great workout — whether you know your destination or you're still deciding.
              </p>
            </div>

            {/* Nudge banner for guests */}
            {tier === "anonymous" && (
              <div style={{ background: "rgba(200,168,75,0.06)", border: "1px solid rgba(200,168,75,0.15)", borderRadius: 12, padding: "14px 18px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#e8d494", marginBottom: 3 }}>You have <strong>1 free search</strong> — no account needed</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>Sign up with your email to unlock your #1 result + get 5 searches/month</div>
                </div>
                <button onClick={() => setShowSignUp(true)} style={{ background: "linear-gradient(135deg,#c8a84b,#9a7228)", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", color: "#0a0806", fontSize: 11, fontWeight: 700, letterSpacing: 1, fontFamily: "inherit", whiteSpace: "nowrap" }}>Sign Up Free →</button>
              </div>
            )}

            {/* Out of searches banner */}
            {tier === "free" && searchCount >= TIERS.free.searches && (
              <div style={{ background: "rgba(200,168,75,0.06)", border: "1px solid rgba(200,168,75,0.15)", borderRadius: 12, padding: "14px 18px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#e8d494", marginBottom: 3 }}>You've used all 5 free searches this month</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>Upgrade to Pro for unlimited access · $5/month</div>
                </div>
                <button onClick={() => setShowPro(true)} style={{ background: "linear-gradient(135deg,#c8a84b,#9a7228)", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", color: "#0a0806", fontSize: 11, fontWeight: 700, letterSpacing: 1, fontFamily: "inherit" }}>Go Pro →</button>
              </div>
            )}

            {/* Two mode cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 40 }}>
              <div className="mode-card" onClick={() => setMode("finder")} style={{ background: "linear-gradient(145deg,rgba(200,168,75,0.08),rgba(255,255,255,0.02))", border: "1px solid rgba(200,168,75,0.22)", borderRadius: 18, padding: "26px 22px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c8a84b,transparent)" }} />
                <div style={{ fontSize: 30, marginBottom: 12 }}>📍</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 21, color: "#f0ebe0", marginBottom: 8, lineHeight: 1.2 }}>I know where<br />I'm going</div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", lineHeight: 1.7, marginBottom: 16 }}>Conference in Vegas. Work trip to NYC. Vacation in Bali. Get the best gyms stack-ranked with passes, scores & hotel travel times.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 18 }}>
                  {["Work trips", "Conferences", "Vacations", "Weekends"].map(t => (<span key={t} style={{ fontSize: 9, background: "rgba(200,168,75,0.1)", border: "1px solid rgba(200,168,75,0.2)", borderRadius: 4, padding: "2px 7px", color: "#c8a84b" }}>{t}</span>))}
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#c8a84b", borderRadius: 8, padding: "8px 16px", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "#0a0806", textTransform: "uppercase" }}>Find My Gym →</div>
              </div>

              <div className="mode-card" onClick={() => setMode("discovery")} style={{ background: "linear-gradient(145deg,rgba(96,165,250,0.07),rgba(255,255,255,0.02))", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 18, padding: "26px 22px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#60a5fa,transparent)" }} />
                <div style={{ fontSize: 30, marginBottom: 12 }}>🧭</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 21, color: "#f0ebe0", marginBottom: 8, lineHeight: 1.2 }}>Help me find<br />where to go</div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", lineHeight: 1.7, marginBottom: 16 }}>Describe your ideal trip — mountains, tropical, European city. We rank destinations by gym quality + destination fit.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 18 }}>
                  {["Mountains", "Tropical", "City breaks", "Wellness"].map(t => (<span key={t} style={{ fontSize: 9, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 4, padding: "2px 7px", color: "#93c5fd" }}>{t}</span>))}
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.35)", borderRadius: 8, padding: "8px 16px", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "#93c5fd", textTransform: "uppercase" }}>Discover Destinations →</div>
              </div>
            </div>

            {/* Plans */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 30 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.22)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>Plans</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {[
                  { icon: "👤", name: "Guest",  price: "Free",   features: ["1 search", "Results #2–6 visible", "#1 result blurred", "No sign-in needed"],              border: "rgba(255,255,255,0.07)", bg: "rgba(255,255,255,0.02)" },
                  { icon: "✉️", name: "Free",   price: "Free",   features: ["5 searches/month", "All 6 results visible", "Day & week pass info", "Email sign-up only"], border: "rgba(255,255,255,0.12)", bg: "rgba(255,255,255,0.03)" },
                  { icon: "⭐", name: "Pro",    price: "$5/mo",  features: ["Unlimited searches", "All 6 results", "Full breakdowns", "Hotel proximity ranking"],       border: "rgba(200,168,75,0.3)",  bg: "rgba(200,168,75,0.06)", highlight: true },
                ].map(p => (
                  <div key={p.name} style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: 12, padding: "16px 14px", position: "relative" }}>
                    {p.highlight && <div style={{ position: "absolute", top: -1, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c8a84b,transparent)" }} />}
                    <div style={{ fontSize: 18, marginBottom: 8 }}>{p.icon}</div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "#f0ebe0", marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: p.highlight ? "#c8a84b" : "rgba(255,255,255,0.4)", marginBottom: 10 }}>{p.price}</div>
                    {p.features.map((f, i) => (
                      <div key={i} style={{ display: "flex", gap: 5, alignItems: "flex-start", marginBottom: 5 }}>
                        <span style={{ color: "#c8a84b", fontSize: 9, marginTop: 2, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === "finder" && (
          <div className="fade-in" style={{ paddingTop: 28 }}>
            <GymFinder
              tier={tier} searchCount={searchCount}
              onSearch={incrementSearch}
              onBack={() => setMode(null)}
              onSignUp={() => setShowSignUp(true)}
              onProModal={() => setShowPro(true)}
            />
          </div>
        )}

        {mode === "discovery" && (
          <div className="fade-in" style={{ paddingTop: 28 }}>
            <DestDiscovery
              tier={tier} searchCount={searchCount}
              onSearch={incrementSearch}
              onBack={() => setMode(null)}
              onSignUp={() => setShowSignUp(true)}
              onProModal={() => setShowPro(true)}
            />
          </div>
        )}
      </div>

      {showSignUp && (
        <SignUpModal
          onClose={() => setShowSignUp(false)}
          onSuccess={email => { handleFreeSignUp(email); setShowSignUp(false); }}
        />
      )}

      {showPro && (
        <ProModal
          onClose={() => setShowPro(false)}
          onUpgrade={email => { handleProUpgrade(email); setShowPro(false); }}
        />
      )}
    </div>
  );
}
