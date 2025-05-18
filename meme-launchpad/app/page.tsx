import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-4">Meme Token Launchpad</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 text-center sm:text-left">
            Create and explore meme tokens on the Mantle blockchain
          </p>
        </div>
        
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/create"
          >
            Create Token
          </Link>
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/tokens"
          >
            View All Tokens
          </Link>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="https://twitter.com/Microprompt_"
            target="_blank"
            rel="noopener noreferrer"
          >
            Create via Twitter
          </a>
        </div>
        
        <div className="mt-10 p-6 border border-gray-200 dark:border-gray-800 rounded-lg max-w-xl">
          <h2 className="text-xl font-bold mb-4">How it works</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Option 1:</strong> Use our <Link href="/create" className="text-blue-600 dark:text-blue-400 hover:underline">web form</Link> to create a token directly.
            </li>
            <li>
              <strong>Option 2:</strong> Mention <span className="font-mono">@Microprompt_</span> on Twitter with the format:
              <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded mt-1 font-mono">
                @Microprompt_ Create TokenName SYMBOL
              </div>
            </li>
            <li>Your token will be created on the Mantle blockchain</li>
            <li>View your created token on this site</li>
          </ol>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://explorer.sepolia.mantle.xyz/address/0x709F1b8Dc07A7D099825360283410999af09CAC9"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Contract
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://twitter.com/Microprompt_"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Twitter Bot
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://mantle.xyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Mantle Network
        </a>
      </footer>
    </div>
  );
}
