import { GoogleGenerativeAI } from '@google/generative-ai';

// API Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface GenerateContentOptions {
  sourceType: 'youtube' | 'file' | 'text';
  content: string;
  contentType: 'notes' | 'flashcards' | 'quiz' | 'chat';
  additionalContext?: string;
}

interface FlashcardGeneration {
  question: string;
  answer: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctOption: number;
}

interface AIResponse {
  notes?: string;
  flashcards?: FlashcardGeneration[];
  quiz?: QuizQuestion[];
  summary?: string;
  chat?: string;
}

// Utility function for delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Check if API key is configured
export function isAPIConfigured(): boolean {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY;
  console.log('Checking API configuration:', {
    hasApiKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    isDemoKey: apiKey === 'demo_key_please_replace',
    keyStart: apiKey?.substring(0, 10) || 'none'
  });
  return !!(apiKey && apiKey !== 'demo_key_please_replace' && apiKey.length > 10);
}

// Test API connection
export async function testAPIConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY;
    if (!apiKey || apiKey === 'demo_key_please_replace') {
      return { success: false, error: 'API key not configured' };
    }

    console.log('Testing Google AI API with key:', apiKey.substring(0, 20) + '...');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try different models in order of preference (updated model names)
    const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 100,
          }
        });
        
        const result = await model.generateContent('Respond with: API test successful');
        const response = await result.response;
        const text = response.text();
        
        if (text && text.trim().length > 0) {
          console.log(`✅ Google AI API connection successful with model: ${modelName}`);
          console.log('Response:', text);
          return { success: true };
        }
      } catch (modelError) {
        console.log(`Model ${modelName} failed:`, modelError);
        continue; // Try next model
      }
    }
    
    return { success: false, error: 'All models failed - check API key permissions' };
  } catch (error) {
    console.error('❌ Google AI API connection failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Test YouTube API connection
export async function testYouTubeAPI(): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!apiKey || apiKey === 'demo_key_please_replace') {
      return { success: false, error: 'YouTube API key not configured' };
    }

    console.log('Testing YouTube API with key:', apiKey.substring(0, 20) + '...');
    
    // Test with a simple search
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&maxResults=1&key=${apiKey}`
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ YouTube API connection successful');
      return { success: true };
    } else {
      const errorData = await response.json();
      console.error('❌ YouTube API error:', errorData);
      return { 
        success: false, 
        error: errorData.error?.message || 'YouTube API request failed' 
      };
    }
  } catch (error) {
    console.error('❌ YouTube API connection failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// AI Chat function with working model
export async function generateChatResponse(message: string, conversationHistory?: string[]): Promise<string> {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY;
  if (!apiKey || apiKey === 'demo_key_please_replace') {
    throw new Error('Google AI API key not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Use working model
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 2048,
    }
  });

  try {
    // Build conversation context
    let prompt = '';
    if (conversationHistory && conversationHistory.length > 0) {
      prompt = conversationHistory.join('\n') + '\n\nUser: ' + message;
    } else {
      prompt = `You are a helpful AI study assistant. Please respond to this message: ${message}`;
    }

    console.log('Sending chat request to AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ AI chat response received');
    return text;
  } catch (error) {
    console.error('❌ AI chat failed:', error);
    throw new Error(`Chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// YouTube Analysis function
export async function analyzeYouTubeVideo(videoUrl: string): Promise<string> {
  try {
    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Get video details
    const videoDetails = await getYouTubeVideoDetails(videoId);
    
    // Generate AI analysis
    const analysisPrompt = `
Analyze this YouTube video and provide educational insights:

Title: ${videoDetails.title}
Description: ${videoDetails.description}
Duration: ${videoDetails.duration}
Channel: ${videoDetails.channelTitle}

Please provide:
1. Key educational points from this video
2. Main topics covered
3. Suggested study notes structure
4. Important concepts to remember
5. How this relates to broader academic subjects

Format your response in a clear, structured way that would be helpful for a student.
`;

    const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY;
    if (!apiKey || apiKey === 'demo_key_please_replace') {
      throw new Error('Google AI API key not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    console.log('Analyzing YouTube video with AI...');
    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const analysis = response.text();
    
    console.log('✅ YouTube analysis complete');
    return analysis;
  } catch (error) {
    console.error('❌ YouTube analysis failed:', error);
    throw new Error(`YouTube analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Function to get YouTube video details
async function getYouTubeVideoDetails(videoId: string) {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!apiKey || apiKey === 'demo_key_please_replace') {
    throw new Error('YouTube API key not configured');
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch video details');
  }

  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found');
  }

  const video = data.items[0];
  return {
    title: video.snippet.title,
    description: video.snippet.description,
    duration: video.contentDetails.duration,
    channelTitle: video.snippet.channelTitle,
    publishedAt: video.snippet.publishedAt
  };
}

// Legacy function - keeping for compatibility but using new generateChatResponse
export async function generateContent(options: GenerateContentOptions): Promise<AIResponse> {
  console.log('generateContent called with:', options);
  
  if (options.contentType === 'chat') {
    const chatResponse = await generateChatResponse(options.content);
    return { chat: chatResponse };
  }
  
  // For other content types, use the chat function but with specific prompts
  let prompt = '';
  switch (options.contentType) {
    case 'notes':
      prompt = `Create detailed study notes from this ${options.sourceType} content: ${options.content}`;
      break;
    case 'flashcards':
      prompt = `Create flashcards in JSON format from this ${options.sourceType} content: ${options.content}`;
      break;
    case 'quiz':
      prompt = `Create a quiz in JSON format from this ${options.sourceType} content: ${options.content}`;
      break;
    default:
      prompt = options.content;
  }
  
  const response = await generateChatResponse(prompt);
  
  // Return response in the expected format
  switch (options.contentType) {
    case 'notes':
      return { notes: response };
    case 'flashcards':
      try {
        const flashcards = JSON.parse(response);
        return { flashcards };
      } catch {
        return { notes: response }; // fallback if JSON parsing fails
      }
    case 'quiz':
      try {
        const quiz = JSON.parse(response);
        return { quiz };
      } catch {
        return { notes: response }; // fallback if JSON parsing fails
      }
    default:
      return { chat: response };
  }
}