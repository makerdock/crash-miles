"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function WalletConnection() {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    if (connectors[0]) {
      connect({ connector: connectors[0] });
    }
  };

  return (
    <div>
      {address ? (
        <button
          className="flex items-center justify-between w-full px-10 py-6 font-sans"
          onClick={() => disconnect()}
        >
          Disconnect
        </button>
      ) : (
        <button
          className="flex items-center justify-between w-full px-10 py-6 font-sans"
          onClick={handleConnect}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
