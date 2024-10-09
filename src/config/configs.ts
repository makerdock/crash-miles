import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

export const coinbasesdk = new CoinbaseWalletSDK({
    appName: "Air Miles PWA",
    appLogoUrl: "",
    appChainIds: [84532],
  });
