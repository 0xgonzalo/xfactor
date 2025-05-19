"use client";

import { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, WagmiProvider } from "@privy-io/wagmi";
import { mainnet, sepolia } from "viem/chains";
import { http } from "wagmi";
import { defineChain } from "viem";

// Create a new Query Client for TanStack Query
const queryClient = new QueryClient();

// Define Mantle Sepolia chain
const mantleSepolia = defineChain({
  id: 5003,
  name: 'Mantle Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.sepolia.mantle.xyz' },
  },
  testnet: true,
});

// Create a minimal wagmi config
const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, mantleSepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [mantleSepolia.id]: http('https://rpc.sepolia.mantle.xyz'),
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        loginMethods: ["twitter", "wallet", "email"],
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          showWalletUIs: false,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
} 