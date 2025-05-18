// import type { HardhatUserConfig } from "hardhat/config";
// import "@nomicfoundation/hardhat-toolbox-viem";
// import * as dotenv from 'dotenv';
// dotenv.config();

const dotenv = require('dotenv');
dotenv.config();

require("@nomicfoundation/hardhat-toolbox-viem");
require("tsconfig-paths/register"); // Add TypeScript paths support

/** @type {import('hardhat/config').HardhatUserConfig} */
const config = {
  solidity: {
    compilers: [
      { version: "0.8.27" },
      { version: "0.7.6" },
    ],
  },
  typechain: {
    outDir: 'types',
    target: 'ethers-v6',
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    // For local development and compilation (doesn't require a private key)
    hardhat: {
      // Default network for local development
    },
    mantle: {
      url: "https://rpc.mantle.xyz", //mainnet
      accounts: process.env.ACCOUNT_PRIVATE_KEY ? [process.env.ACCOUNT_PRIVATE_KEY] : undefined,
    },
    mantleSepolia: {
      url: "https://rpc.sepolia.mantle.xyz", // Sepolia Testnet
      accounts: process.env.ACCOUNT_PRIVATE_KEY ? [process.env.ACCOUNT_PRIVATE_KEY] : undefined,
    },
  },
  // You can add other configurations here, for example:
  // etherscan: {
  //   apiKey: {
  //     mantle: process.env.MANTLESCAN_API_KEY ?? "",
  //     mantleSepolia: process.env.MANTLESCAN_API_KEY ?? "",
  //   }
  // },
};

module.exports = config; 