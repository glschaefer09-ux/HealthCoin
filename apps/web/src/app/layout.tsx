import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import HipaaDisclaimer from "@/components/HipaaDisclaimer";
import { WalletProviders } from "@/components/WalletProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealthCoin — On-Chain Healthcare Rewards",
  description: "HLTH: The Solana token ecosystem for healthcare communities.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProviders>
          <Navbar />
          <main style={{ minHeight: "calc(100vh - 60px)", paddingBottom: 80 }}>
            {children}
          </main>
          <HipaaDisclaimer />
        </WalletProviders>
      </body>
    </html>
  );
}
