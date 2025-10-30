import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/landing/BottomNav";
import HandleNav from "@/components/landing/HandleNav"; // ✅ imported top "Pick a Handle" navbar

export default function Home() {
  const [, navigate] = useLocation();
  const { user } = useAuth(); // ✅ get logged in user

  return (
    <div
      style={{
        background: "#fff",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#222",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ---------------- HandleNav (only visible when logged out) ---------------- */}
      {!user && <HandleNav />}

      {/* ---------------- Scrollable Page Content ---------------- */}
      <div
  style={{
    flex: 1,
    overflowY: "auto",
    paddingBottom: "calc(90px + 1rem)", // just enough for BottomNav
    marginBottom: 0,
  }}
>
        {/* ---------------- Banner ---------------- */}
        <div
          style={{
            background: "#fff8e1",
            borderBottom: "2px solid #00cfff",
            padding: "16px 20px",
            marginTop: !user ? "10px" : "0", // spacing if handle nav visible
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 22,
              marginBottom: 4,
              lineHeight: 1.3,
            }}
          >
            Make the switch.{" "}
            <span
              style={{
                color: "#ff9900",
                display: window.innerWidth < 480 ? "block" : "inline",
              }}
            >
              Grow India’s impact.
            </span>
          </div>
          <div style={{ color: "#444", fontSize: 15 }}>
            Start with a nickname—no sign-in needed. Log switches, see news, and
            earn impact points.
          </div>
        </div>

        {/* ---------------- Stats ---------------- */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            padding: "18px 0",
            borderBottom: "3px solid #00cfff",
            background: "#fff",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <StatBox label="Switches Today" value="2,431" />
          <StatBox label="Impact Points" value="18,920" />
          <StatBox label="Active Missions" value="28" />
        </div>

        {/* ---------------- Latest News ---------------- */}
        <SectionTitle title="Latest News" />
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: "0 10px 10px 10px",
            overflowX: "auto",
          }}
        >
          <NewsCard
            tag="Manufacturing"
            title="Electronics assembly ramps up in Chennai corridor"
          />
          <NewsCard tag="AgriBiz" title="Monsoon boosts local tea production" />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "0 18px 10px 0",
          }}
        >
          <button style={navBtn}>{"< Prev"}</button>
          <button style={navBtn}>{"Next >"}</button>
        </div>

        {/* ---------------- Trending Missions ---------------- */}
        <SectionTitle title="Trending Missions" />
        <div style={{ padding: "0 10px" }}>
          <MissionCard
            title="Switch to Indian Tea"
            from="Imported Blend → DesiLeaf"
            points="+15 pts"
          />
          <MissionCard
            title="Choose Local Snacks"
            from="Global Chips → Namkeen Co."
            points="+10 pts"
          />
        </div>

        {/* ---------------- GDPR & Privacy ---------------- */}
        <SectionTitle title="GDPR & Privacy" />
        <div style={cardStyle}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>
            We take privacy seriously.
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 15 }}>
            <li>Minimal data by default (handle, points, actions).</li>
            <li>
              Optional <b>Recovery Key</b> lets you restore your handle on a new
              device.
            </li>
            <li>
              You can request data export or deletion any time from the Privacy
              Center.
            </li>
          </ul>
        </div>

        {/* ---------------- Disclaimers ---------------- */}
        <SectionTitle title="Disclaimers" />
<div
  style={{
    ...cardStyle,
    marginBottom: "1rem", // tighter ending spacing
    paddingBottom: "12px", // balanced bottom padding
  }}
>
  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 15, lineHeight: 1.5 }}>
    <li>
      <b>Anonymous progress is device-bound</b> and may be lost if cookies are
      cleared or you switch devices.
    </li>
    <li>
      Keep your <b>Recovery Key</b> private; we cannot restore it if lost.
    </li>
    <li>
      Rewards, freebies, and prize draws require a registered account.
    </li>
  </ul>
</div>

      </div>

      {/* ---------------- Sticky Bottom Nav ---------------- */}
      <BottomNav />
    </div>
  );
}

// ---------------- Helper Components ----------------
function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 8px #eee",
        padding: "10px 18px",
        textAlign: "center",
        minWidth: 90,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 22 }}>{value}</div>
      <div style={{ color: "#666", fontSize: 15 }}>{label}</div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{ fontWeight: 700, fontSize: 18, margin: "18px 0 8px 12px" }}>
      {title}
    </div>
  );
}

function NewsCard({ tag, title }: { tag: string; title: string }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 8px #eee",
        padding: "14px 16px",
        minWidth: 220,
        flex: 1,
      }}
    >
      <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>{tag}</div>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>
        {title}
      </div>
      <div>
        <span style={emoji}>👍</span>
        <span style={emoji}>👎</span>
        <span style={emoji}>🔗</span>
        <span style={emoji}>💬</span>
      </div>
    </div>
  );
}

function MissionCard({
  title,
  from,
  points,
}: {
  title: string;
  from: string;
  points: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 8px #eee",
        padding: "14px 16px",
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{title}</div>
        <div style={{ color: "#888", fontSize: 14 }}>{from}</div>
        <div style={{ color: "#00cfff", fontWeight: 600, fontSize: 14 }}>
          {points}
        </div>
      </div>
      <button
        style={{
          background: "#00cfff",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "8px 18px",
          fontWeight: 600,
          fontSize: 16,
          cursor: "pointer",
          transition: "0.25s",
        }}
      >
        Support
      </button>
    </div>
  );
}

// ---------------- Common Styles ----------------
const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 8px #eee",
  padding: "14px 16px",
  margin: "0 10px 14px 10px",
};

const navBtn: React.CSSProperties = {
  background: "#f5f5f5",
  border: "none",
  color: "#222",
  fontWeight: 600,
  marginRight: 8,
  cursor: "pointer",
  borderRadius: 8,
  padding: "6px 10px",
  transition: "0.25s",
};

const emoji: React.CSSProperties = {
  marginRight: 10,
  cursor: "pointer",
  transition: "0.2s",
};