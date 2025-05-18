import { NextRequest, NextResponse } from 'next/server';
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

// Define TokenSale type to match contract structure
type TokenSale = {
  token: string;
  name: string;
  creator: string;
  sold: bigint;
  raised: bigint;
  isOpen: boolean;
};

// Define the ABI for the Launchpad contract (only what we need)
const LAUNCHPAD_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "_index", "type": "uint256" }],
    "name": "getTokenSale",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "token", "type": "address" },
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "address", "name": "creator", "type": "address" },
          { "internalType": "uint256", "name": "sold", "type": "uint256" },
          { "internalType": "uint256", "name": "raised", "type": "uint256" },
          { "internalType": "bool", "name": "isOpen", "type": "bool" }
        ],
        "internalType": "struct Launchpad.TokenSale",
        "name": "",
        "type": "tuple"
      }
    ],
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

export async function GET(request: NextRequest) {
  try {
    // Get the index parameter from the URL
    const { searchParams } = new URL(request.url);
    const indexParam = searchParams.get('index');
    
    if (!indexParam) {
      return NextResponse.json(
        { error: 'Missing index parameter' },
        { status: 400 }
      );
    }
    
    const index = parseInt(indexParam);
    
    // Fetch the token sale data
    const tokenSale = await client.readContract({
      address: LAUNCHPAD_ADDRESS as `0x${string}`,
      abi: LAUNCHPAD_ABI,
      functionName: 'getTokenSale',
      args: [BigInt(index)],
    }) as TokenSale;
    
    // Convert BigInt values to strings to make them serializable
    const serializedTokenSale = {
      token: tokenSale.token,
      name: tokenSale.name,
      creator: tokenSale.creator,
      sold: tokenSale.sold.toString(),
      raised: tokenSale.raised.toString(),
      isOpen: tokenSale.isOpen
    };
    
    // Return the token sale data with serializable values
    return NextResponse.json(serializedTokenSale);
  } catch (error) {
    console.error('Error fetching token sale:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token sale' },
      { status: 500 }
    );
  }
} 