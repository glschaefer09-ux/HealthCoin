"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const links = [
  { href: "/dapp",     label: "Protocol" },
  { href: "/stake",    label: "Stake" },
  { href: "/bridge",   label: "Bridge" },
  { href: "/provider", label: "Providers" },
  { href: "/ads",      label: "Advertise" },
];

export default function Navbar() {
  const path = usePathname();

  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      height: 60,
      background: "#0f2027",
      borderBottom: "1px solid #1e3a4a",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <Link href="/dapp" style={{ fontWeight: 800, fontSize: 20, color: "#00d4ff", textDecoration: "none", letterSpacing: 1 }}>
        ⚕ HealthCoin
      </Link>
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              color: path === l.href ? "#00d4ff" : "#94a3b8",
              textDecoration: "none",
              fontWeight: path === l.href ? 700 : 400,
              fontSize: 14,
            }}
          >
            {l.label}
          </Link>
        ))}
        <WalletMultiButton style={{
          background: "#00d4ff",
          color: "#0a1628",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 13,
          height: 36,
          padding: "0 16px",
        }} />
      </div>
    </nav>
  );
}
