'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { useWagmiConfig } from '@/lib/wagmi';
import { sdk } from '@farcaster/frame-sdk';

type Props = { children: ReactNode };

const queryClient = new QueryClient();

function OnchainProviders({ children }: Props) {
    const wagmiConfig = useWagmiConfig();

    useEffect(() => {
        sdk.actions.ready();
    }, []);

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}

export default OnchainProviders;
