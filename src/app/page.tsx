"use client";

import BoardingPassScanner from "@/components/BarcodeScanner";
import LoginScreen from "@/components/LoginScreen";
import AwaitingConnection from "@/components/ui/AwaitingConnection";
import WalletConnection from "@/components/WalletConnection";
import Image from "next/image";
import { useAccount } from "wagmi";

export default function Home() {
  const { address, isConnecting } = useAccount();

  return (
    <main>
      {address ? (
        <BoardingPassScanner />
      ) : isConnecting ? (
        <AwaitingConnection />
      ) : (
        <LoginScreen />
      )}
    </main>
  );
}
