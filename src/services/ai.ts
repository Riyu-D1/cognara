// Configuration
const MISTRAL_API_KEY = import.meta.env.VITE_GOOGLE_AI_KEY;
const MISTRAL_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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
  console.log('Checking Mistral AI configuration:', {
    hasApiKey: !!MISTRAL_API_KEY,
    keyLength: MISTRAL_API_KEY?.length || 0,
    keyStart: MISTRAL_API_KEY?.substring(0, 10) || 'none'
  });
  return !!(MISTRAL_API_KEY && MISTRAL_API_KEY.length > 10);
}

// Test API connection
export async function testAPIConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!MISTRAL_API_KEY) {
      return { success: false, error: 'Mistral API key not configured' };
    }

    console.log('Testing Mistral AI API...');
    
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'StudyFlow AI'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          {
            role: 'user',
            content: 'Respond with: API test successful'
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ Mistral AI API connection failed:', errorData);
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${errorData.error || 'API request failed'}` 
      };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    
    if (text && text.trim().length > 0) {
      console.log('✅ Mistral AI API connection successful');
      console.log('Response:', text);
      return { success: true };
    } else {
      return { success: false, error: 'Empty response from Mistral AI' };
    }
  } catch (error) {
    console.error('❌ Mistral AI API connection failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Test YouTube API connection
export async function testYouTubeAPI(): Promise<{ success: boolean; error?: string }> {
  try {
    const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!youtubeApiKey || youtubeApiKey === 'demo_key_please_replace') {
      return { success: false, error: 'YouTube API key not configured' };
    }

    // Test with a simple API call
    const testUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=${youtubeApiKey}`;
    const response = await fetch(testUrl);
    
    if (response.ok) {
      console.log('✅ YouTube API connection successful');
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error('❌ YouTube API connection failed:', errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }
  } catch (error) {
    console.error('❌ YouTube API connection failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

// Test all API connections
export async function testAllAPIs(): Promise<{ 
  mistralAI: { success: boolean; error?: string };
  youtube: { success: boolean; error?: string };
}> {
  console.log('🔍 Testing API connections...');
  
  const [mistralAI, youtube] = await Promise.all([
    testAPIConnection(),
    testYouTubeAPI()
  ]);
  
  return { mistralAI, youtube };
}

// Get model suggestions for common issues
export function getModelSuggestions(): string[] {
  return [
    'mistral-small-latest',
    'mistral-medium-latest',
    'mistral-large-latest',
    'open-mistral-7b'
  ];
}

// Enhanced error handling
export class AIError extends Error {
  constructor(message: string, public code?: string, public retry?: boolean) {
    super(message);
    this.name = 'AIError';
  }
}

export async function generateContent({ 
  sourceType, 
  content, 
  contentType,
  additionalContext = ''
}: GenerateContentOptions): Promise<AIResponse> {
  if (!MISTRAL_API_KEY) {
    throw new AIError('Mistral AI API key is not configured. Please check your environment variables.', 'MISSING_API_KEY', false);
  }

  if (!content?.trim()) {
    throw new AIError('Content cannot be empty', 'EMPTY_CONTENT', false);
  }

  // Retry logic for API calls
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const prompt = buildPrompt(contentType, sourceType, content, additionalContext);
      
      console.log(`Generating ${contentType} content using Mistral AI (attempt ${attempt}/${MAX_RETRIES})...`);
      
      const response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'StudyFlow AI'
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2048,
          temperature: 0.7,
          top_p: 0.8
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        if (response.status === 401) {
          throw new AIError('Mistral AI API key is invalid. Please check your API key configuration.', 'INVALID_API_KEY', false);
        }
        if (response.status === 429) {
          throw new AIError('Mistral AI API rate limit exceeded. Please try again later.', 'RATE_LIMIT', attempt < MAX_RETRIES);
        }
        if (response.status === 402) {
          throw new AIError('Mistral AI API quota exceeded. Please try again later.', 'QUOTA_EXCEEDED', attempt < MAX_RETRIES);
        }
        
        throw new AIError(`Mistral AI API error: ${errorData.error || 'Request failed'}`, 'API_ERROR', attempt < MAX_RETRIES);
      }

      const data = await response.json();
      const responseText = data.choices?.[0]?.message?.content;
      
      if (!responseText?.trim()) {
        throw new AIError('Empty response from AI service', 'EMPTY_RESPONSE', true);
      }
      
      console.log(`AI response received, length: ${responseText.length} characters`);
      
      // Parse and return the response based on content type
      return parseAIResponse(responseText, contentType);
      
    } catch (error) {
      console.error(`AI generation attempt ${attempt} failed:`, error);
      
      // Don't retry for certain errors
      if (error instanceof AIError && !error.retry) {
        throw error;
      }
      
      // Handle specific Mistral AI errors
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new AIError('Mistral AI API key is invalid. Please check your API key configuration.', 'INVALID_API_KEY', false);
        }
        if (error.message.includes('quota') || error.message.includes('limit')) {
          throw new AIError('Mistral AI API quota exceeded. Please try again later or check your API limits.', 'QUOTA_EXCEEDED', attempt < MAX_RETRIES);
        }
        if (error.message.includes('blocked') || error.message.includes('safety')) {
          throw new AIError('Content was blocked by AI safety filters. Please try with different content.', 'CONTENT_BLOCKED', false);
        }
      }
      
      // If this is the last attempt, throw the error
      if (attempt === MAX_RETRIES) {
        throw new AIError(`Failed to generate content after ${MAX_RETRIES} attempts. Please check your internet connection and try again.`, 'MAX_RETRIES_EXCEEDED', false);
      }
      
      // Wait before retrying
      await delay(RETRY_DELAY * attempt);
    }
  }
  
  throw new AIError('Unexpected error in content generation', 'UNKNOWN_ERROR', false);
}

