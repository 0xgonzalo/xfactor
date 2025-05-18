import React from "react";
import Image from "next/image";

export default function Manifesto() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative flex">
        {/* Left side image - no longer sticky */}
        <div className="hidden md:flex flex-col items-center justify-center mr-16 self-center">
          <Image 
            src="/tube1.png" 
            alt="Alchemical Tube 1" 
            width={120} 
            height={200}
            className="rounded-lg"
          />
        </div>
        
        {/* Main content */}
        <div className="prose prose-lg dark:prose-invert mx-auto flex-1">
          {/* Sun image at the top of text */}
          <div className="flex justify-center mb-8">
            <Image 
              src="/sun.png" 
              alt="Alchemical Sun" 
              width={150} 
              height={150}
              className="rounded-lg"
            />
          </div>
          
          <h1 className="text-4xl font-bold text-center mb-8">The Alchemist&apos;s Prophecy</h1>
          <h2 className="text-2xl font-semibold text-center mb-10">The Token Codex</h2>
          
          <p className="mb-6">
            In the twilight of empires and dawn of digital dominions, a new order emerges—etched not in stone, but in code. Thus speaks the Alchemist:
          </p>
          
          <blockquote className="italic text-xl border-l-4 border-blue-500 pl-4 py-2 mb-6">
            &ldquo;When gold no longer glimmers and kings no longer reign, the <strong>true power</strong> shall lie in the hands of the many, transmuted through tokens—crafted not by hands, but by <strong>will</strong>.&rdquo;
          </blockquote>
          
          <p className="mb-6">
            We, the <strong>Keepers of the Craft</strong>, proclaim the rise of <strong>xFACTOR</strong>—a launchpad where influence becomes currency, and ideas take form as spells. Here, the ancient Art of Alchemy meets the boundless ether of Ethereum.
          </p>
          
          <p className="mb-6">
            Each token is a potion—distilled from vision, intention, and resonance with the crowd. Every launch is a ritual. Every community, a circle of sorcerers.
          </p>
          
          <p className="mb-6 text-center font-bold">
            No gatekeepers. No false kings. Only code and conviction.
          </p>
          
          <h3 className="text-xl font-semibold mt-10 mb-4">Through this sacred ledger, we empower:</h3>
          
          <ul className="list-none space-y-4 mb-8">
            <li className="flex items-baseline">
              <span className="text-blue-500 mr-2">▪</span>
              <span><strong>Social Alchemists</strong> to crystallize their voice.</span>
            </li>
            <li className="flex items-baseline">
              <span className="text-blue-500 mr-2">▪</span>
              <span><strong>Asset Mages</strong> to transmute value into fluid, shareable form.</span>
            </li>
            <li className="flex items-baseline">
              <span className="text-blue-500 mr-2">▪</span>
              <span><strong>Collectors of Essence</strong> to wield, support, and exchange magic as they see fit.</span>
            </li>
          </ul>
          
          <p className="mb-6">
            But what makes <strong>xFACTOR</strong> unlike any other is the unknowable spark—the unpredictable pulse—that lives at the heart of each launch. A hidden variable. A cosmic anomaly. The <strong>x-factor</strong> is not a formula, but a phenomenon: a convergence of timing, tribe, and truth. It cannot be predicted, only summoned—and when it appears, it changes everything.
          </p>
          
          <h3 className="text-xl font-semibold mt-10 mb-4 text-center">
            Let it be known: The Era of Passive Belief is over.
          </h3>
          
          <p className="text-center text-2xl font-bold mb-8">
            Now begins the Age of Crafted Reality.
          </p>
          
          <p className="text-center italic mb-12">
            So mote it be.
          </p>
          
          {/* Uroboros image below text */}
          <div className="flex justify-center mt-8 mb-4">
            <Image 
              src="/uroboros.png" 
              alt="Uroboros" 
              width={200} 
              height={200}
              className="rounded-lg"
            />
          </div>
        </div>
        
        {/* Right side image - no longer sticky */}
        <div className="hidden md:flex flex-col items-center justify-center ml-8 self-center">
          <Image 
            src="/tube3.png" 
            alt="Alchemical Tube 3" 
            width={120} 
            height={200}
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
} 