"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";

export default function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const connectMetaMask = () => {
    connect({ connector: metaMask() });
    setIsModalOpen(false);
  };

  const connectPhantom = () => {
    // For demo purposes - would need Solana chain integration
    alert("Phantom wallet integration coming soon!");
    setIsModalOpen(false);
  };

  const connectTwitter = () => {
    // Would typically redirect to OAuth flow
    alert("Twitter login integration coming soon!");
    setIsModalOpen(false);
  };

  return (
    <>
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
              {isConnected ? (
                <div className="relative">
                  <button
                    onClick={() => setIsModalOpen(!isModalOpen)}
                    className="px-4 py-2 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 rounded-lg flex items-center space-x-2"
                  >
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span>{formatAddress(address)}</span>
                  </button>
                  {isModalOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-200 dark:border-gray-700 z-50">
                      <button
                        onClick={() => disconnect()}
                        className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Connection Modal */}
      {isModalOpen && !isConnected && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Connect Wallet
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <button
                onClick={connectMetaMask}
                className="w-full flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3 flex-shrink-0">
                    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M36.0767 1.5L22.1708 13.14L24.9075 6.31583L36.0767 1.5Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.92332 1.5L17.6933 13.2733L15.0925 6.31583L3.92332 1.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M30.8599 28.5992L26.9599 35.0325L35.1967 37.5025L37.6233 28.7325L30.8599 28.5992Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2.39844 28.7325L4.80344 37.5025L13.0234 35.0325L9.14011 28.5992L2.39844 28.7325Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12.5599 17.6125L10.2266 21.31L18.3599 21.72L18.0766 12.915L12.5599 17.6125Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M27.4467 17.6127L21.82 12.8152L21.6667 21.7202L29.7733 21.3102L27.4467 17.6127Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13.0234 35.0325L17.8867 32.385L13.72 28.7992L13.0234 35.0325Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22.1133 32.385L26.9599 35.0325L26.28 28.7992L22.1133 32.385Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">MetaMask</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                onClick={connectPhantom}
                className="w-full flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3 flex-shrink-0">
                    <svg width="40" height="40" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="64" cy="64" r="64" fill="url(#paint0_linear)"/>
                      <path d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7726 23C33.7716 23 15 41.4556 15 64.1049C15 86.7542 33.7716 105 56.7726 105H110.584V64.9142Z" fill="white"/>
                      <path d="M98.8526 69.7779C98.8526 67.7501 100.55 66.1252 102.628 66.1252C104.707 66.1252 106.404 67.7501 106.404 69.7779C106.404 71.8057 104.707 73.4306 102.628 73.4306C100.55 73.4306 98.8526 71.8057 98.8526 69.7779Z" fill="url(#paint1_linear)"/>
                      <path d="M15.4255 64.1051C15.4255 41.7652 33.9178 23.4232 56.7718 23.4232C79.6258 23.4232 98.1182 41.7652 98.1182 64.1051H108.253C108.253 36.2656 85.6123 14 56.7718 14C27.9313 14 5.29102 36.2656 5.29102 64.1051C5.29102 91.9446 27.9313 114.21 56.7718 114.21V104.787C33.9178 104.787 15.4255 86.445 15.4255 64.1051Z" fill="url(#paint2_linear)"/>
                      <defs>
                        <linearGradient id="paint0_linear" x1="64" y1="0" x2="64" y2="128" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#534BB1"/>
                          <stop offset="1" stopColor="#551BF9"/>
                        </linearGradient>
                        <linearGradient id="paint1_linear" x1="102.628" y1="66.1252" x2="102.628" y2="73.4306" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#534BB1"/>
                          <stop offset="1" stopColor="#551BF9"/>
                        </linearGradient>
                        <linearGradient id="paint2_linear" x1="56.7718" y1="14" x2="56.7718" y2="114.21" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#534BB1"/>
                          <stop offset="1" stopColor="#551BF9"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">Phantom</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                onClick={connectTwitter}
                className="w-full flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3 flex-shrink-0">
                    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.5332 8.33203H27.3236L19.2261 17.5387L28.8214 31.6654H21.4122L15.5985 23.0764L8.90181 31.6654H5.10731L13.7689 21.7736L4.58398 8.33203H12.1582L17.4147 16.198L23.5332 8.33203ZM22.3908 28.8312H24.3486L11.0995 10.9862H8.99848L22.3908 28.8312Z" fill="#1DA1F2"/>
                    </svg>
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">Twitter</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              By connecting your wallet, you agree to our Terms of Service and Privacy Policy
            </div>
          </div>
        </div>
      )}
    </>
  );
} 