'use client';

import { useEffect, useState } from 'react';
import { formatEther } from 'viem';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

// TokenSale type from contract
type TokenSale = {
  token: string;
  name: string;
  creator: string;
  sold: bigint;
  raised: bigint;
  isOpen: boolean;
  imagePath?: string; // Optional image path from our API
};

export default function TokenDetailPage() {
  const params = useParams();
  const tokenId = params.tokenId as string;
  
  const [tokenSale, setTokenSale] = useState<TokenSale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<string>('0.00');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Load token data
  useEffect(() => {
    const fetchToken = async () => {
      setLoading(true);
      try {
        const result = await fetch(`/api/token-sale?index=${tokenId}`);
        
        if (!result.ok) {
          throw new Error('Failed to fetch token data');
        }
        
        const sale = await result.json();
        // Convert the numeric values to bigint
        sale.sold = BigInt(sale.sold.toString());
        sale.raised = BigInt(sale.raised.toString());
        
        setTokenSale(sale);
      } catch (error) {
        console.error('Error fetching token data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (tokenId) {
      fetchToken();
    }
  }, [tokenId]);

  // Buy component handlers
  const handleAmountChange = (value: string) => {
    // Allow only valid number inputs
    if (/^[0-9]*[.]?[0-9]*$/.test(value) || value === '') {
      setAmount(value === '' ? '0.00' : value);
    }
  };

  const handlePresetAmount = (preset: string) => {
    setAmount(preset);
  };

  const handleReset = () => {
    setAmount('0.00');
  };

  const handleMax = () => {
    // Set a dummy max amount - in a real app this would come from wallet balance
    setAmount('1.00');
  };

  const handleLogin = () => {
    // Dummy login function - would connect wallet in real implementation
    setIsLoggedIn(true);
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-500">Error loading token</h1>
        <p>{error}</p>
        <Link
          href="/tokens"
          className="mt-4 rounded-full bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
        >
          Back to Tokens
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Token Details</h1>
          <Link
            href="/tokens"
            className="rounded-full bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
          >
            Back to Tokens
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      ) : tokenSale ? (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="flex-shrink-0">
                {tokenSale.imagePath ? (
                  <div className="w-32 h-32 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Image
                      src={tokenSale.imagePath}
                      alt={`${tokenSale.name} logo`}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-400 text-2xl font-medium">{tokenSale.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                )}
              </div>
              
              <div className="flex-grow text-center sm:text-left">
                <h1 className="text-3xl font-bold mb-2">{tokenSale.name}</h1>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 
                  ${tokenSale.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {tokenSale.isOpen ? 'Sale Open' : 'Sale Closed'}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm text-gray-500 dark:text-gray-400">Token Address</h3>
                    <a 
                      href={`https://explorer.sepolia.mantle.xyz/address/${tokenSale.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {tokenSale.token}
                    </a>
                  </div>
                  
                  <div>
                    <h3 className="text-sm text-gray-500 dark:text-gray-400">Creator</h3>
                    <a 
                      href={`https://explorer.sepolia.mantle.xyz/address/${tokenSale.creator}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {tokenSale.creator}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Sale Statistics</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Tokens Sold</h3>
                  <p className="text-2xl font-bold">{formatEther(tokenSale.sold)}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Raised</h3>
                  <p className="text-2xl font-bold">{formatEther(tokenSale.raised)} ETH</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Token Purchase</h2>
              
              {/* Buy/Sell Toggle */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  className={`py-3 px-4 rounded-lg text-center font-medium text-base transition-colors ${
                    activeTab === 'buy' 
                      ? 'bg-green-500 text-black' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveTab('buy')}
                >
                  buy
                </button>
                <button
                  className={`py-3 px-4 rounded-lg text-center font-medium text-base transition-colors ${
                    activeTab === 'sell' 
                      ? 'bg-green-500 text-black' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveTab('sell')}
                >
                  sell
                </button>
              </div>

              {/* Additional options */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button className="py-2 px-3 rounded-lg bg-gray-800 text-gray-300 text-xs hover:bg-gray-700 transition-colors">
                  switch to Mantle
                </button>
                <button className="py-2 px-3 rounded-lg bg-gray-800 text-gray-300 text-xs hover:bg-gray-700 transition-colors">
                  set max slippage
                </button>
              </div>

              {/* Amount input */}
              <div className="relative mb-4 rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
                <div className="flex items-center justify-between px-4 py-3">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="text-2xl font-medium bg-transparent text-white focus:outline-none w-full"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-white text-lg font-medium">MNT</span>
                    {/* MNT icon placeholder */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">MNT</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick amount buttons */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                <button 
                  onClick={handleReset}
                  className="py-1 px-1 rounded-lg bg-gray-800 text-gray-300 text-xs hover:bg-gray-700 transition-colors"
                >
                  reset
                </button>
                <button 
                  onClick={() => handlePresetAmount('0.1')}
                  className="py-1 px-1 rounded-lg bg-gray-800 text-gray-300 text-xs hover:bg-gray-700 transition-colors"
                >
                  0.1 MNT
                </button>
                <button 
                  onClick={() => handlePresetAmount('0.5')}
                  className="py-1 px-1 rounded-lg bg-gray-800 text-gray-300 text-xs hover:bg-gray-700 transition-colors"
                >
                  0.5 MNT
                </button>
                <button 
                  onClick={() => handlePresetAmount('1')}
                  className="py-1 px-1 rounded-lg bg-gray-800 text-gray-300 text-xs hover:bg-gray-700 transition-colors"
                >
                  1 MNT
                </button>
                <button 
                  onClick={handleMax}
                  className="py-1 px-1 rounded-lg bg-gray-800 text-gray-300 text-xs hover:bg-gray-700 transition-colors"
                >
                  max
                </button>
              </div>

              {/* Action button */}
              {isLoggedIn ? (
                <button 
                  className={`w-full py-3 px-4 rounded-lg text-center font-medium 
                    ${parseFloat(amount) > 0 && activeTab === 'buy'
                      ? 'bg-green-500 text-black hover:bg-green-600' 
                      : parseFloat(amount) > 0 && activeTab === 'sell'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    } transition-colors`}
                  disabled={parseFloat(amount) <= 0}
                >
                  {activeTab === 'buy' ? 'Buy' : 'Sell'} {tokenSale.name} Tokens
                </button>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="w-full py-3 px-4 rounded-lg text-center font-medium bg-green-500 text-black hover:bg-green-600 transition-colors"
                >
                  log in to trade
                </button>
              )}

              {/* Transaction preview (shown only when logged in) */}
              {isLoggedIn && parseFloat(amount) > 0 && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <p className="text-gray-300 text-xs">
                    You will {activeTab === 'buy' ? 'spend' : 'receive'} {amount} MNT
                  </p>
                  <p className="text-gray-300 text-xs">
                    You will {activeTab === 'buy' ? 'receive' : 'spend'} approx. {parseFloat(amount) * 100000} {tokenSale.name} tokens
                  </p>
                  <p className="text-gray-300 text-xs mt-2">
                    Slippage tolerance: 1%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-xl text-gray-600 dark:text-gray-400">Token not found</p>
          <Link
            href="/tokens"
            className="mt-4 rounded-full bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
          >
            Back to Tokens
          </Link>
        </div>
      )}
    </div>
  );
} 