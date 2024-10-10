"use client";

import BoardingPassScanner from "@/components/BarcodeScanner";
import AwaitingConnection from "@/components/ui/AwaitingConnection";
import WalletConnection from "@/components/WalletConnection";

import Image from "next/image";
import { useState } from "react";
import { useAccount } from "wagmi";

export default function Home() {
  const { address, isConnecting } = useAccount();
  return (
    <main className="mx-auto">
      {address ? (
        <BoardingPassScanner />
      ) : isConnecting ? (
        <AwaitingConnection />
      ) : (
        <div className="bg-dark-gray relative text-white min-h-screen flex flex-col items-center max-w-md w-full overflow-hidden mx-auto">
          <div className="relative h-80 w-full">
            <Image
              src="/images/bg.png"
              alt="Retro airline advertisement"
              layout="fill"
              objectFit="cover"
            />
            <Image
              src="/svg/logo.svg"
              width={134}
              height={100}
              alt="Logo"
              className="absolute top-10 left-1/2 -translate-x-1/2"
            />
            <Image
              src="/svg/stamp.svg"
              width={164}
              height={190}
              alt="Stamp"
              className="absolute top-1/2 right-4 z-10"
            />

            <svg
              className="absolute bottom-0 left-0 w-full"
              height="140"
              viewBox="0 0 400 140"
              preserveAspectRatio="none"
            >
              <path
                d="M0,70 C90,200 300,130 400,0 L400,140 L0,140 Z"
                fill="#1A30FF"
              />
            </svg>
          </div>

          <div className="bg-primary-blue w-full p-8 text-center flex-1 flex items-center justify-center flex-col">
            <h2 className="text-5xl font-bold mb-4 italic tracking-tighter font-sans">
              MILES ON
              <br />
              MILES
            </h2>
            <p className="text-xl font-semibold mb-8 font-sans">
              Earn HighMiles for
              <br />
              every trip you take.
            </p>
          </div>
          <div className="bg-dark-gray w-full p-4 pb-2 text-center ">
            <WalletConnection />
            <p className="text-lg text-white whitespace-nowrap font-mono font-medium">
              CASH IN, $CRASH OUT. 747 AIRLINES DESTINATIONS. YOU DON&apos;T
              KNOW WHERE YOU&apos;RE GOING, BUT WE DO. CASH IN, $CRASH OUT. 747
              THE WORLD OVER. AND OV
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
