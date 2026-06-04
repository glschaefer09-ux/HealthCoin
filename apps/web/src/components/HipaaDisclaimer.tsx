"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "hipaa_dismissed";

export default function HipaaDisclaimer() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#0f2027",
      borderTop: "2px solid #00d4ff",
      color: "#cdd6f4",
      padding: "12px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      zIndex: 9999,
      fontSize: 13,
    }}>
      <span>
        <strong style={{ color: "#00d4ff" }}>HealthCoin is a community rewards protocol.</strong>{" "}
        It is not a healthcare provider, does not store medical records, and is not HIPAA-covered.
        Never share protected health information on this platform.
      </span>
      <button
        onClick={dismiss}
        style={{
          background: "#00d4ff",
          color: "#0f2027",
          border: "none",
          borderRadius: 6,
          padding: "6px 16px",
          cursor: "pointer",
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        Got it
      </button>
    </div>
  );
}
