"use client";

// ─── Design Tokens (matching Iron Passport brand) ────────────────────────────
const GOLD = "#c8a84b";
const BG = "#090807";
const CARD_BG = "rgba(255,255,255,0.03)";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#f0ebe0";
const DIM = "rgba(255,255,255,0.4)";
const SECTION_GAP = 40;

const SCORE_CRITERIA = [
  { key: "equipment",   label: "Equipment",   weight: "20%", icon: "⊕" },
  { key: "cleanliness", label: "Cleanliness",  weight: "18%", icon: "✦" },
  { key: "amenities",   label: "Amenities",    weight: "14%", icon: "◉" },
  { key: "staff",       label: "Staff",        weight: "12%", icon: "◈" },
  { key: "atmosphere",  label: "Atmosphere",   weight: "11%", icon: "◎" },
  { key: "value",       label: "Value",        weight: "10%", icon: "◇" },
  { key: "recovery",    label: "Recovery",     weight: "8%",  icon: "⊛" },
  { key: "classes",     label: "Classes",      weight: "7%",  icon: "◫" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function Breadcrumbs({ gym }) {
  return (
    <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: DIM, marginBottom: 20 }}>
      <a href="/" style={{ color: GOLD, textDecoration: "none" }}>Home</a>
      <span style={{ margin: "0 8px" }}>/</span>
      <a href={`/city/${gym.citySlug}/`} style={{ color: GOLD, textDecoration: "none" }}>
        Best Gyms in {gym.city}
      </a>
      <span style={{ margin: "0 8px" }}>/</span>
      <span>{gym.name}</span>
    </nav>
  );
}

function ScoreBar({ label, value, icon, weight }) {
  const color = value >= 90 ? "#4ade80" : value >= 75 ? GOLD : value >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: TEXT }}>
          <span style={{ marginRight: 6 }}>{icon}</span>
          {label}
          <span style={{ color: DIM, fontSize: 10, marginLeft: 6 }}>({weight})</span>
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color }}>{value}</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 3, transition: "width 0.8s ease-out" }} />
      </div>
    </div>
  );
}

function OverallScore({ score }) {
  const color = score >= 90 ? "#4ade80" : score >= 75 ? GOLD : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ textAlign: "center", padding: 24 }}>
      <div style={{ fontSize: 48, fontWeight: 700, fontFamily: "var(--serif)", color }}>{score}</div>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: DIM, marginTop: 4 }}>Overall Score</div>
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <h2 style={{
      fontFamily: "var(--serif)",
      fontSize: 22,
      color: TEXT,
      marginBottom: 16,
      paddingBottom: 8,
      borderBottom: `1px solid ${BORDER}`,
    }}>
      {children}
    </h2>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: CARD_BG,
      border: `1px solid ${BORDER}`,
      borderRadius: 12,
      padding: 24,
      ...style,
    }}>
      {children}
    </div>
  );
}

function PassCard({ label, price, notes }) {
  return (
    <div style={{
      background: price ? "rgba(200,168,75,0.06)" : CARD_BG,
      border: `1px solid ${price ? "rgba(200,168,75,0.2)" : BORDER}`,
      borderRadius: 10,
      padding: "18px 20px",
      flex: 1,
      minWidth: 180,
    }}>
      <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: DIM, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontFamily: "var(--serif)", color: price ? GOLD : DIM, marginBottom: 4 }}>
        {price || "Not listed"}
      </div>
      {notes && <div style={{ fontSize: 11, color: DIM, lineHeight: 1.5 }}>{notes}</div>}
    </div>
  );
}

function Tag({ children }) {
  return (
    <span style={{
      display: "inline-block",
      background: "rgba(200,168,75,0.08)",
      border: "1px solid rgba(200,168,75,0.2)",
      borderRadius: 20,
      padding: "4px 12px",
      fontSize: 11,
      color: GOLD,
      marginRight: 6,
      marginBottom: 6,
    }}>
      {children}
    </span>
  );
}

function HighlightCard({ icon, label, value }) {
  return (
    <div style={{
      background: CARD_BG,
      border: `1px solid ${BORDER}`,
      borderRadius: 10,
      padding: "14px 16px",
      flex: "1 1 160px",
      minWidth: 140,
      textAlign: "center",
    }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: DIM, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function ContactRow({ icon, label, value, href }) {
  const content = href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: GOLD, textDecoration: "none" }}>{value}</a>
  ) : (
    <span style={{ color: TEXT }}>{value}</span>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{icon}</span>
      <span style={{ fontSize: 11, color: DIM, width: 80 }}>{label}</span>
      <span style={{ fontSize: 13 }}>{content}</span>
    </div>
  );
}

