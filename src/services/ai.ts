import { GoogleGenerativeAI } from '@google/generative-ai';

interface GenerateContentOptions {
  sourceType: 'youtube' | 'file';
  content: string;
  contentType: 'notes' | 'flashcards' | 'quiz';
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
}

export async function generateContent({ 
  sourceType, 
  content, 
  contentType,
  additionalContext = ''
}: GenerateContentOptions): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY;
  
  if (!apiKey) {
    throw new Error('Google AI API key is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
  }

  if (additionalContext) {
    prompt += `\n\nAdditional context to consider: ${additionalContext}`;
  }

  try {
    console.log(`Generating ${contentType} content using Google AI...`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    console.log(`AI response received, length: ${responseText.length} characters`);
    
    try {
      // Try to parse as JSON first
      const jsonResponse = JSON.parse(responseText);
      
      // If JSON parsing succeeds, return the appropriate format
      switch (contentType) {
        case 'notes':
          return { notes: jsonResponse.notes || responseText };
        case 'flashcards':
          return { flashcards: jsonResponse.flashcards || parseFlashcards(responseText) };
        case 'quiz':
          return { quiz: jsonResponse.quiz || parseQuizQuestions(responseText) };
        default:
          throw new Error('Invalid content type');
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
        default:
          throw new Error('Invalid content type');
      }
    }
  } catch (error) {
    console.error('Error generating content:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Google AI API key is invalid or not configured properly. Please check your environment variables.');
      } else if (error.message.includes('quota')) {
        throw new Error('Google AI API quota exceeded. Please try again later or check your API limits.');
      } else if (error.message.includes('blocked')) {
        throw new Error('Content was blocked by AI safety filters. Please try with different content.');
      }
    }
    
    throw new Error('Failed to generate content. Please try again or check your internet connection.');
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
