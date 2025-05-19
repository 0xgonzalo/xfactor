import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testTwitterApi() {
  console.log('🔍 Testing Twitter API connectivity...');
  
  const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY || '',
    appSecret: process.env.TWITTER_API_SECRET || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
  });

  try {
    // 1. Verify credentials (this should work with all API tiers)
    console.log('🔄 Testing user verification...');
    const me = await twitterClient.v1.verifyCredentials();
    console.log(`✅ Connected to Twitter as @${me.screen_name} (ID: ${me.id_str})`);

    // 2. Try posting a test tweet
    try {
      console.log('🔄 Testing tweet creation with v2 API...');
      const tweet = await twitterClient.v2.tweet('This is a test tweet from the Mantle token bot. ' + new Date().toISOString());
      console.log('✅ Tweet created successfully: ', tweet);
      
      // If we successfully created a tweet, try replying to it
      if (tweet.data?.id) {
        console.log(`🔄 Testing reply to tweet ${tweet.data.id}...`);
        const reply = await twitterClient.v2.reply(
          'This is a test reply to demonstrate the functionality works. ' + new Date().toISOString(),
          tweet.data.id
        );
        console.log('✅ Reply sent successfully: ', reply);
      }
    } catch (tweetError) {
      console.error('❌ Tweet creation failed:', tweetError);
      console.log('Continuing with other tests...');
      
      // If creating a new tweet fails, we'll try to reply to a known tweet ID
      // You should replace this with a recent tweet ID from your account
      const knownTweetId = process.env.TEST_TWEET_ID; // Add this to your .env file
      if (knownTweetId) {
        try {
          console.log(`🔄 Testing reply to known tweet ${knownTweetId}...`);
          const reply = await twitterClient.v2.reply(
            'This is a test reply to a known tweet. ' + new Date().toISOString(),
            knownTweetId
          );
          console.log('✅ Reply sent successfully: ', reply);
        } catch (replyError) {
          console.error('❌ Reply to known tweet failed:', replyError);
        }
      } else {
        console.log('ℹ️ No TEST_TWEET_ID provided in .env file. Skipping reply test.');
      }
    }

    console.log('🎉 Twitter API tests completed!');
  } catch (error) {
    console.error('❌ Twitter API test failed:', error);
    
    if (typeof error === 'object' && error !== null) {
      // Try to extract useful error information
      console.error('Error details:', JSON.stringify(error, null, 2));
    }
  }
}

// Run the test
testTwitterApi().catch(error => {
  console.error('Fatal error:', error);
}); 