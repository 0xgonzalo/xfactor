"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";

export default function Navbar() {
  // Privy hooks
  const { login, logout, authenticated, ready, user, connectWallet } = usePrivy();

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get display address from Privy user
  const getDisplayAddress = () => {
    if (user?.wallet?.address) {
      return formatAddress(user.wallet.address);
    }
    
    if (user?.linkedAccounts?.length > 0) {
      // Check for any linked wallet accounts
      const walletAccount = user.linkedAccounts.find(
        account => account.type === "wallet"
      );
      
      if (walletAccount?.address) {
        return formatAddress(walletAccount.address);
      }
    }
    
    return "";
  };

  // Open Privy modal
  const handleConnectWallet = () => {
    login();
  };
  
  const handleDisconnect = () => {
    logout();
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/book.png" 
                alt="Book" 
                width={32} 
                height={32} 
                className="mr-2"
              />
              <span className="text-xl font-bold text-deep-purple">
                xFACTOR
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link 
                href="/"
                className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Home
              </Link>
              <Link 
                href="/tokens"
                className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Tokens
              </Link>
              <Link 
                href="/create"
                className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Create
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {authenticated ? (
              <div className="relative">
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 rounded-lg flex items-center space-x-2"
                >
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>{getDisplayAddress()}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 