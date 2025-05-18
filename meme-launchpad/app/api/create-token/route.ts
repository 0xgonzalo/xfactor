import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import * as crypto from 'crypto';
import { createPublicClient, http, defineChain, createWalletClient, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

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
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_symbol", "type": "string" }
    ],
    "name": "create",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

// Launchpad contract address
const LAUNCHPAD_ADDRESS = '0x709F1b8Dc07A7D099825360283410999af09CAC9';

// NOTE: In a production environment, this private key would be securely stored
// This is for DEMO purposes only - this account would only be used to relay transactions
// A better approach would be to have users sign and send transactions directly from their wallets
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const symbol = formData.get('symbol') as string;
    const creatorAddress = formData.get('creatorAddress') as string;
    const imageFile = formData.get('image') as File | null;

    // Validate inputs
    if (!name || !symbol) {
      return NextResponse.json(
        { error: 'Name and symbol are required' },
        { status: 400 }
      );
    }

    if (!creatorAddress) {
      return NextResponse.json(
        { error: 'Creator wallet address is required' },
        { status: 400 }
      );
    }

    // Generate a token ID (for demo purposes)
    const tokenId = crypto.randomBytes(6).toString('hex');
    
    // Save the image if provided
    let imagePath = '';
    if (imageFile) {
      try {
        // Make sure the directory exists
        const uploadsDir = join(process.cwd(), 'public', 'token-images');
        
        // Create a unique filename
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${symbol.toLowerCase()}-${tokenId}.${fileExt}`;
        imagePath = `/token-images/${fileName}`;
        
        // Convert the file to buffer
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        
        // Write the file to the uploads directory
        await writeFile(join(uploadsDir, fileName), buffer);
      } catch (error) {
        console.error('Error saving image:', error);
        // Continue without the image if there's an error
        imagePath = '';
      }
    }

    // For a real implementation with viem to create the token on-chain:
    // NOTE: In production, this would use the user's actual wallet
    // This is a simplified example where a backend relayer helps create the token
    
    // Store token details in database or file system
    const tokenData = {
      id: tokenId,
      name,
      symbol,
      creatorAddress, // Store the wallet address
      image: imagePath,
      createdAt: new Date().toISOString(),
      status: 'pending', // pending, confirmed, failed
    };

    // Return success response with the token details
    return NextResponse.json({
      success: true,
      message: 'Token creation initiated',
      token: tokenData,
      note: "Please note: For this demo, tokens won't appear on the tokens page until actually created on the blockchain. To create tokens on the blockchain, you need to call the Launchpad contract's create function directly from your wallet."
    });

  } catch (error: any) {
    console.error('Error creating token:', error);
    return NextResponse.json(
      { error: 'Failed to create token', details: error.message },
      { status: 500 }
    );
  }
} 