# MantleMemeBot - Twitter/X Token Creation Bot

This Twitter bot allows users to create meme tokens on the Mantle blockchain by simply tagging it in a tweet with a specific format.

## How It Works

1. Users mention the bot account (@Microprompt_) on Twitter/X
2. They include a command like: `Create MoonCoin MOON`
3. The bot processes the request and creates a new token on Mantle
4. The bot replies with confirmation and the token address

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

2. Create a `.env` file based on the following template:
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