"use client";
import { useToast } from "@/components/ui/use-toast";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import Image from "next/image";



export default function WalletConnection() {
  // const [address, setAddress] = useState<string | null>(null);
  const { address } = useAccount();
  const { connect, connectors } = useConnect();

  function connectToSmartWallet() {
    const coinbaseWalletConnector = connectors.find(
      (connector) => connector.id === "coinbaseWalletSDK"
    );

    if (coinbaseWalletConnector) {
      connect({ connector: coinbaseWalletConnector });
    }
  }
  return (
    <div>
      {address ? (
        <p className="text-sm text-muted-foreground">Connected: {address}</p>
      ) : (
        <>
          <button
            onClick={connectToSmartWallet}
            className="flex items-center justify-between w-full px-10 py-6 font-sans"
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
        </>
      )}
    </div>
  );
}
