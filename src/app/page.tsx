"use client";

import BoardingPassScanner from "@/components/BarcodeScanner";
import LoginScreen from "@/components/LoginScreen";
import AwaitingConnection from "@/components/ui/AwaitingConnection";
import { useAccount } from "wagmi";

export default function Home() {
  // const { address,isConnecting } = useAccount();
  const address = undefined
  const isConnecting = true

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
