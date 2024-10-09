"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { BlackCreateWalletButton } from "./CreateWalletBtn";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { log } from "console";
import CoinbaseButton from "./CoinbaseConnectButton";

interface Props {
  onConnected: () => void;
}

export default function WalletConnection({ onConnected }: Props) {
  // const [address, setAddress] = useState<string | null>(null);
  const { address } = useAccount();
  const { toast } = useToast();
  const { connect, connectors } = useConnect();
  // const { data } = useBalance({
  //   address,
  // });
  const { disconnect } = useDisconnect();

  // const connectWallet = async () => {
  //   if (typeof (window as any).ethereum !== "undefined") {
  //     try {
  //       await (window as any).ethereum.request({
  //         method: "eth_requestAccounts",
  //       });
  //       const provider = new ethers.providers.Web3Provider(
  //         (window as any).ethereum
  //       );
  //       const signer = provider.getSigner();
  //       const address = await signer.getAddress();
  //       setAddress(address);
  //       onConnected();
  //       toast({
  //         title: "Wallet Connected",
  //         description: `Connected to ${address}`,
  //       });
  //     } catch (err) {
  //       console.error("Failed to connect wallet:", err);
  //       toast({
  //         title: "Connection Failed",
  //         description: "Failed to connect wallet. Please try again.",
  //         variant: "destructive",
  //       });
  //     }
  //   } else {
  //     toast({
  //       title: "MetaMask Required",
  //       description: "Please install MetaMask to use this app.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  return (
    <div>
      {address ? (
        <div className="w-full flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground">Connected: {address}</p>
          <button
            onClick={() => disconnect()}
            type="button"
            className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none dark:focus:ring-red-800"
          >
            Disconenct
          </button>
        </div>
      ) : (
        <div className="w-full flex items-center justify-center flex-col gap-4">
          {/* <BlackCreateWalletButton /> */}
          {/* {!address && (
            <button
              onClick={() => connect({ connector: coinbaseWallet() })}
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              Connect Wallet
            </button>
          )}{" "} */}
          {connectors
            .filter((connector) => connector.name === "Coinbase Wallet")
            .map((connector, index) => (
              <CoinbaseButton key={index} />
            ))}
        </div>
      )}
    </div>
  );
}
