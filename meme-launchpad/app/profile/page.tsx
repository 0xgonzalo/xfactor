"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { usePrivy, useWallets } from "@privy-io/react-auth";

export default function ProfilePage() {
  const { address } = useAccount();
  const { user, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const [activeTab, setActiveTab] = useState<"balances" | "coinsCreated">("balances");
  const [userAddress, setUserAddress] = useState<string | undefined>();

  // Get the connected address from either wagmi or privy
  useEffect(() => {
    if (address) {
      setUserAddress(address);
    } else if (wallets && wallets.length > 0) {
      setUserAddress(wallets[0].address);
    } else if (user?.wallet?.address) {
      setUserAddress(user.wallet.address);
    }
  }, [address, wallets, user]);

  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address?.slice(0, 6)}...${address?.slice(-4)}`;
  };

  // If not authenticated or still loading, show login prompt
  if (!ready) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!authenticated) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please connect your wallet to view your profile</h1>
        <p>Connect your wallet to view your profile information.</p>
      </div>
    );
  }

  // Username from user data or a placeholder
  const username = user?.twitter?.username || user?.email?.address || "anon_user";
  
  return (
    <div className="min-h-screen text-white">
      {/* Back button */}
      <div className="p-4">
        <Link href="/" className="text-white hover:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
      </div>
      
      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto px-4">
        {/* Left Column - Profile information */}
        <div className="flex flex-col">
          {/* Profile header */}
          <div className="flex flex-col items-center p-4">
            <div className="w-24 h-24 mb-4 relative rounded-full overflow-hidden border-2 border-gray-700">
              <Image 
                src="/default-avatar.png" 
                alt="Profile" 
                width={100} 
                height={100}
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/100";
                }}
              />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">{username}</h1>
            
            {userAddress && (
              <div className="bg-gray-800 px-3 py-1 rounded-md text-gray-300 flex items-center mb-4">
                <span>{formatAddress(userAddress)}</span>
                <button 
                  className="ml-2 text-gray-400 hover:text-gray-200"
                  onClick={() => navigator.clipboard.writeText(userAddress)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                  </svg>
                </button>
                <Link href={`https://etherscan.io/address/${userAddress}`} target="_blank" className="ml-2 text-gray-400 hover:text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            )}
            
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
              edit
            </button>
          </div>
          
          {/* User stats */}
          <div className="flex justify-center space-x-12 mt-4 p-4 text-center">
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-gray-400">followers</p>
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-gray-400">following</p>
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-gray-400">created coins</p>
            </div>
          </div>
          
          {/* Bio/description */}
          <div className="px-4 py-2 text-center mt-4">
            <p>yup</p>
          </div>
        </div>
        
        {/* Right Column - Tabs and content */}
        <div className="flex flex-col">
          {/* Tabs */}
          <div className="border-b border-gray-700">
            <div className="flex">
              <button
                className={`px-6 py-4 ${activeTab === "balances" ? "border-b-2 border-green-500 font-bold" : "text-gray-400"}`}
                onClick={() => setActiveTab("balances")}
              >
                balances
              </button>
              <button
                className={`px-6 py-4 ${activeTab === "coinsCreated" ? "border-b-2 border-green-500 font-bold" : "text-gray-400"}`}
                onClick={() => setActiveTab("coinsCreated")}
              >
                coins created
              </button>
            </div>
          </div>
          
          {/* Tab content */}
          <div className="p-4">
            {activeTab === "balances" && (
              <div>
                <div className="flex justify-between text-gray-400 text-sm mb-4 px-2">
                  <span>coins</span>
                  <span>mcap</span>
                  <span>value</span>
                </div>
                
                {/* Example balance entry */}
                <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-700 rounded-full mr-3 flex-shrink-0 overflow-hidden">
                      {/* Mantle logo */}
                      <svg viewBox="0 0 128 128" className="w-full h-full">
                        <linearGradient id="a" gradientUnits="userSpaceOnUse" x1="4" y1="44" x2="124" y2="84">
                          <stop offset="0" stopColor="#6A58F7"/>
                          <stop offset="1" stopColor="#9B4CFF"/>
                        </linearGradient>
                        <circle cx="64" cy="64" r="60" fill="url(#a)"/>
                        <path d="M104 72H40a4 4 0 00-4 4v8c0 2.2 1.8 4 4 4h64a4 4 0 004-4v-8c0-2.2-1.8-4-4-4zm0-32H40a4 4 0 00-4 4v8c0 2.2 1.8 4 4 4h64a4 4 0 004-4v-8c0-2.2-1.8-4-4-4z" fill="#fff" opacity=".8"/>
                        <path d="M104 72H24a4 4 0 00-4 4v8c0 2.2 1.8 4 4 4h80a4 4 0 004-4v-8c0-2.2-1.8-4-4-4z" fill="#fff"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Mantle balance</p>
                      <p className="text-gray-400 text-sm">0.00 Mantle</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$0</p>
                  </div>
                </div>
                
                {/* More balances would go here */}
                {userAddress && wallets.length === 0 && (
                  <div className="text-center text-gray-400 mt-8">
                    <p>No balances to display</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "coinsCreated" && (
              <div className="text-center text-gray-400 mt-8">
                <p>You haven't created any coins yet</p>
                <Link href="/create" className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg inline-block">
                  Create a coin
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 