// Helper function to build prompts based on content type
function buildPrompt(contentType: string, sourceType: string, content: string, additionalContext: string): string {
  let prompt = '';
  
  switch (contentType) {
    case 'notes':
      prompt = `Please analyze this ${sourceType} content and create comprehensive, well-structured study notes. 

Guidelines:
- Create clear headings and subheadings
- Include key concepts, definitions, and explanations
- Add bullet points for important details
- Include examples where relevant
- Make the notes easy to study from
- Format as markdown

Content to analyze:
${content}`;
      break;
      
    case 'flashcards':
      prompt = `Create study flashcards from this ${sourceType} content. Generate 5-10 flashcards that test key concepts and important information.

Format each flashcard as:
Q: [Clear, specific question]
A: [Concise, accurate answer]

Make sure questions test understanding, not just memorization. Include concepts, definitions, processes, and key facts.

Content to analyze:
${content}`;
      break;
      
    case 'quiz':
      prompt = `Generate a multiple choice quiz based on this ${sourceType} content. Create 5-8 questions that test comprehension and key concepts.

Format each question as:
1. [Question text]
A) [Option 1]
B) [Option 2] 
C) [Option 3]
D) [Option 4]
*[Mark the correct answer with an asterisk]

Focus on testing understanding of main concepts, not trivial details.

Content to analyze:
${content}`;
      break;
      
    case 'chat':
      prompt = `You are a helpful AI study assistant for students. Be friendly, encouraging, and provide clear explanations. Help with studying, concepts, homework questions, and study tips.

User message: ${content}

Respond helpfully and conversationally.`;
      break;
      
    default:
      prompt = `Analyze this content and provide helpful information: ${content}`;
  }

  if (additionalContext) {
    prompt += `\n\nAdditional context to consider: ${additionalContext}`;
  }
  
  return prompt;
}

// Helper function to parse AI responses
function parseAIResponse(responseText: string, contentType: string): AIResponse {
  try {
    // Try to parse as JSON first
    const jsonResponse = JSON.parse(responseText);
    
    switch (contentType) {
      case 'notes':
        return { notes: jsonResponse.notes || responseText };
      case 'flashcards':
        return { flashcards: jsonResponse.flashcards || parseFlashcards(responseText) };
      case 'quiz':
        return { quiz: jsonResponse.quiz || parseQuizQuestions(responseText) };
      case 'chat':
        return { chat: jsonResponse.chat || responseText };
      default:
        return { notes: responseText };
    }
  } catch (error) {
    // If JSON parsing fails, handle as plain text
    console.log('Response is not JSON, parsing as text...');
    switch (contentType) {
      case 'notes':
        return { notes: responseText };
      case 'flashcards':
        return { flashcards: parseFlashcards(responseText) };
      case 'quiz':
        return { quiz: parseQuizQuestions(responseText) };
      case 'chat':
        return { chat: responseText };
      default:
        return { notes: responseText };
    }
  }
}

// Helper functions to parse AI responses
function parseFlashcards(aiResponse: string): FlashcardGeneration[] {
  try {
    // Try to extract flashcards from text response
    const flashcards: FlashcardGeneration[] = [];
    const lines = aiResponse.split('\n');
    
    let currentCard: Partial<FlashcardGeneration> = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Look for question patterns
      if (trimmed.match(/^(Q|Question|Front)[:.]?\s*/i)) {
        if (currentCard.question && currentCard.answer) {
          flashcards.push(currentCard as FlashcardGeneration);
        }
        currentCard = { question: trimmed.replace(/^(Q|Question|Front)[:.]?\s*/i, '') };
      }
      // Look for answer patterns
      else if (trimmed.match(/^(A|Answer|Back)[:.]?\s*/i) && currentCard.question) {
        currentCard.answer = trimmed.replace(/^(A|Answer|Back)[:.]?\s*/i, '');
      }
      // If we have a question and this looks like an answer
      else if (currentCard.question && !currentCard.answer && trimmed.length > 0) {
        currentCard.answer = trimmed;
      }
    }
    
    // Add the last card if complete
    if (currentCard.question && currentCard.answer) {
      flashcards.push(currentCard as FlashcardGeneration);
    }
    
    // If no cards found, create a default set
    if (flashcards.length === 0) {
      return [
        {
          question: "What is the main topic of this content?",
          answer: "Please refer to the generated notes for the main concepts covered."
        }
      ];
    }
    
    return flashcards;
  } catch (error) {
    console.error('Error parsing flashcards:', error);
    return [
      {
        question: "Content Review",
        answer: "Flashcards could not be generated. Please refer to the AI-generated notes."
      }
    ];
  }
}

