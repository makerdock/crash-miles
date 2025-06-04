'use client';
import { useMemo } from 'react';
import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector';
// import { env } from '~/env';
// import { NEXT_PUBLIC_WC_PROJECT_ID } from './config';

export function useWagmiConfig() {
  return useMemo(() => {
    const wagmiConfig = createConfig({
      chains: [base],
      connectors: [miniAppConnector()],
      ssr: true,
      transports: {
        [base.id]: http(),
      },
    });
    return wagmiConfig;
  }, []);
}
