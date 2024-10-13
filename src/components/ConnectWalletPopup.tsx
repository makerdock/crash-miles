'use client'
import React, { useEffect } from "react";
import useWalletPopupStore from "@/stores/useWalletPopupStore";
import { Popup } from "./Popup";
import WalletWrapper from "./WalletWrapper";
import { useAccount } from "wagmi";
import { twMerge } from "tailwind-merge";

const ConnectWalletPopup = () => {
  const { isOpen, setOpen } = useWalletPopupStore();
  const { address } = useAccount();

  useEffect(() => {
    if (address) setOpen(false);
  }, [address]);

  return (
    <Popup isOpen={isOpen} onClose={() => setOpen(false)} title="">
      <div className="w-full flex flex-col items-stretch gap-4">
        <WalletWrapper
          className={twMerge(
            "inline-flex items-center justify-center py-4 whitespace-nowrap text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase  cursor-pointer rounded-none w-full max-w-full min-w-full flex-1",
            "bg-blue-600 text-white hover:bg-blue-600/90"
          )}
          text="I have a wallet"
          withWalletAggregator={true}
        />

        <WalletWrapper
          // className="ockConnectWallet_Container min-w-[90px] shrink bg-slate-200 text-[#030712] hover:bg-slate-300"
          className={twMerge(
            "inline-flex items-center justify-center py-4 whitespace-nowrap text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase  cursor-pointer rounded-none w-full max-w-full min-w-full flex-1",
            "bg-white border-2 border-blue-600 text-blue-600 hover:text-blue-600/90  hover:bg-white hover:text-blue-600 [&_span]:!text-blue-600"
          )}
          text="Create a smart wallet"
        />
      </div>
    </Popup>
  );
};

export default ConnectWalletPopup;
