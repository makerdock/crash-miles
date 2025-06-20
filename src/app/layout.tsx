import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "../globals.css";

import { Toaster } from "@/components/ui/toaster";
import { GeistSans } from "geist/font/sans";
// import OnchainProviders from "./providers";

const OnchainProviders = dynamic(() => import("../components/WalletProvider"), {
  ssr: false,
});

import dynamic from "next/dynamic";
import { abcGravity } from "../fonts";

export const metadata: Metadata = {
  title: "High Miles PWA",
  description: "Track your air miles with blockchain and zero-knowledge proofs",
  manifest: "/manifest.json",
  icons: {
    icon: "https://devfolio.co/_next/image?url=https%3A%2F%2Fassets.devfolio.co%2Fhackathons%2F8b6f3a95cc864974be1aa571c378cd5b%2Fprojects%2Ff7932edc4a2e426aa83a2c0c62873fbf%2F623eac18-9a2d-4c8c-bf99-69a0bea0dbdc.jpeg&w=768&q=75",
  },
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: "https://devfolio.co/_next/image?url=https%3A%2F%2Fassets.devfolio.co%2Fhackathons%2F8b6f3a95cc864974be1aa571c378cd5b%2Fprojects%2Ff7932edc4a2e426aa83a2c0c62873fbf%2F623eac18-9a2d-4c8c-bf99-69a0bea0dbdc.jpeg&w=768&q=75",
      button: {
        title: "✈️ High Miles",
        action: {
          type: "launch_frame",
          name: "High Miles - Blockchain Air Miles Tracker",
          url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          splashImageUrl: "https://devfolio.co/_next/image?url=https%3A%2F%2Fassets.devfolio.co%2Fhackathons%2F8b6f3a95cc864974be1aa571c378cd5b%2Fprojects%2Ff7932edc4a2e426aa83a2c0c62873fbf%2F623eac18-9a2d-4c8c-bf99-69a0bea0dbdc.jpeg&w=768&q=75",
          splashBackgroundColor: "#1e40af"
        }
      }
    })
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${abcGravity.variable}`}>
        <OnchainProviders>
          <div className="md:hidden visible ">
            {children}
            <Toaster />
          </div>
        </OnchainProviders>
        <div className="fixed top-0 left-0 md:h-[100dvh] w-full bg-white z-50 flex flex-col justify-center px-4 h-0 overflow-hidden">
          <h1 className="text-4xl text-center font-gravity italic max-w-lg mx-auto uppercase">
            Please use mobile to try this out
          </h1>
        </div>
      </body>
    </html>
  );
}
