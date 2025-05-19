# xFACTOR Launchpad

xFACTOR is a social token launchpad on Mantle Sepolia designed to combine the ease of intuitive token creation with social dynamics that enable creators and their supporters to benefit mutually from token growth. You can create a token from the form inside the Web App or create a twitter post tagging @microprompt and saying "create" "token_name" "symbol". The bot is going to check if the user is already in the Privy Database and will response with a post confirming if the token was succesfully created or not.

Some of its most innovative features include the ability to split creator fees between the creator and their community, or to reserve a percentage of the token supply for the creator’s audience. Currently, verification is done through a snapshot of the creator's Twitter followers at a given time, stored in a JSON file and later used for claiming within the platform.

This repository contains two projects:

## 1. Meme Launchpad

A Next.js application for launching and managing meme tokens on the blockchain. This is where the Website and smart contracts are.

```
cd meme-launchpad
pnpm install
pnpm run dev
```

## 2. Eliza Mantle Bot

A Twitter bot for the Mantle Network built with Node.js. Made with Eliza and TwitterAPI. Working slowly inside a Free Tier.

```
cd eliza-mantle-bot
npm install
npm run start
```
