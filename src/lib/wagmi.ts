import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
export function useWagmiConfig() {
  if (!projectId) {
    const providerErrMessage =
      "To connect to all Wallets you need to provide a WC_PROJECT_ID env variable";

    throw new Error(providerErrMessage);
  }

  const connectors = connectorsForWallets(
    [
      {
        groupName: "Recommended Wallet",
        wallets: [coinbaseWallet],
      },
      {
        groupName: "Other Wallets",
        wallets: [rainbowWallet, metaMaskWallet],
      },
    ],
    {
      appName: "onchainkit",
      projectId,
    }
  );

  const wagmiConfig = createConfig({
    chains: [baseSepolia],
    // turn off injected provider discovery
    multiInjectedProviderDiscovery: false,
    connectors,
    ssr: true,
    transports: {
      [baseSepolia.id]: http(),
    },
  });

  return wagmiConfig;
}

export const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended Wallet",
      wallets: [coinbaseWallet],
    },
    {
      groupName: "Other Wallets",
      wallets: [rainbowWallet, metaMaskWallet],
    },
  ],
  {
    appName: "onchainkit",
    projectId: projectId as string,
  }
);
