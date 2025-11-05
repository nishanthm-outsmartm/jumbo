import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

export default function BottomNav() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [active, setActive] = React.useState("Home");

  const handleClick = (label: string) => {
    setActive(label);
    switch (label) {
      case "Home":
        navigate("/");
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

  const navItems = ["Home", "Missions", "News", "Rewards", "Profile"];

  return (
    <div
      style={{
        position: "fixed", // keep persistent across scroll
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(10px)",
        borderTop: "3px solid #00cfff",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "12px 0 calc(12px + env(safe-area-inset-bottom))",
        boxShadow: "0 -3px 12px rgba(0,0,0,0.08)",
        zIndex: 1000,
        transition: "all 0.3s ease",
      }}
    >
      {navItems.map((label) => (
        <NavButton
          key={label}
          label={label}
          active={active === label}
          onClick={() => handleClick(label)}
        />
      ))}
    </div>
  );
}

// ---------------- NavButton Component ----------------
function NavButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  const [ripple, setRipple] = React.useState(false);

  // Ripple effect trigger
  const triggerRipple = () => {
    setRipple(true);
    setTimeout(() => setRipple(false), 500);
  };

  return (
    <button
      onClick={() => {
        triggerRipple();
        onClick();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: "none",
        border: "none",
        outline: "none",
        color: active ? "#00cfff" : hovered ? "#0099cc" : "#222",
        fontWeight: 600,
        fontSize: 15,
        cursor: "pointer",
        transition: "all 0.25s ease",
        transform:
          active || hovered
            ? "translateY(-3px) scale(1.08)"
            : "translateY(0) scale(1)",
        textShadow:
          active || hovered
            ? "0 0 8px rgba(0,207,255,0.4)"
            : "0 0 0 rgba(0,0,0,0)",
        padding: "6px 12px",
      }}
    >
      {label}
      {/* Ripple pulse circle */}
      {ripple && (
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "6px",
            height: "6px",
            backgroundColor: "#00cfff",
            borderRadius: "50%",
            transform: "translate(-50%, -50%) scale(1)",
            animation: "pulseRipple 0.5s ease-out",
          }}
        />
      )}
      {/* Gradient underline when active */}
      {active && (
        <span
          style={{
            position: "absolute",
            bottom: -2,
            left: "50%",
            transform: "translateX(-50%)",
            width: "40%",
            height: "3px",
            borderRadius: "3px",
            background:
              "linear-gradient(90deg, #00cfff 0%, #00ffd5 100%)",
            boxShadow: "0 0 8px rgba(0,207,255,0.5)",
            animation: "slideUp 0.4s ease-out",
          }}
        ></span>
      )}

      {/* Keyframes for ripple + underline */}
      <style>
        {`
          @keyframes pulseRipple {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 0.6;
            }
            100% {
              transform: translate(-50%, -50%) scale(10);
              opacity: 0;
            }
          }
          @keyframes slideUp {
            0% {
              transform: translateX(-50%) scaleX(0);
            }
            100% {
              transform: translateX(-50%) scaleX(1);
            }
          }
        `}
      </style>
    </button>
  );
}
