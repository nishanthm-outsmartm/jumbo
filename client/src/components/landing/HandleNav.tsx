import React from "react";
import { useLocation } from "wouter";

export default function HandleNav() {
  const [, navigate] = useLocation();

  // Responsive styles
  const isMobile = window.innerWidth < 480;
  const logoHeight = isMobile ? 80 : 90;
  const logoFontSize = isMobile ? 20 : 32;

  return (
    <div
      style={{
        background: "#0b2238",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 20px",
        height: isMobile ? "60px" : "90px",
        overflow: "hidden",
        position: "sticky",
        top: 0,
        zIndex: 40,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
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

      {/* Pick a Handle Button */}
      <button
        onClick={() => navigate("/connect")}
        style={{
          background:
            "linear-gradient(90deg, #00cfff 0%, #00ffdd 100%)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: isMobile ? "6px 12px" : "8px 18px",
          fontWeight: 700,
          fontSize: isMobile ? 14 : 16,
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0,207,255,0.4)",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow =
            "0 6px 14px rgba(0,207,255,0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow =
            "0 4px 10px rgba(0,207,255,0.4)";
        }}
      >
        Pick a Handle
      </button>
    </div>
  );
}
