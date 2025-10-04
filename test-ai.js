// Quick test for AI functionality
import { testAPIConnection, testYouTubeAPI, isAPIConfigured } from './src/services/ai.ts';

console.log('Testing AI API Configuration...');

// Test if API is configured
console.log('API Configured:', isAPIConfigured());

// Test API connections
testAPIConnection().then(result => {
  console.log('Google AI Test:', result);
}).catch(error => {
  console.error('Google AI Error:', error);
});

testYouTubeAPI().then(result => {
  console.log('YouTube API Test:', result);
}).catch(error => {
  console.error('YouTube API Error:', error);
});