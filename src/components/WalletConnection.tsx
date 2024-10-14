"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
  WalletDropdownLink,
} from "@coinbase/onchainkit/wallet";
import {
  Address,
  Avatar,
  EthBalance,
  Identity,
  Name,
} from "@coinbase/onchainkit/identity";
import useWalletPopupStore from "@/stores/useWalletPopupStore";
import Image from "next/image";

export default function WalletConnection() {
  // const [address, setAddress] = useState<string | null>(null);
  const { address } = useAccount();
  const { setOpen: setWalletPopup } = useWalletPopupStore();

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
      {/* {address ? (
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
      )} */}
      {address && (
        <Wallet>
          <ConnectWallet
            withWalletAggregator={true}
            // className={class/Name}
            className="uppercase font-bold p-2 bg-transparent hover:!bg-transparent hover:!underline flex items-center "
          >
            <Name className="text-white text-xl" />
          </ConnectWallet>
          <WalletDropdown className="bg-white z-50 border-2 border-blue-600 rounded-none">
            <Identity
              className="px-4 pt-3 pb-2 bg-white"
              hasCopyAddressOnClick={true}
            >
              <Avatar />
              <Name />
              <Address />
              <EthBalance />
            </Identity>
            <WalletDropdownBasename className="bg-white" />
            <WalletDropdownLink
              className="bg-white"
              icon="wallet"
              href="https://wallet.coinbase.com"
            >
              Go to Wallet Dashboard
            </WalletDropdownLink>
            {/* <WalletDropdownFundLink className="bg-white" /> */}
            <WalletDropdownDisconnect className="bg-white" />
          </WalletDropdown>
        </Wallet>
      )}

      {!address && (
        <button
          className="flex items-center justify-between w-full px-10 py-6 font-sans"
          onClick={() => setWalletPopup(true)}
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