function GymCardLink({ gym }) {
  return (
    <a
      href={`/gym/${gym.slug}/`}
      style={{
        display: "block",
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: "16px 18px",
        textDecoration: "none",
        transition: "border-color 0.2s",
        flex: "1 1 200px",
        minWidth: 200,
      }}
    >
      <div style={{ fontSize: 14, color: TEXT, fontWeight: 500, marginBottom: 4 }}>{gym.name}</div>
      <div style={{ fontSize: 11, color: DIM, marginBottom: 8 }}>{gym.type} &middot; {gym.neighborhood || gym.city}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: GOLD }}>{gym.dayPassPrice || "Contact for pricing"}</span>
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color: gym.overallScore >= 90 ? "#4ade80" : gym.overallScore >= 75 ? GOLD : "#f59e0b",
        }}>{gym.overallScore}</span>
      </div>
    </a>
  );
}

function PhotoGalleryPlaceholder() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: 8,
    }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px dashed ${BORDER}`,
          borderRadius: 8,
          height: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: DIM,
          fontSize: 11,
        }}>
          Photo {i}
        </div>
      ))}
    </div>
  );
}

function MapPlaceholder({ gym }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px dashed ${BORDER}`,
      borderRadius: 10,
      height: 220,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: DIM,
    }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>&#x1f5fa;&#xfe0f;</div>
      <div style={{ fontSize: 12, marginBottom: 4 }}>Map coming soon</div>
      <div style={{ fontSize: 11 }}>{gym.address}</div>
    </div>
  );
}

