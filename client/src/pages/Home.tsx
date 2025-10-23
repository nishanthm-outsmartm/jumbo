import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const [, navigate] = useLocation();
  const { user } = useAuth(); // ✅ get logged in user

  // Responsive logo height and font
  const logoHeight = window.innerWidth < 480 ? 80 : 90;
  const logoFontSize = window.innerWidth < 480 ? 20 : 32;

  return (
    <div
      style={{
        background: "#fff",
        minHeight: "100vh",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#222",
        padding: 0,
        margin: 0,
        boxSizing: "border-box",
      }}
    >
      {/* ---------------- Header (only visible when logged out) ---------------- */}
      {!user && (
        <div
          style={{
            background: "#0b2238",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 20px",
            height: window.innerWidth < 480 ? "60px" : "90px",
            overflow: "hidden",
          }}
        >
          {/* Logo + Text */}
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              display: "flex",
              alignItems: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <img
              src="/logo.png"
              alt="JumboJolt"
              style={{
                height: logoHeight,
                width: "auto",
                borderRadius: 20,
                objectFit: "contain",
                marginRight: -20,
                zIndex: 1,
              }}
            />
            <span
              style={{
                color: "#00cfff",
                fontWeight: 800,
                fontSize: logoFontSize,
                position: "relative",
                zIndex: 2,
              }}
            >
              JumboJolt
            </span>
          </button>

          {/* Pick a Handle */}
          <button
            onClick={() => navigate("/connect")}
            style={{
              background: "#00cfff",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: window.innerWidth < 480 ? "6px 12px" : "8px 18px",
              fontWeight: 600,
              fontSize: window.innerWidth < 480 ? 14 : 16,
              cursor: "pointer",
            }}
          >
            Pick a Handle
          </button>
        </div>
      )}
      {/* Banner */}
      <div
        style={{
          background: "#fff8e1",
          borderBottom: "2px solid #00cfff",
          padding: "16px 20px",
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

      {/* Stats */}
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

      {/* Latest News */}
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
        <button
          style={{
            background: "#f5f5f5",
            border: "none",
            color: "#222",
            fontWeight: 600,
            marginRight: 8,
            cursor: "pointer",
          }}
        >
          &lt; Prev
        </button>
        <button
          style={{
            background: "#f5f5f5",
            border: "none",
            color: "#222",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Next &gt;
        </button>
      </div>

      {/* Trending Missions */}
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

      {/* GDPR & Privacy */}
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

      {/* Disclaimers */}
      <SectionTitle title="Disclaimers" />
      <div style={cardStyle}>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 15 }}>
          <li>
            <b>Anonymous progress is device-bound</b> and may be lost if cookies
            are cleared or you switch devices.
          </li>
          <li>
            Keep your <b>Recovery Key</b> private; we cannot restore it if lost.
          </li>
          <li>
            Rewards, freebies, and prize draws require a registered account.
          </li>
        </ul>
      </div>

      {/* Bottom Navigation */}
      <div
        style={{
          position: "fixed",
    left: 0,
    bottom: 0,
    width: "100%",
    background: "#ffffff",
    borderTop: "3px solid #00cfff",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "12px 0",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
    zIndex: 20,
        }}
      >
        {["Home", "Missions", "News", "Rewards", "Profile"].map((label) => (
    <NavButton key={label} label={label} />
  ))}
      </div>
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
        <span style={{ marginRight: 10, cursor: "pointer" }}>👍</span>
        <span style={{ marginRight: 10, cursor: "pointer" }}>👎</span>
        <span style={{ marginRight: 10, cursor: "pointer" }}>🔗</span>
        <span style={{ cursor: "pointer" }}>💬</span>
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
        }}
      >
        Support
      </button>
    </div>
  );
}
function NavButton({ label }: { label: string }) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  const handleClick = () => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), 300);

    switch (label) {
      case "Home":
        navigate("/Connect");
        break;
      case "Missions":
        navigate("/missions");
        break;
      case "News":
        navigate("/news");
        break;
      case "Rewards":
        navigate("/rewards");
        break;
      case "Profile":
        if (user?.handle) navigate(`/profile/${user.handle}`);
        else navigate("/login");
        break;
      default:
        break;
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "none",
        border: "none",
        color: isHovered || isActive ? "#00cfff" : "#222",
        fontWeight: 600,
        fontSize: 16,
        cursor: "pointer",
        transition: "all 0.25s ease",
        transform: isHovered ? "scale(1.2)" : "scale(1)",
        textShadow: isHovered
          ? "0px 2px 6px rgba(0, 207, 255, 0.5)"
          : "none",
        padding: "6px 10px",
        borderRadius: 8,
      }}
    >
      {label}
    </button>
  );
}


const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 8px #eee",
  padding: "14px 16px",
  margin: "0 10px 14px 10px",
};
