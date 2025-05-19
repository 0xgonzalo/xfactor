import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import { PrivyClient } from '@privy-io/server-auth';

// Load environment variables
dotenv.config();

// Configuration for the website
const WEBSITE_URL = process.env.WEBSITE_URL || "http://localhost:3000";
const PRIVY_API_URL = process.env.PRIVY_API_URL || "https://auth.privy.io/api/v1";
const PRIVY_APP_ID = process.env.PRIVY_APP_ID || "";
const PRIVY_APP_SECRET = process.env.PRIVY_AUTH_TOKEN || "";

console.log(`🔑 Using Privy App ID: ${PRIVY_APP_ID ? PRIVY_APP_ID.substring(0, 5) + '...' : 'Not set'}`);
console.log(`🔑 Using Privy Auth Token: ${PRIVY_APP_SECRET ? PRIVY_APP_SECRET.substring(0, 5) + '...' : 'Not set'}`);

// Setup Twitter client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY || '',
  appSecret: process.env.TWITTER_API_SECRET || '',
  accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
});

// Setup Privy client
let privyClient: PrivyClient | null = null;
if (PRIVY_APP_ID && PRIVY_APP_SECRET) {
  try {
    privyClient = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);
    console.log('✅ Privy client initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Privy client:', error);
  }
} else {
  console.log('⚠️ Privy credentials not found in .env file');
}

// We need the user name to search for mentions
const BOT_USERNAME = process.env.TWITTER_USERNAME || 'Microprompt_';

// Function to test Twitter user lookup and Privy verification
async function testTwitterPrivy(twitterHandle: string) {
  console.log(`🧪 Testing Privy verification for Twitter user: @${twitterHandle}`);
  
  try {
    // Test if the Twitter handle is valid
    console.log(`🔍 Looking up Twitter user: @${twitterHandle}`);
    let twitterUser = null;
    try {
      const user = await twitterClient.v2.userByUsername(twitterHandle);
      twitterUser = user.data;
      console.log(`✅ Twitter user found: ${JSON.stringify(twitterUser, null, 2)}`);
    } catch (error: any) {
      console.error(`❌ Error looking up Twitter user: ${error.message}`);
      console.log('⚠️ Proceeding with Privy test anyway...');
    }
    
    // Check if this Twitter user exists in Privy's user base
    const userExists = await checkPrivyUserByTwitter(twitterHandle);
    
    if (userExists) {
      console.log(`✅ User @${twitterHandle} exists in Privy database`);
    } else {
      console.log(`❌ User @${twitterHandle} does not exist in Privy database`);
    }
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message || error);
  }
}

// Check if a Twitter user exists in Privy's user base
async function checkPrivyUserByTwitter(twitterHandle: string): Promise<boolean> {
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
      
      // Log the full user object for debugging
      console.log(`📄 Privy API response full data:`, JSON.stringify(user, null, 2));
      
      // If we get a user back, they exist in Privy
      if (user) {
        // Check if this really looks like the correct user (has Twitter linked account)
        const hasTwitter = user.linkedAccounts?.some(account => 
          account.type === 'twitter_oauth'
        );
        
        if (hasTwitter) {
          console.log(`✅ User has Twitter linked in Privy`);
          return true;
        } else {
          console.log(`⚠️ Found user in Privy but no Twitter account is linked`);
          // If we want to be strict about validation:
          // return false;
          // Otherwise allow it:
          return true;
        }
      } else {
        console.log(`❌ User not found in Privy database`);
        return false;
      }
    } catch (error: any) {
      console.error(`❌ Error checking Privy user: ${error.message}`);
      
      // If we get a 404, the user doesn't exist
      if (error.message?.includes('404')) {
        console.log('❌ User not found in Privy (404 response)');
        return false;
      }
      
      // Default to false on error to prevent token creation for unverified users
      return false;
    }
  } catch (error: any) {
    console.error('❌ Error checking Privy user:', error.message || error);
    // Default to false on error to prevent token creation for unverified users
    return false;
  }
}

// Main test function
async function main() {
  console.log('🤖 Starting Privy + Twitter API test...');
  
  // Get the Twitter handle to test from command line arguments or use default
  const twitterHandleToTest = process.argv[2] || 'elonmusk';
  
  // Remove @ symbol if present
  const cleanHandle = twitterHandleToTest.startsWith('@') ? 
    twitterHandleToTest.substring(1) : twitterHandleToTest;
  
  // Run the test
  await testTwitterPrivy(cleanHandle);
  
  console.log('✅ Test completed');
}

// Run the main function
main().catch(error => {
  console.error('❌ Fatal error:', error);
}); 