function parseQuizQuestions(aiResponse: string): QuizQuestion[] {
  try {
    // Try to extract quiz questions from text response
    const questions: QuizQuestion[] = [];
    const lines = aiResponse.split('\n');
    
    let currentQuestion: Partial<QuizQuestion> = {};
    let optionIndex = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Look for question patterns
      if (trimmed.match(/^\d+\.?\s*/) || trimmed.match(/^(Q|Question)[:.]?\s*/i)) {
        if (currentQuestion.question && currentQuestion.options && currentQuestion.options.length > 0) {
          if (currentQuestion.correctOption === undefined) {
            currentQuestion.correctOption = 0; // Default to first option
          }
          questions.push(currentQuestion as QuizQuestion);
        }
        
        currentQuestion = { 
          question: trimmed.replace(/^\d+\.?\s*|(Q|Question)[:.]?\s*/i, ''),
          options: [],
          correctOption: 0
        };
        optionIndex = 0;
      }
      // Look for option patterns
      else if (trimmed.match(/^[A-D]\)?\s*/) || trimmed.match(/^\d+\)\s*/)) {
        if (currentQuestion.question) {
          const option = trimmed.replace(/^[A-D]\)?\s*|\d+\)\s*/, '');
          if (!currentQuestion.options) currentQuestion.options = [];
          currentQuestion.options.push(option);
          
          // Check if this option is marked as correct
          if (trimmed.includes('*') || trimmed.includes('(correct)')) {
            currentQuestion.correctOption = optionIndex;
          }
          optionIndex++;
        }
      }
    }
    
    // Add the last question if complete
    if (currentQuestion.question && currentQuestion.options && currentQuestion.options.length > 0) {
      if (currentQuestion.correctOption === undefined) {
        currentQuestion.correctOption = 0;
      }
      questions.push(currentQuestion as QuizQuestion);
    }
    
    // If no questions found, create a default set
    if (questions.length === 0) {
      return [
        {
          question: "Based on the content, what would be a good next step for learning?",
          options: [
            "Review the generated notes",
            "Find additional resources", 
            "Practice with flashcards",
            "Discuss with others"
          ],
          correctOption: 0
        }
      ];
    }
    
    return questions;
  } catch (error) {
    console.error('Error parsing quiz questions:', error);
    return [
      {
        question: "Content Review Question",
        options: [
          "Please refer to the AI-generated notes",
          "Quiz could not be generated",
          "Try generating flashcards instead",
          "Check the source content"
        ],
        correctOption: 0
      }
    ];
  }
}

// Function to process YouTube transcripts or file content before sending to AI
export async function preprocessContent(
  content: string, 
  type: 'youtube' | 'file'
): Promise<string> {
  // Add any preprocessing logic here
  // For example, cleaning up YouTube transcripts or formatting file content
  return content;
}

// Simple chat function for direct AI interactions
export async function chatWithAI(message: string): Promise<string> {
  try {
    const response = await generateContent({
      sourceType: 'text',
      content: message,
      contentType: 'chat'
    });
    
    return response.chat || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Chat AI error:', error);
    if (error instanceof AIError) {
      throw error;
    }
    throw new AIError('Failed to get AI response', 'CHAT_ERROR', true);
  }
}

// Function to process uploaded files
export async function processUploadedFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const content = reader.result as string;
        
        // Handle different file types
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          resolve(content);
        } else if (file.type.includes('pdf')) {
          // For PDFs, we'll extract what we can from the text content
          // In a real implementation, you'd use a PDF parser library
          resolve(`PDF Content from ${file.name}:\n\n${content}`);
        } else {
          // For other file types, return basic info
          resolve(`File: ${file.name}
Type: ${file.type}
Size: ${(file.size / 1024).toFixed(2)} KB

Content processing available for text files.`);
        }
      } catch (error) {
        reject(new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    // Read the file as text
    reader.readAsText(file);
  });
}

// Function to process multiple files and generate content
export async function processFilesForContent(
  files: File[], 
  contentType: 'notes' | 'flashcards' | 'quiz'
): Promise<AIResponse> {
  try {
    // Process all files
    const fileContents = await Promise.all(
      files.map(async (file) => {
        try {
          const content = await processUploadedFile(file);
          return `--- ${file.name} ---\n${content}`;
        } catch (error) {
          return `--- ${file.name} (Error reading file) ---\nFile could not be processed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      })
    );
    
    const combinedContent = fileContents.join('\n\n');
    
    // Generate content using AI
    return await generateContent({
      sourceType: 'file',
      content: combinedContent,
      contentType
    });
    
  } catch (error) {
    console.error('File processing error:', error);
    throw new AIError('Failed to process uploaded files', 'FILE_PROCESSING_ERROR', false);
  }
}
