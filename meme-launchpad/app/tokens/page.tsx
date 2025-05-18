'use client';

import { useEffect, useState } from 'react';
import { formatEther } from 'viem';
import Link from 'next/link';
import Image from 'next/image';

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

export default function TokensPage() {
  const [tokenSales, setTokenSales] = useState<TokenSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Load token data
  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      try {
        // First fetch the total token count
        const totalRes = await fetch('/api/total-tokens');
        
        if (!totalRes.ok) {
          throw new Error('Failed to fetch total tokens');
        }
        
        const totalData = await totalRes.json();
        setTotalTokens(Number(totalData.totalTokens));
        
        // Then fetch token sales
        const sales: TokenSale[] = [];
        
        for (let i = 0; i < Number(totalData.totalTokens); i++) {
          const result = await fetch(`/api/token-sale?index=${i}`);
          if (result.ok) {
            const sale = await result.json();
            // Convert the numeric values to bigint
            sale.sold = BigInt(sale.sold.toString());
            sale.raised = BigInt(sale.raised.toString());
            sales.push(sale);
          }
        }
        
        setTokenSales(sales);
      } catch (error) {
        console.error('Error fetching token data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-500">Error loading tokens</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Meme Token Launchpad</h1>
          <Link
            href="/"
            className="rounded-full bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
          >
            Home
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Explore all meme tokens created on Mantle
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total tokens: {totalTokens}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokenSales.map((sale, index) => (
              <div
                key={sale.token}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-shrink-0">
                    {sale.imagePath ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                        <Image
                          src={sale.imagePath}
                          alt={`${sale.name} logo`}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-400 text-xs font-medium">{sale.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{sale.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">Token #{index + 1}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Address:</span>{' '}
                    <a 
                      href={`https://explorer.sepolia.mantle.xyz/address/${sale.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {formatAddress(sale.token)}
                    </a>
                  </p>
                  <p>
                    <span className="font-medium">Creator:</span>{' '}
                    <a 
                      href={`https://explorer.sepolia.mantle.xyz/address/${sale.creator}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {formatAddress(sale.creator)}
                    </a>
                  </p>
                  <p>
                    <span className="font-medium">Tokens Sold:</span>{' '}
                    {formatEther(sale.sold)} 
                  </p>
                  <p>
                    <span className="font-medium">Raised:</span>{' '}
                    {formatEther(sale.raised)} ETH
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`${sale.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                      {sale.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </p>
                </div>
              </div>
            ))}

            {tokenSales.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-gray-600 dark:text-gray-400">No tokens found</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 