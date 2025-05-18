"use client";

import { useState, FormEvent, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useSimulateContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";

// Define the ABI for the Launchpad contract (only what we need)
const LAUNCHPAD_ABI = [
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_symbol", type: "string" }
    ],
    name: "create",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
] as const;

// Launchpad contract address
const LAUNCHPAD_ADDRESS = '0x709F1b8Dc07A7D099825360283410999af09CAC9';

// Mantle Sepolia chain ID - keeping as reference
// const MANTLE_SEPOLIA_CHAIN_ID = 5003;

export default function CreateToken() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [creationStep, setCreationStep] = useState<'form' | 'uploadingImage' | 'deployingContract' | 'success'>('form');
  const [simulationArgs, setSimulationArgs] = useState<[string, string] | null>(null);
  
  // Wallet connection
  const { address, isConnected } = useAccount();

  // Use simulate contract
  const { data: simulateData, error: simulateError } = useSimulateContract({
    address: LAUNCHPAD_ADDRESS as `0x${string}`,
    abi: LAUNCHPAD_ABI,
    functionName: 'create',
    args: simulationArgs || undefined,
    value: simulationArgs ? parseEther('0.01') : undefined,
    query: {
      enabled: !!simulationArgs
    }
  });

  // Contract interaction hooks
  const { 
    data: hash,
    isPending: isWritePending,
    writeContract,
    error: writeError 
  } = useWriteContract();

  // Monitor transaction status
  const { 
    isLoading: isTxLoading,
    isSuccess: isTxSuccess
  } = useWaitForTransactionReceipt({
    hash
  });

  // When simulation is ready, submit the transaction
  useEffect(() => {
    if (simulateData && simulationArgs && creationStep === 'deployingContract') {
      writeContract(simulateData.request);
    }
  }, [simulateData, writeContract, simulationArgs, creationStep]);

  // Handle errors from simulation
  useEffect(() => {
    if (simulateError && !error) {
      setError(simulateError.message || "Failed to simulate transaction");
      setCreationStep('form');
      setIsLoading(false);
      setSimulationArgs(null);
    }
  }, [simulateError, error]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImage(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate wallet connection
    if (!isConnected || !address) {
      setError("Please connect your wallet to create a token");
      return;
    }
    
    // Validation
    if (!name || !symbol) {
      setError("Please provide both a name and symbol for your token");
      return;
    }

    if (symbol.length > 10) {
      setError("Symbol should be 10 characters or less");
      return;
    }

    setIsLoading(true);
    setError("");
    setCreationStep('uploadingImage');

    try {
      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append("name", name);
      formData.append("symbol", symbol.toUpperCase());
      formData.append("creatorAddress", address); // Include wallet address
      if (image) {
        formData.append("image", image);
      }

      // Send to your API endpoint to store the image
      const response = await fetch("/api/create-token", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to create token");
      }

      // After successful API response, prepare for contract deployment
      setCreationStep('deployingContract');
      
      // Set args to trigger the simulation
      setSimulationArgs([name, symbol.toUpperCase()]);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      setCreationStep('form');
      setIsLoading(false);
    }
  };

  // Monitor transaction status and update UI accordingly
  useEffect(() => {
    if (isTxSuccess && hash) {
      // Transaction was successful, reset form and show success
      if (creationStep !== 'success') {
        setCreationStep('success');
        setSuccess(true);
        setIsLoading(false);
        setName("");
        setSymbol("");
        setImage(null);
        setImagePreview(null);
        setSimulationArgs(null);
      }
    }
  }, [isTxSuccess, hash, creationStep]);
  
  // If there's a write error, display it
  useEffect(() => {
    if (writeError && !error) {
      const errorMessage = typeof writeError === 'object' && writeError !== null && 'shortMessage' in writeError 
        ? (writeError as { shortMessage?: string }).shortMessage || writeError.message
        : writeError.message;
      setError(errorMessage || "Error writing to contract");
      setCreationStep('form');
      setIsLoading(false);
      setSimulationArgs(null);
    }
  }, [writeError, error]);

  // We'll keep this utility function for possible future use
  // const formatAddress = (address: string) => {
  //   return `${address.slice(0, 6)}...${address.slice(-4)}`;
  // };

  const isPending = isLoading || isWritePending || isTxLoading;

  return (
    <div className="flex flex-col items-center min-h-screen p-8">
      <div className="flex items-center justify-center gap-4 mb-8 mt-8">
        <h1 className="text-3xl font-bold">Craft Your Token</h1>
        <Image 
          src="/alchemy-1.png" 
          alt="Alchemy" 
          width={48} 
          height={48} 
        />
      </div>
      
      {success ? (
        <div className="max-w-md w-full bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <h2 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">
            Token Created Successfully!
          </h2>
          <p className="mb-4">
            Your meme token has been created and deployed on the blockchain.
          </p>
          {hash && (
            <p className="mb-4 text-sm">
              <span className="font-medium">Transaction Hash:</span>{' '}
              <a 
                href={`https://explorer.sepolia.mantle.xyz/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {hash}
              </a>
            </p>
          )}
          <div className="flex gap-4">
            <Link
              href="/tokens"
              className="px-4 py-2 bg-foreground text-background rounded-full hover:bg-foreground/90"
            >
              View All Tokens
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setCreationStep('form');
              }}
              className="px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Create Another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md w-full space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Show creation step */}
          {(creationStep === 'uploadingImage' || creationStep === 'deployingContract') && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 dark:border-blue-300 mr-2"></div>
              <span>
                {creationStep === 'uploadingImage' ? 'Uploading image...' : 'Creating token on blockchain...'}
              </span>
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Token Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="e.g., Awesome Meme Coin"
              required
              disabled={!isConnected || isPending}
            />
          </div>
          
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium mb-2">
              Token Symbol
            </label>
            <input
              id="symbol"
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="e.g., AMC"
              maxLength={10}
              required
              disabled={!isConnected || isPending}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Max 10 characters, will be displayed in uppercase
            </p>
          </div>
          
          <div>
            <label htmlFor="image" className="block text-sm font-medium mb-2">
              Token Image (Optional)
            </label>
            <div className="flex items-center space-x-4">
              <div
                className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center overflow-hidden"
              >
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Token Preview"
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-gray-400">Logo</span>
                )}
              </div>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-medium
                  file:bg-gray-100 file:text-gray-700
                  dark:file:bg-gray-800 dark:file:text-gray-200
                  hover:file:bg-gray-200 dark:hover:file:bg-gray-700"
                disabled={!isConnected || isPending}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Recommended: square image, max 1MB
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Creating a token requires a small fee of 0.01 ETH to be paid from your wallet
            </p>
          </div>
          
          <button
            type="submit"
            disabled={!isConnected || isPending}
            className={`w-full py-3 rounded-full font-medium ${
              !isConnected || isPending
                ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed" 
                : "bg-foreground text-background hover:bg-foreground/90"
            }`}
          >
            {isPending ? "Creating..." : "Create Token"}
          </button>
        </form>
      )}
      
      <div className="mt-8">
        <Link 
          href="/"
          className="text-gray-500 dark:text-gray-400 hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
} 