function RunningRoutesPlaceholder({ city }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px dashed ${BORDER}`,
      borderRadius: 10,
      padding: 24,
      textAlign: "center",
      color: DIM,
    }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>&#x1f3c3;</div>
      <div style={{ fontSize: 13, marginBottom: 4 }}>Running Routes Near This Gym</div>
      <div style={{ fontSize: 11 }}>Nearby running routes in {city} coming soon.</div>
    </div>
  );
}

function FAQSection({ gym }) {
  const faqs = [];

  if (gym.dayPassPrice) {
    faqs.push({
      q: `How much is a day pass at ${gym.name}?`,
      a: `A day pass at ${gym.name} costs ${gym.dayPassPrice}.${gym.passNotes ? " " + gym.passNotes : ""}`,
    });
  }

  faqs.push({
    q: `What type of gym is ${gym.name}?`,
    a: `${gym.name} is a ${gym.type} located in ${gym.neighborhood ? gym.neighborhood + ", " : ""}${gym.city}, ${gym.country}. ${gym.description.split(".").slice(0, 2).join(".")}.`,
  });

  if (gym.equipmentList && gym.equipmentList.length > 0) {
    faqs.push({
      q: `What equipment does ${gym.name} have?`,
      a: `${gym.name} features: ${gym.equipmentList.join(", ")}.`,
    });
  }

  if (gym.recoveryAmenities && gym.recoveryAmenities.length > 0) {
    faqs.push({
      q: `Does ${gym.name} have recovery amenities?`,
      a: `Yes, ${gym.name} offers: ${gym.recoveryAmenities.join(", ")}.`,
    });
  }

  if (gym.weekPassPrice) {
    faqs.push({
      q: `Does ${gym.name} offer a week pass?`,
      a: `Yes, ${gym.name} offers a week pass for ${gym.weekPassPrice}.`,
    });
  }

  return (
    <div>
      {faqs.map((faq, i) => (
        <details key={i} style={{
          marginBottom: 8,
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          overflow: "hidden",
        }}>
          <summary style={{
            padding: "14px 18px",
            cursor: "pointer",
            fontSize: 14,
            color: TEXT,
            fontWeight: 500,
            listStyle: "none",
          }}>
            {faq.q}
          </summary>
          <div style={{
            padding: "0 18px 14px",
            fontSize: 13,
            color: DIM,
            lineHeight: 1.7,
          }}>
            {faq.a}
          </div>
        </details>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function GymProfileClient({ gym, similarGyms, cityGyms }) {
  const hasContact = gym.contactPhone || gym.contactEmail || gym.contactWebsite || gym.contactInstagram;

  return (
    <div style={{
      "--serif": "'Cormorant Garamond','Palatino Linotype',Georgia,serif",
      minHeight: "100vh",
      background: BG,
      color: TEXT,
      fontFamily: "'DM Sans',system-ui,sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}details summary::-webkit-details-marker{display:none}details summary::marker{display:none}details summary{list-style:none}details[open] summary::after{content:"−"}details summary::after{content:"+";float:right;color:${GOLD};font-size:18px;line-height:1}`}</style>

      {/* ── Header ── */}
      <header style={{ borderBottom: `1px solid ${BORDER}`, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <div style={{ width: 26, height: 26, background: `linear-gradient(135deg,${GOLD},#8a6f28)`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff" }}>&#x2708;</div>
          <span style={{ fontFamily: "var(--serif)", fontSize: 19, color: TEXT }}>Iron</span>
          <span style={{ fontFamily: "var(--serif)", fontSize: 19, color: GOLD, marginLeft: -2 }}>Passport</span>
        </a>
        <a href="/" style={{ fontSize: 12, color: GOLD, textDecoration: "none" }}>Find a Gym</a>
      </header>

      {/* ── Content ── */}
      <main style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 80px" }}>
        <Breadcrumbs gym={gym} />

        {/* Hero section */}
        <section style={{ marginBottom: SECTION_GAP }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            <span style={{
              background: "rgba(200,168,75,0.12)",
              border: "1px solid rgba(200,168,75,0.25)",
              borderRadius: 4,
              padding: "3px 10px",
              fontSize: 10,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: GOLD,
            }}>
              {gym.type}
            </span>
            {gym.neighborhood && (
              <span style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${BORDER}`,
                borderRadius: 4,
                padding: "3px 10px",
                fontSize: 10,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: DIM,
              }}>
                {gym.neighborhood}
              </span>
            )}
          </div>

          <h1 style={{
            fontFamily: "var(--serif)",
            fontSize: 36,
            fontWeight: 700,
            lineHeight: 1.2,
            color: TEXT,
            marginBottom: 8,
          }}>
            {gym.name}
          </h1>

          <p style={{ fontSize: 14, color: DIM, marginBottom: 16 }}>
            {gym.address} &middot; {gym.city}, {gym.country}
          </p>

          {/* Summary description — server-rendered crawlable text */}
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", lineHeight: 1.8, maxWidth: 720 }}>
            {gym.description}
          </p>
        </section>

        {/* Highlights */}
        {gym.highlights && gym.highlights.length > 0 && (
          <section style={{ marginBottom: SECTION_GAP }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {gym.highlights.map((h, i) => (
                <HighlightCard key={i} icon={h.icon} label={h.label} value={h.value} />
              ))}
            </div>
          </section>
        )}

        {/* Tags */}
        {gym.tags && gym.tags.length > 0 && (
          <section style={{ marginBottom: SECTION_GAP }}>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {gym.tags.map((tag, i) => <Tag key={i}>{tag}</Tag>)}
            </div>
          </section>
        )}

        {/* Day Pass & Week Pass */}
        <section style={{ marginBottom: SECTION_GAP }}>
          <SectionHeading>Passes & Pricing</SectionHeading>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <PassCard label="Day Pass" price={gym.dayPassPrice} notes={gym.passNotes} />
            <PassCard label="Week Pass" price={gym.weekPassPrice} />
          </div>
        </section>

        {/* Scores */}
        <section style={{ marginBottom: SECTION_GAP }}>
          <SectionHeading>Iron Passport Score</SectionHeading>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <Card style={{ flex: "0 0 140px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <OverallScore score={gym.overallScore} />
            </Card>
            <Card style={{ flex: 1, minWidth: 280 }}>
              {SCORE_CRITERIA.map((c) => (
                <ScoreBar
                  key={c.key}
                  label={c.label}
                  value={gym.scores[c.key]}
                  icon={c.icon}
                  weight={c.weight}
                />
              ))}
            </Card>
          </div>
        </section>

        {/* Equipment Overview */}
        {gym.equipmentList && gym.equipmentList.length > 0 && (
          <section style={{ marginBottom: SECTION_GAP }}>
            <SectionHeading>Equipment Overview</SectionHeading>
            <Card>
              <ul style={{ listStyle: "none", columns: 2, gap: 24, padding: 0 }}>
                {gym.equipmentList.map((item, i) => (
                  <li key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", padding: "5px 0", breakInside: "avoid" }}>
                    <span style={{ color: GOLD, marginRight: 8 }}>&#x2022;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        )}

        {/* Recovery Amenities */}
        {gym.recoveryAmenities && gym.recoveryAmenities.length > 0 && (
          <section style={{ marginBottom: SECTION_GAP }}>
            <SectionHeading>Recovery Amenities</SectionHeading>
            <Card>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {gym.recoveryAmenities.map((item, i) => (
                  <span key={i} style={{
                    background: "rgba(200,168,75,0.06)",
                    border: "1px solid rgba(200,168,75,0.15)",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: 12,
                    color: TEXT,
                  }}>
                    {item}
                  </span>
                ))}
              </div>
            </Card>
          </section>
        )}

        {/* Photos Gallery Placeholder */}
        <section style={{ marginBottom: SECTION_GAP }}>
          <SectionHeading>Photos</SectionHeading>
          <PhotoGalleryPlaceholder />
        </section>

        {/* Map */}
        <section style={{ marginBottom: SECTION_GAP }}>
          <SectionHeading>Location</SectionHeading>
          <MapPlaceholder gym={gym} />
        </section>

        {/* Hotel Proximity */}
        {(gym.hotelProximity || (gym.nearbyHotels && gym.nearbyHotels.length > 0)) && (
          <section style={{ marginBottom: SECTION_GAP }}>
            <SectionHeading>Nearby Hotels</SectionHeading>
            <Card>
              {gym.hotelProximity && (
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: gym.nearbyHotels ? 16 : 0 }}>
                  {gym.hotelProximity}
                </p>
              )}
              {gym.nearbyHotels && gym.nearbyHotels.length > 0 && (
                <div>
                  {gym.nearbyHotels.map((hotel, i) => (
                    <div key={i} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderTop: i > 0 ? `1px solid ${BORDER}` : "none",
                    }}>
                      <span style={{ fontSize: 13, color: TEXT }}>{hotel.name}</span>
                      <span style={{ fontSize: 11, color: GOLD }}>{hotel.distance}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </section>
        )}

        {/* Running Routes Placeholder */}
        <section style={{ marginBottom: SECTION_GAP }}>
          <SectionHeading>Nearby Running Routes</SectionHeading>
          <RunningRoutesPlaceholder city={gym.city} />
        </section>

        {/* Contact Info */}
        {hasContact && (
          <section style={{ marginBottom: SECTION_GAP }}>
            <SectionHeading>Contact</SectionHeading>
            <Card>
              {gym.contactPhone && <ContactRow icon="&#x1f4de;" label="Phone" value={gym.contactPhone} href={`tel:${gym.contactPhone.replace(/\s/g, "")}`} />}
              {gym.contactEmail && <ContactRow icon="&#x2709;&#xfe0f;" label="Email" value={gym.contactEmail} href={`mailto:${gym.contactEmail}`} />}
              {gym.contactWebsite && <ContactRow icon="&#x1f310;" label="Website" value={gym.contactWebsite.replace(/^https?:\/\//, "")} href={gym.contactWebsite} />}
              {gym.contactInstagram && <ContactRow icon="&#x1f4f7;" label="Instagram" value={gym.contactInstagram} href={`https://instagram.com/${gym.contactInstagram.replace("@", "")}`} />}
            </Card>
          </section>
        )}

        {/* FAQ Section */}
        <section style={{ marginBottom: SECTION_GAP }}>
          <SectionHeading>Frequently Asked Questions</SectionHeading>
          <FAQSection gym={gym} />
        </section>

        {/* Compare with Similar Gyms */}
        {similarGyms.length > 0 && (
          <section style={{ marginBottom: SECTION_GAP }}>
            <SectionHeading>Compare with Similar Gyms</SectionHeading>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {similarGyms.map((sg) => (
                <GymCardLink key={sg.slug} gym={sg} />
              ))}
            </div>
          </section>
        )}

        {/* Best Gyms in City */}
        {cityGyms.length > 1 && (
          <section style={{ marginBottom: SECTION_GAP }}>
            <SectionHeading>Best Gyms in {gym.city}</SectionHeading>
            <p style={{ fontSize: 13, color: DIM, marginBottom: 16, lineHeight: 1.7 }}>
              Explore all {cityGyms.length} gyms we&apos;ve reviewed in {gym.city}. Find the best day pass deals,
              compare equipment scores, and pick the perfect gym for your trip.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              {cityGyms.filter(g => g.slug !== gym.slug).map((cg) => (
                <GymCardLink key={cg.slug} gym={cg} />
              ))}
            </div>
            <a
              href={`/city/${gym.citySlug}/`}
              style={{
                display: "inline-block",
                background: "rgba(200,168,75,0.1)",
                border: `1px solid rgba(200,168,75,0.3)`,
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: 13,
                color: GOLD,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              View All Gyms in {gym.city} &#x2192;
            </a>
          </section>
        )}

        {/* Back to Search */}
        <section style={{ textAlign: "center", padding: "40px 0 0" }}>
          <a
            href="/"
            style={{
              display: "inline-block",
              background: `linear-gradient(135deg, ${GOLD}, #8a6f28)`,
              borderRadius: 8,
              padding: "12px 32px",
              fontSize: 14,
              color: "#fff",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Find More Gyms on Iron Passport
          </a>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: `1px solid ${BORDER}`,
        padding: "24px",
        textAlign: "center",
        fontSize: 11,
        color: DIM,
      }}>
        <p>&copy; {new Date().getFullYear()} Iron Passport. All rights reserved.</p>
        <p style={{ marginTop: 4 }}>
          Gym information is updated regularly. Prices and availability may change.
          Last updated: {gym.updatedAt || "Recently"}.
        </p>
      </footer>
    </div>
  );
}
