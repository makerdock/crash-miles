"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

interface Props {
  onConnecting: () => void;
  onConnected: () => void;
}

export default function WalletConnection({ onConnecting, onConnected }: Props) {
  const [address, setAddress] = useState<string | null>(null);
  const { toast } = useToast();

  const connectWallet = async () => {
    if (typeof (window as any).ethereum !== "undefined") {
      try {
        onConnecting();
        await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        const provider = new ethers.providers.Web3Provider(
          (window as any).ethereum
        );
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAddress(address);
        onConnected();
        toast({
          title: "Wallet Connected",
          description: `Connected to ${address}`,
        });
      } catch (err) {
        console.error("Failed to connect wallet:", err);
        toast({
          title: "Connection Failed",
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to use this app.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {address ? (
        <p className="text-sm text-muted-foreground">Connected: {address}</p>
      ) : (
        <button
          className="flex items-center justify-between w-full px-10 py-6 font-sans"
          onClick={connectWallet}
        >
          <p className="text-left text-2xl font-semibold">
            Connect Wallet
            <br /> to begin
          </p>
          <Image
            src="/svg/airplane.svg"
            width={88}
            height={88}
            alt="airplane icon"
          />
        </button>
      )}
    </div>
  );
}
