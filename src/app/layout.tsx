import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import ConnectWalletPopup from "@/components/ConnectWalletPopup";
import OnchainProviders from "./providers";
import '@rainbow-me/rainbowkit/styles.css';
import "@rainbow-me/rainbowkit/styles.css";
import '@coinbase/onchainkit/styles.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Air Miles PWA",
  description: "Track your air miles with blockchain and zero-knowledge proofs",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <OnchainProviders>
          <div className="min-h-[100dvh] flex flex-col justify-center min-w-full w-full md:hidden visible ">
            {children}
            <Toaster />
          </div>
          <ConnectWalletPopup />
        </OnchainProviders>
        <div className="fixed top-0 left-0 md:h-[100dvh] w-full bg-white z-50 flex flex-col justify-center px-4 h-0 overflow-hidden">
          <h1 className="text-4xl text-center">Please use mobile for best experience</h1>
        </div>
      </body>
    </html>
  );
}
