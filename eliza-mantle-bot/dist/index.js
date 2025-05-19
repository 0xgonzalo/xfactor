import { ethers } from 'ethers';
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrivyClient } from '@privy-io/server-auth';
// Load environment variables
dotenv.config();
// Setup directories
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '..', '.env');
const statePath = path.join(__dirname, '..', '.bot_state.json');
if (!fs.existsSync(configPath)) {
    console.error('❌ .env file not found! Please create one based on the README.md instructions.');
    process.exit(1);
}
// Contract ABI for the Launchpad contract
const LAUNCHPAD_ABI = [
    "function socialMint(address _creator, string memory _name, string memory _symbol) external",
    "function setBotAuthority(address _botAuthority) external"
];
// Mantle Sepolia network configuration
const MANTLE_SEPOLIA_RPC = "https://rpc.sepolia.mantle.xyz";
const LAUNCHPAD_ADDRESS = process.env.LAUNCHPAD_ADDRESS || "0x709F1b8Dc07A7D099825360283410999af09CAC9";
// Setup blockchain connection
const provider = new ethers.JsonRpcProvider(MANTLE_SEPOLIA_RPC);
const privateKey = process.env.PRIVATE_KEY || "";
if (!privateKey) {
    console.error('❌ PRIVATE_KEY not found in .env file!');
    process.exit(1);
}
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(LAUNCHPAD_ADDRESS, LAUNCHPAD_ABI, wallet);
// Setup Twitter client
const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY || '',
    appSecret: process.env.TWITTER_API_SECRET || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
});
// We need the user name to search for mentions
const BOT_USERNAME = process.env.TWITTER_USERNAME || 'Microprompt_';
if (!BOT_USERNAME) {
    console.error('❌ TWITTER_USERNAME not found in .env file!');
    console.log('Add your Twitter username (without @) to the .env file as TWITTER_USERNAME');
    process.exit(1);
}
// Verify Twitter credentials
if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET ||
    !process.env.TWITTER_ACCESS_TOKEN || !process.env.TWITTER_ACCESS_TOKEN_SECRET) {
    console.error('❌ Twitter API credentials not found in .env file!');
    process.exit(1);
}
// Configuration for the website
const WEBSITE_URL = process.env.WEBSITE_URL || "http://localhost:3000";
const PRIVY_APP_ID = process.env.PRIVY_APP_ID || "";
const PRIVY_APP_SECRET = process.env.PRIVY_AUTH_TOKEN || "";
// Setup Privy client
let privyClient = null;
if (PRIVY_APP_ID && PRIVY_APP_SECRET) {
    try {
        privyClient = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);
        console.log('✅ Privy client initialized successfully');
    }
    catch (error) {
        console.error('❌ Error initializing Privy client:', error);
    }
}
else {
    console.log('⚠️ Privy credentials not found in .env file, user verification will be disabled');
}
const defaultState = {
    lastProcessedTweetId: '',
    lastActivityTimestamp: Date.now(),
    processedTweets: [],
    startupCount: 0
};
let botState = defaultState;
// Load state from disk if it exists
function loadState() {
    try {
        if (fs.existsSync(statePath)) {
            const data = fs.readFileSync(statePath, 'utf8');
            const savedState = JSON.parse(data);
            console.log('📥 Loaded saved state with last tweet ID:', savedState.lastProcessedTweetId);
            return { ...defaultState, ...savedState, startupCount: (savedState.startupCount || 0) + 1 };
        }
    }
    catch (error) {
        console.error('⚠️ Error loading state, using default:', error);
    }
    return { ...defaultState, startupCount: 1 };
}
// Save state to disk
function saveState() {
    try {
        // Update timestamp
        botState.lastActivityTimestamp = Date.now();
        // Keep list of processed tweets from growing too large
        if (botState.processedTweets.length > 100) {
            botState.processedTweets = botState.processedTweets.slice(-50);
        }
        fs.writeFileSync(statePath, JSON.stringify(botState, null, 2));
        console.log('💾 Saved bot state');
    }
    catch (error) {
        console.error('⚠️ Error saving state:', error);
    }
}
// Rate limiting configuration
// Store when we last made requests to avoid hitting rate limits
const rateLimit = {
    search: { lastRequest: 0, requestsThisWindow: 0, windowResetTime: 0 },
    tweet: { lastRequest: 0, requestsThisWindow: 0, windowResetTime: 0 }
};
// Default polling interval in milliseconds (15 minutes)
const POLLING_INTERVAL = parseInt(process.env.POLLING_INTERVAL || '', 10) || 15 * 60 * 1000;
// Set bot as authority (only needs to be done once)
async function setupBotAuthority() {
    try {
        console.log('🔐 Setting up bot authority...');
        const tx = await contract.setBotAuthority(wallet.address);
        await tx.wait();
        console.log('✅ Bot authority set successfully!');
    }
    catch (error) {
        if (error.message?.includes('Not owner')) {
            console.log('ℹ️ Bot authority can only be set by the contract owner.');
        }
        else {
            console.error('❌ Error setting bot authority:', error.message || error);
        }
    }
}
// Process a token creation request
async function createToken(creatorAddress, tokenName, tokenSymbol) {
    try {
        console.log(`🔄 Creating token ${tokenName} (${tokenSymbol}) for address ${creatorAddress}...`);
        const tx = await contract.socialMint(creatorAddress, tokenName, tokenSymbol);
        const receipt = await tx.wait();
        console.log(`✅ Token created! Transaction hash: ${tx.hash}`);
        return tx.hash;
    }
    catch (error) {
        console.error('❌ Error creating token:', error.message || error);
        throw error;
    }
}
// Delay helper function with exponential backoff
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Utility to handle rate limiting
async function handleRateLimit(limitType, retries = 3) {
    const now = Date.now();
    const limitInfo = rateLimit[limitType];
    // If we're in a new window, reset counters
    if (now > limitInfo.windowResetTime) {
        limitInfo.requestsThisWindow = 0;
        limitInfo.windowResetTime = now + 15 * 60 * 1000; // 15 minutes
    }
    // Ultra conservative rate limiting: max 5 requests per 15 min window for search, 10 for tweets
    const maxRequests = limitType === 'search' ? 5 : 10;
    if (limitInfo.requestsThisWindow >= maxRequests) {
        const waitTime = limitInfo.windowResetTime - now;
        console.log(`⏱️ Rate limit reached for ${limitType}. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
        if (retries <= 0) {
            console.log(`❌ Maximum retries reached for ${limitType}. Skipping.`);
            return false;
        }
        // Wait until reset time with some buffer
        await delay(waitTime + 5000); // Add extra 5 seconds buffer
        return handleRateLimit(limitType, retries - 1);
    }
    // Add delay between requests regardless (throttling)
    if (limitInfo.lastRequest > 0) {
        const timeSinceLastRequest = now - limitInfo.lastRequest;
        // Minimum 5 seconds between requests
        const minRequestGap = 5000;
        if (timeSinceLastRequest < minRequestGap) {
            const waitTime = minRequestGap - timeSinceLastRequest;
            console.log(`⏸️ Throttling ${limitType} request. Waiting ${waitTime}ms...`);
            await delay(waitTime);
        }
    }
    // Update rate limit tracking
    limitInfo.lastRequest = Date.now(); // Get fresh timestamp after potential wait
    limitInfo.requestsThisWindow++;
    return true;
}
// Start monitoring Twitter mentions
async function startTwitterBot() {
    try {
        // Load saved state
        botState = loadState();
        // Use the last tweet ID from our saved state
        if (botState.lastProcessedTweetId) {
            console.log(`🔄 Resuming from last processed tweet ID: ${botState.lastProcessedTweetId}`);
        }
        console.log('🚀 Starting Twitter bot...');
        // Verify credentials to confirm connection
        console.log('🔄 Verifying Twitter credentials...');
        const me = await twitterClient.v1.verifyCredentials();
        console.log(`🔗 Connected to Twitter as @${me.screen_name} (ID: ${me.id_str})`);
        console.log(`ℹ️ This is startup #${botState.startupCount} of the bot`);
        // Initial check for mentions - but not immediately on startup to avoid rate limits
        console.log(`👂 Will check for mentions in 30 seconds...`);
        setTimeout(async () => {
            await searchForMentions();
            // Continue checking at regular intervals
            console.log(`⏰ Will check for new mentions every ${POLLING_INTERVAL / 1000} seconds (${POLLING_INTERVAL / 1000 / 60} minutes)`);
            setInterval(async () => {
                await searchForMentions();
                // Save state after each check
                saveState();
            }, POLLING_INTERVAL);
        }, 30000); // Wait 30 seconds before first check
    }
    catch (error) {
        console.error('❌ Error in Twitter bot:', error.message || error);
    }
}
// Function to search for mentions using the v2 search API 
async function searchForMentions() {
    // Check rate limiting before making the request
    if (!await handleRateLimit('search')) {
        return; // Skip this check if we're rate limited
    }
    try {
        // Use the v2 search endpoint which is more likely to be available in basic tier
        console.log(`🔍 Searching for tweets mentioning @${BOT_USERNAME}...`);
        // Search for recent tweets mentioning the bot
        const query = `@${BOT_USERNAME} -from:${BOT_USERNAME}`;
        const searchOptions = {
            max_results: 10,
            expansions: ['author_id'],
            'tweet.fields': ['created_at', 'author_id', 'text'],
            'user.fields': ['username']
        };
        if (botState.lastProcessedTweetId) {
            searchOptions.since_id = botState.lastProcessedTweetId;
        }
        // Use type assertion to work around TypeScript type issues
        const searchResult = await twitterClient.v2.search(query, searchOptions);
        // Check if we have results
        const tweets = searchResult.data?.data || [];
        if (tweets.length === 0) {
            console.log('📭 No new mentions found');
            return;
        }
        console.log(`📩 Found ${tweets.length} mentions`);
        // Get the users data from the includes
        const users = searchResult.data?.includes?.users || [];
        // Update the last processed tweet ID from the newest mention
        if (tweets.length > 0) {
            botState.lastProcessedTweetId = tweets[0].id;
            // Save state immediately after updating the last tweet ID
            saveState();
        }
        // Process each tweet - spreading them out to avoid rate limits
        for (let i = 0; i < tweets.length; i++) {
            const tweet = tweets[i];
            // Skip if we've already processed this tweet
            if (botState.processedTweets.includes(tweet.id)) {
                console.log(`⏭️ Skipping already processed tweet: ${tweet.id}`);
                continue;
            }
            // Find the author's username
            const author = users.find((user) => user.id === tweet.author_id);
            const authorUsername = author ? author.username : null;
            console.log(`🔍 Processing tweet from @${authorUsername}: ${tweet.text}`);
            // Add a short delay between processing tweets to avoid rate limit issues
            if (i > 0) {
                await delay(2000); // 2 second delay between tweets
            }
            // Process the tweet with the author's username
            await processCreateCommand(tweet.text, tweet.id, authorUsername);
            // Mark as processed
            botState.processedTweets.push(tweet.id);
            // Save state after each processed tweet
            if (i % 3 === 0) {
                saveState();
            }
        }
        // Final save state
        saveState();
    }
    catch (error) {
        console.error('❌ Error searching for mentions:', error.message || error);
        // Handle rate limiting errors
        if (error.message?.includes('429')) {
            console.log('⏱️ Twitter rate limit reached. Waiting before trying again...');
            // Implementing a simple exponential backoff
            const waitTime = 15 * 60 * 1000; // 15 minutes
            console.log(`⏳ Waiting ${waitTime / 1000} seconds before trying again...`);
            await delay(waitTime);
            return;
        }
        // Try fallback to v1.1 search if v2 failed with 403
        if (error.message?.includes('403')) {
            console.log('⚠️ Trying fallback to v1.1 search...');
            await searchForMentionsV1Fallback();
        }
    }
}
// Fallback search using v1.1 API
async function searchForMentionsV1Fallback() {
    // Check rate limiting before making the request
    if (!await handleRateLimit('search')) {
        return; // Skip this check if we're rate limited
    }
    try {
        // Use the v1.1 search endpoint as fallback
        const searchParams = {
            q: `@${BOT_USERNAME}`,
            count: 10,
            result_type: 'recent',
            tweet_mode: 'extended'
        };
        if (botState.lastProcessedTweetId) {
            searchParams.since_id = botState.lastProcessedTweetId;
        }
        const searchResults = await twitterClient.v1.get('search/tweets.json', searchParams);
        if (!searchResults.statuses || searchResults.statuses.length === 0) {
            console.log('📭 No new mentions found (v1 fallback)');
            return;
        }
        console.log(`📩 Found ${searchResults.statuses.length} mentions (v1 fallback)`);
        // Update the last processed tweet ID from the newest mention
        if (searchResults.statuses.length > 0) {
            botState.lastProcessedTweetId = searchResults.statuses[0].id_str;
            // Save immediately
            saveState();
        }
        // Process mentions - spreading them out to avoid rate limits
        for (let i = 0; i < searchResults.statuses.length; i++) {
            const tweet = searchResults.statuses[i];
            // Skip our own tweets
            if (tweet.user.screen_name === BOT_USERNAME)
                continue;
            // Skip if we've already processed this tweet
            if (botState.processedTweets.includes(tweet.id_str)) {
                console.log(`⏭️ Skipping already processed tweet: ${tweet.id_str}`);
                continue;
            }
            // Add a short delay between processing tweets
            if (i > 0) {
                await delay(2000); // 2 second delay between tweets
            }
            console.log(`🔍 Processing tweet from @${tweet.user.screen_name}: ${tweet.full_text || tweet.text}`);
            await processCreateCommand(tweet.full_text || tweet.text, tweet.id_str, tweet.user.screen_name);
            // Mark as processed
            botState.processedTweets.push(tweet.id_str);
            // Save state periodically
            if (i % 3 === 0) {
                saveState();
            }
        }
        // Final save
        saveState();
    }
    catch (error) {
        console.error('❌ Error with v1 search fallback:', error.message || error);
        // Handle rate limiting errors
        if (error.message?.includes('429')) {
            console.log('⏱️ Twitter rate limit reached on fallback. Waiting before trying again...');
            await delay(15 * 60 * 1000); // Wait 15 minutes
        }
    }
}
// Check if a Twitter user exists in Privy's user base
async function checkPrivyUserByTwitter(twitterHandle) {
    try {
        console.log(`🔍 Checking if Twitter user @${twitterHandle} exists in Privy...`);
        // If Privy client isn't initialized, we can't check
        if (!privyClient) {
            console.log('❌ Privy client not initialized. Check your PRIVY_APP_ID and PRIVY_AUTH_TOKEN in .env');
            return false;
        }
        try {
            // Use the Privy SDK to check if the user exists by Twitter username
            console.log(`🔄 Calling Privy API with getUserByTwitterUsername('${twitterHandle}')...`);
            const user = await privyClient.getUserByTwitterUsername(twitterHandle);
            // Log limited user info for security reasons
            if (user) {
                console.log(`✅ Found user in Privy with DID: ${user.id}`);
                // Check if this really looks like the correct user (has Twitter linked account)
                const hasTwitter = user.linkedAccounts?.some(account => account.type === 'twitter_oauth');
                if (hasTwitter) {
                    console.log(`✅ User has Twitter linked in Privy`);
                    return true;
                }
                else {
                    console.log(`⚠️ Found user in Privy but no Twitter account is linked`);
                    // For production, we should be strict and return false if no Twitter account
                    // is linked, but for testing we'll allow it
                    return true;
                }
            }
            else {
                console.log(`❌ User not found in Privy database`);
                return false;
            }
        }
        catch (error) {
            console.error(`❌ Error checking Privy user: ${error.message}`);
            // If we get a 404, the user doesn't exist
            if (error.message?.includes('404')) {
                console.log('❌ User not found in Privy (404 response)');
                return false;
            }
            // Default to false on error to prevent token creation for unverified users
            return false;
        }
    }
    catch (error) {
        console.error('❌ Error checking Privy user:', error.message || error);
        // Default to false on error to prevent token creation for unverified users
        return false;
    }
}
// Process a potential token creation command
async function processCreateCommand(tweetText, tweetId, twitterHandle) {
    const createPattern = /create\s+([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)/i;
    const match = tweetText.match(createPattern);
    if (!match) {
        console.log('❌ Not a token creation command');
        return;
    }
    const [_, tokenName, tokenSymbol] = match;
    try {
        if (!twitterHandle) {
            console.log('⚠️ Could not extract Twitter handle from tweet. Using default behavior...');
            // For backward compatibility, create the token without checking Privy
            const txHash = await createToken(wallet.address, tokenName, tokenSymbol);
            await sendReply(tweetId, `🎉 Successfully created ${tokenName} (${tokenSymbol}) token on Mantle!\nView your token: ${WEBSITE_URL}/tokens/${txHash}`);
            return;
        }
        // Check if this Twitter user exists in Privy
        const userExists = await checkPrivyUserByTwitter(twitterHandle);
        if (userExists) {
            // User is registered in Privy, proceed with token creation
            console.log(`✅ Twitter user @${twitterHandle} found in Privy. Creating token...`);
            // For simplicity, we're using the bot's wallet as the creator address
            // In a real implementation, you would look up the user's wallet address from Privy
            const txHash = await createToken(wallet.address, tokenName, tokenSymbol);
            // Reply to the tweet with success message and token link
            await sendReply(tweetId, `🎉 Successfully created ${tokenName} (${tokenSymbol}) token on Mantle!\nView your token: ${WEBSITE_URL}/tokens/${txHash}`);
        }
        else {
            // User is not registered in Privy, send them to the website
            console.log(`❌ Twitter user @${twitterHandle} not found in Privy. Sending to website.`);
            await sendReply(tweetId, `To create your ${tokenName} token, you need to connect to our platform first. Join us at ${WEBSITE_URL} to get started!`);
        }
    }
    catch (error) {
        console.error('❌ Error processing command:', error);
        // Reply with error message (with rate limiting)
        await sendReply(tweetId, `Sorry, there was an error processing your request: ${error.message || 'Unknown error'}`);
    }
}
// Helper to send replies with rate limiting
async function sendReply(tweetId, message) {
    // Check rate limiting before making the request
    if (!await handleRateLimit('tweet')) {
        console.log('⏱️ Skipping reply due to rate limits');
        return;
    }
    try {
        // Try v2 API first
        try {
            await twitterClient.v2.reply(message, tweetId);
            console.log('✅ Replied to tweet with success message');
        }
        catch (replyError) {
            console.error('⚠️ Error with v2 reply, trying v1:', replyError.message);
            // Check rate limiting again before making another request
            if (!await handleRateLimit('tweet')) {
                console.log('⏱️ Skipping v1 fallback due to rate limits');
                return;
            }
            // Try v1 tweet as fallback
            await twitterClient.v1.tweet(message, { in_reply_to_status_id: tweetId });
            console.log('✅ Replied to tweet with success message (v1 fallback)');
        }
    }
    catch (error) {
        console.error('Failed to send reply:', error.message);
        // Handle rate limiting in case of error
        if (error.message?.includes('429')) {
            console.log('⏱️ Twitter rate limit reached while replying. Will try again later.');
        }
    }
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down bot...');
    saveState();
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('🛑 Shutting down bot...');
    saveState();
    process.exit(0);
});
// Main function
async function main() {
    console.log('🤖 Starting MantleMemeBot...');
    // Set bot authority (only needs to be done once)
    await setupBotAuthority();
    // Start Twitter bot
    await startTwitterBot();
}
// Run the main function
main().catch(error => {
    console.error('❌ Fatal error:', error);
});
