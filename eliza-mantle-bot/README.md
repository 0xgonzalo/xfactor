# MantleMemeBot - Twitter/X Token Creation Bot

This Twitter bot allows users to create meme tokens on the Mantle blockchain by simply tagging it in a tweet with a specific format.

## How It Works

1. Users mention the bot account (@Microprompt_) on Twitter/X
2. They include a command like: `Create MoonCoin MOON`
3. The bot checks if the Twitter user is registered on the platform via Privy integration
4. If registered, the bot processes the request and creates a new token on Mantle
5. The bot replies with confirmation and the token address or a link to register on the platform

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

2. Create a `.env` file based on the template in `ENV_SAMPLE`:
   ```
   # Blockchain Configuration
   PRIVATE_KEY=your_ethereum_private_key_here
   LAUNCHPAD_ADDRESS=0x709F1b8Dc07A7D099825360283410999af09CAC9

   # Twitter API Keys (required for Twitter integration)
   TWITTER_API_KEY=your_twitter_api_key
   TWITTER_API_SECRET=your_twitter_api_secret
   TWITTER_ACCESS_TOKEN=your_twitter_access_token
   TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret
   
   # Your Twitter username without the @ symbol
   TWITTER_USERNAME=Microprompt_
   
   # Website and Privy Integration
   WEBSITE_URL=http://localhost:3000
   PRIVY_API_URL=https://auth.privy.io/api/v1
   PRIVY_API_KEY=your_privy_api_key
   
   # Optional: How often to check for mentions in milliseconds (default: 300000 = 5 minutes)
   # Using a higher value like 300000 (5 minutes) or 600000 (10 minutes) helps avoid rate limits
   POLLING_INTERVAL=300000
   ```
   
3. Build the project:
   ```
   npm run build
   ```

4. Start the bot:
   ```
   npm start
   ```
   
5. To test the Privy integration, you can run:
   ```
   node dist/test-privy.js [twitter_handle]
   ```
   where `[twitter_handle]` is an optional Twitter username to test (default: "elonmusk")

## Privy Integration

The bot now integrates with Privy to verify that users have registered on the platform before creating tokens:

- When a user requests a token creation, the bot checks if their Twitter account is linked in the Privy user base
- If the user is found, the token is created and the bot replies with the token link
- If the user is not found, the bot replies with a link to the platform to register

To set up the Privy integration:

1. Create a Privy account at https://dashboard.privy.io
2. Configure the app with Twitter login enabled
3. Add the Privy API Key to your `.env` file
4. Update the `WEBSITE_URL` in your `.env` file to point to your deployed application

## Twitter API Access

This bot will work with Basic-tier Twitter API access. The app uses search functionality instead of the mentions timeline to work with the limitations of the Twitter API. 

If you encounter issues with API access, you may need to:
1. Make sure your Twitter Developer account has at least Basic access
2. Verify your app has the appropriate permissions (Read and Write)
3. Check that your access tokens have the correct scopes

### Rate Limits

Twitter API has strict rate limits. This bot includes rate limiting logic to prevent hitting those limits:

- The default polling interval is 5 minutes to avoid excessive API calls
- The bot implements exponential backoff when rate limits are hit
- If you're still hitting rate limits, increase the `POLLING_INTERVAL` value in your `.env` file

## Contract Integration

This bot interacts with a Launchpad smart contract deployed on Mantle Sepolia at:
`0x709F1b8Dc07A7D099825360283410999af09CAC9`

The contract has a special function `socialMint` that allows the bot to create tokens on behalf of users.

## Security Considerations

- The bot uses `setBotAuthority` to register itself as an authorized minter
- Only the owner of the Launchpad contract can set the bot authority
- Make sure to keep your private key secure and never commit it to your repository

## Usage

Once set up, users can create tokens by simply tweeting:

```
@Microprompt_ Create MyAwesomeToken MAT
```

The bot will process the request and reply with the newly created token address. 