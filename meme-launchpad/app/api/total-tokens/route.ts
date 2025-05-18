import { NextResponse } from 'next/server';
import { createPublicClient, http, defineChain } from 'viem';

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

// Define the ABI for the Launchpad contract (only what we need)
const LAUNCHPAD_ABI = [
  {
    "inputs": [],
    "name": "totalTokens",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Create a Viem public client
const client = createPublicClient({
  chain: mantleSepolia,
  transport: http('https://rpc.sepolia.mantle.xyz'),
});

// Launchpad contract address
const LAUNCHPAD_ADDRESS = '0x709F1b8Dc07A7D099825360283410999af09CAC9';

export async function GET() {
  try {
    // Fetch the total number of tokens
    const totalTokens = await client.readContract({
      address: LAUNCHPAD_ADDRESS as `0x${string}`,
      abi: LAUNCHPAD_ABI,
      functionName: 'totalTokens',
    }) as bigint;
    
    // Return the total number of tokens
    return NextResponse.json({ totalTokens: totalTokens.toString() });
  } catch (error) {
    console.error('Error fetching total tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch total tokens' },
      { status: 500 }
    );
  }
} 