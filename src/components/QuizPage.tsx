import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ContentInputOptions } from './ContentInputOptions';
import LoadingAnimations from './LoadingAnimations';
import { useStudyMaterials } from './StudyMaterialsContext';
import { quizzesService } from '../services/database';
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  RotateCcw,
  Trophy,
  Clock,
  Target,
  Brain,
  Plus,
  Play,
  List,
  Save,
  X,
  Trash2,
  Keyboard
} from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Screen } from '../utils/constants';

interface QuizPageProps {
  onNavigate: (screen: Screen) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  explanation: string;
}

interface QuizResult {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
}

export function QuizPage({ onNavigate }: QuizPageProps) {
  const [viewMode, setViewMode] = useState<'list' | 'quiz' | 'create'>('list');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizQuestions, setNewQuizQuestions] = useState<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[]>([{
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  }]);
  const [showContentOptions, setShowContentOptions] = useState(true);
  const [showManualInput, setShowManualInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // Use centralized study materials context
  const { quizzes: savedQuizzes, setQuizzes: setSavedQuizzes, isLoading, isReady } = useStudyMaterials();
  const [showLoading, setShowLoading] = useState(false);

  // Show loading only if context is still loading and it takes >300ms
  useEffect(() => {
    let loadingTimer: NodeJS.Timeout | null = null;
    
    if (isLoading) {
      loadingTimer = setTimeout(() => {
        if (isLoading) {
          setShowLoading(true);
        }
      }, 300);
    } else {
      setShowLoading(false);
    }

    return () => {
      if (loadingTimer) clearTimeout(loadingTimer);
    };
  }, [isLoading]);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

  // Initial quiz questions
  const questions: Question[] = [
    {
      id: 1,
      question: "What is the powerhouse of the cell?",
      options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic Reticulum"],
      correctAnswer: 1,
      subject: "Biology",
      explanation: "Mitochondria are called the powerhouse of the cell because they produce ATP through cellular respiration."
    },
    {
      id: 2,
      question: "Which process converts light energy into chemical energy in plants?",
      options: ["Respiration", "Photosynthesis", "Fermentation", "Transpiration"],
      correctAnswer: 1,
      subject: "Biology",
      explanation: "Photosynthesis is the process by which plants convert light energy into chemical energy (glucose)."
    },
    {
      id: 3,
      question: "What is the chemical symbol for gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      correctAnswer: 2,
      subject: "Chemistry",
      explanation: "Au comes from the Latin word 'aurum' meaning gold."
    },
    {
      id: 4,
      question: "What is Newton's First Law of Motion?",
      options: [
        "F = ma", 
        "Objects in motion stay in motion unless acted upon by a force",
        "For every action there is an equal and opposite reaction",
        "Energy cannot be created or destroyed"
      ],
      correctAnswer: 1,
      subject: "Physics",
      explanation: "Newton's First Law states that an object at rest stays at rest, and an object in motion stays in motion, unless acted upon by a net external force."
    },
    {
      id: 5,
      question: "What is the value of π (pi) to two decimal places?",
      options: ["3.14", "3.16", "3.12", "3.18"],
      correctAnswer: 0,
      subject: "Math",
      explanation: "π (pi) is approximately 3.14159, which rounds to 3.14 to two decimal places."
    }
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuizQuestions[currentQuestion].correctAnswer;
    const newResult: QuizResult = {
      questionId: currentQuizQuestions[currentQuestion].id,
      selectedAnswer,
      isCorrect
    };

    setQuizResults([...quizResults, newResult]);
    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < currentQuizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setIsQuizComplete(true);
      }
    }, 2000);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizResults([]);
    setIsQuizComplete(false);
    setTimeElapsed(0);
  };

  const startQuiz = (quizId?: number) => {
    if (quizId) {
      setSelectedQuizId(quizId);
    }
    setViewMode('quiz');
    restartQuiz();
  };

  const addNewQuestion = () => {
    setNewQuizQuestions([...newQuizQuestions, {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    }]);
  };

  // Mock quiz data for the list view
  // Combine initial mock quizzes with saved quizzes
  const mockQuizzes = [
    { id: 1, title: 'Biology Basics', questions: 2, subject: 'Biology', difficulty: 'Easy', lastTaken: '2 days ago' },
    { id: 2, title: 'Chemistry Elements', questions: 1, subject: 'Chemistry', difficulty: 'Medium', lastTaken: '1 week ago' },
    { id: 3, title: 'Physics Laws', questions: 1, subject: 'Physics', difficulty: 'Hard', lastTaken: 'Never' },
  ];
  
  const availableQuizzes = [
    ...savedQuizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      questions: quiz.questions.length,
      subject: quiz.questions[0]?.subject || 'General',
      difficulty: 'Medium',
      lastTaken: 'Never',
      createdAt: quiz.createdAt,
      isSaved: true // Flag to identify saved quizzes
    })),
    ...mockQuizzes.map(quiz => ({
      ...quiz,
      isSaved: false // Flag to identify mock quizzes
    }))
  ];

  console.log('Saved quizzes:', savedQuizzes);
  console.log('Available quizzes:', availableQuizzes);

  // Get current quiz questions based on selection
  const getCurrentQuestions = () => {
    if (selectedQuizId) {
      const selectedQuiz = savedQuizzes.find(quiz => quiz.id === selectedQuizId);
      if (selectedQuiz) {
        return selectedQuiz.questions;
      }
    }
    return questions; // Default questions
  };

  const currentQuizQuestions = getCurrentQuestions();

  const removeQuestion = (index: number) => {
    if (newQuizQuestions.length > 1) {
      setNewQuizQuestions(newQuizQuestions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...newQuizQuestions];
    if (field === 'options') {
      updated[index].options = value;
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setNewQuizQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...newQuizQuestions];
    updated[questionIndex].options[optionIndex] = value;
    setNewQuizQuestions(updated);
  };

  const saveQuiz = () => {
    if (!newQuizTitle.trim() || newQuizQuestions.length === 0 || newQuizQuestions.some(q => !q.question.trim() || q.options.some(opt => !opt.trim()))) return;
    
    const newQuiz = {
      id: Date.now(),
      title: newQuizTitle,
      questions: newQuizQuestions.map((q, index) => ({
        id: index + 1,
        question: q.question.trim(),
        options: q.options.map(opt => opt.trim()),
        correctAnswer: q.correctAnswer,
        subject: 'General', // Could be detected or selected
        explanation: q.explanation.trim() || 'No explanation provided'
      })),
      createdAt: 'Just now'
    };

    // Add new quiz to saved quizzes
    setSavedQuizzes([newQuiz, ...savedQuizzes]);
    
    console.log('Quiz saved successfully:', newQuiz);
    setNewQuizTitle('');
    setNewQuizQuestions([{
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    }]);
    setShowContentOptions(true);
    setShowManualInput(false);
    setViewMode('list');
  };

  const deleteQuiz = async (quizId: number) => {
    console.log('🗑️ QuizPage: Deleting quiz:', quizId);
    
    try {
      // First, remove from local state for immediate UI update
      setSavedQuizzes(savedQuizzes.filter(quiz => quiz.id !== quizId));
      
      // Also remove from localStorage
      const dataStr = localStorage.getItem('studyflow-quizzes');
      if (dataStr) {
        const quizzes = JSON.parse(dataStr);
        const updatedQuizzes = quizzes.filter((q: any) => q.id !== quizId);
        localStorage.setItem('studyflow-quizzes', JSON.stringify(updatedQuizzes));
        
        // Trigger storage event for other components
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'studyflow-quizzes',
          newValue: JSON.stringify(updatedQuizzes),
          oldValue: dataStr
        }));
      }
      
      // If the quiz has a database ID, delete it from database too
      const quizInStorage = dataStr ? JSON.parse(dataStr).find((q: any) => q.id === quizId) : null;
      if (quizInStorage?.db_id && navigator.onLine) {
        console.log(`☁️ Deleting quiz ${quizInStorage.db_id} from database...`);
        const dbSuccess = await quizzesService.deleteQuiz(quizInStorage.db_id);
        if (dbSuccess) {
          console.log(`✅ Successfully deleted quiz from database`);
        } else {
          console.warn(`⚠️ Failed to delete quiz from database`);
        }
      } else {
        console.log(`📝 Quiz has no database ID or offline - local deletion only`);
      }
      
      console.log('✅ QuizPage: Quiz deleted successfully');
    } catch (error) {
      console.error('❌ QuizPage: Error deleting quiz:', error);
      // Restore quiz if deletion failed
      if (savedQuizzes.find(quiz => quiz.id === quizId) === undefined) {
        const dataStr = localStorage.getItem('studyflow-quizzes');
        if (dataStr) {
          const quizzes = JSON.parse(dataStr);
          setSavedQuizzes(quizzes);
        }
      }
    }
  };

  const handleContentSelect = async (type: 'youtube' | 'file', content: any) => {
    console.log('Content selected for quiz:', type, content);
    setShowContentOptions(false);
    setShowManualInput(true);
    setIsProcessing(true);
    
    if (type === 'youtube') {
      try {
        setNewQuizTitle(`Quiz from: ${content.url}`);
        setNewQuizQuestions([
          {
            question: '🤖 AI is analyzing the YouTube video and generating quiz questions...',
            options: ['Please wait...', 'Processing content...', 'Creating questions...', 'Almost done...'],
            correctAnswer: 0,
            explanation: 'AI is working on your quiz questions.'
          }
        ]);

        // Extract video ID and get video info
        const videoId = extractVideoId(content.url);
        if (!videoId) throw new Error('Invalid YouTube URL');

        const videoInfo = await getYouTubeVideoInfo(content.url);
        
        // Use AI to generate quiz questions
        const { generateContent } = await import('../services/ai');
        
        const aiResponse = await generateContent({
          sourceType: 'youtube',
          content: `Title: ${videoInfo.title}\nDescription: ${videoInfo.description}`,
          contentType: 'quiz',
          additionalContext: 'Generate 5-6 multiple choice quiz questions that test comprehension of key concepts'
        });

        // Parse AI response to extract quiz questions
        const quizQuestions = aiResponse.quiz || [];
        
        setNewQuizTitle(`${videoInfo.title} - Quiz`);
        setNewQuizQuestions(quizQuestions.length > 0 ? quizQuestions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctOption,
          explanation: 'Quiz question from video content'
        })) : [
          {
            question: 'What is the main topic covered in this video?',
            options: [videoInfo.title, 'Other topic', 'Different subject', 'None of the above'],
            correctAnswer: 0,
            explanation: 'The video primarily covers: ' + videoInfo.title
          }
        ]);
        
        setIsProcessing(false);

      } catch (error) {
        console.error('Error processing YouTube video for quiz:', error);
        setNewQuizQuestions([
          {
            question: '❌ Error processing video. Please check the URL and try again.',
            options: ['Try again', 'Check URL', 'Manual input', 'Contact support'],
            correctAnswer: 0,
            explanation: 'There was an issue processing the YouTube video.'
          }
        ]);
        setIsProcessing(false);
      }
    } else if (type === 'file') {
      const fileNames = content.files.map((file: File) => file.name).join(', ');
      setNewQuizTitle(`Quiz from: ${fileNames}`);
      setNewQuizQuestions([
        {
          question: '📄 File processing for quizzes will be implemented soon.',
          options: ['Create manually', 'Upload different file', 'Try YouTube instead', 'Wait for update'],
          correctAnswer: 0,
          explanation: 'You can create quiz questions manually for now.'
        }
      ]);
      setIsProcessing(false);
    }
  };

  // Helper functions for quiz page
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  const getYouTubeVideoInfo = async (url: string) => {
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');

    try {
      console.log('Fetching YouTube video info for ID:', videoId);
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`;
      console.log('YouTube API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('YouTube API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube API error response:', errorText);
        throw new Error(`YouTube API request failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('YouTube API response data:', data);
      const video = data.items?.[0];
      
      if (!video) throw new Error('Video not found or may be private/restricted');

      return {
        title: video.snippet?.title ?? 'Untitled',
        description: video.snippet?.description ?? 'No description available',
        videoId
      };
    } catch (error) {
      console.error('YouTube API error:', error);
      throw error;
    }
  };

  const parseQuizFromAI = (text: string) => {
    const questions = [];
    const sections = text.split(/Question:|^\d+\./m).filter(section => section.trim());
    
    for (const section of sections) {
      try {
        const lines = section.split('\n').map(line => line.trim()).filter(line => line);
        if (lines.length < 5) continue;

        const questionText = lines[0];
        const options: string[] = [];
        let correctAnswer = 0;
        let explanation = '';

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          
          if (line.match(/^[A-D]\)/)) {
            options.push(line.substring(2).trim());
          } else if (line.match(/^Correct:/i)) {
            const correctLetter = line.match(/[A-D]/)?.[0];
            if (correctLetter) {
              correctAnswer = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);
            }
          } else if (line.match(/^Explanation:/i)) {
            explanation = line.replace(/^Explanation:/i, '').trim();
          }
        }

        if (questionText && options.length >= 4) {
          questions.push({
            question: questionText,
            options: options,
            correctAnswer: correctAnswer,
            explanation: explanation || 'No explanation provided.'
          });
        }
      } catch (error) {
        console.log('Error parsing quiz question:', error);
      }
    }

    return questions;
  };

  const getScore = () => {
    const correct = quizResults.filter(result => result.isCorrect).length;
    return Math.round((correct / currentQuizQuestions.length) * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-primary';
    if (score >= 50) return 'text-accent-cyan';
    return 'text-destructive';
  };

  if (viewMode === 'create') {
    return (
      <div className="p-8 space-y-8 bg-background">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-foreground">Create Quiz</h1>
            <p className="text-muted-foreground">Build your own quiz questions</p>
          </div>
          <Button 
            onClick={() => setViewMode('list')}
            variant="outline"
            className="clay-button rounded-xl"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Content Input Options */}
          {showContentOptions && (
            <Card className="p-6 clay-card">
              <ContentInputOptions 
                onContentSelect={handleContentSelect}
                acceptedTypes={['.pdf', '.docx', '.txt', '.pptx', '.md']}
              />
              
              <div className="mt-6 pt-6 border-t border-border">
                <Button
                  onClick={() => {
                    setShowContentOptions(false);
                    setShowManualInput(true);
                  }}
                  variant="outline"
                  className="w-full clay-button rounded-xl"
                >
                  <Keyboard className="w-4 h-4 mr-2" />
                  Or create quiz questions manually
                </Button>
              </div>
            </Card>
          )}

          {/* Manual Input */}
          {(showManualInput || !showContentOptions) && (
            <>
              {/* Quiz Title */}
              <Card className="p-6 clay-card">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-foreground">Quiz Title</label>
                    {!showContentOptions && (
                      <Button
                        onClick={() => {
                          setShowContentOptions(true);
                          setShowManualInput(false);
                          setNewQuizTitle('');
                          setNewQuizQuestions([{
                            question: '',
                            options: ['', '', '', ''],
                            correctAnswer: 0,
                            explanation: ''
                          }]);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Back to content options
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Enter quiz title..."
                    value={newQuizTitle}
                    onChange={(e) => setNewQuizTitle(e.target.value)}
                    className="clay-input"
                  />
                </div>
              </Card>

              {/* Processing Animation */}
              {isProcessing && (
                <Card className="p-6 clay-card border-0">
                  <LoadingAnimations variant="typewriter" ariaLabel="AI is generating your quiz questions" />
                  <p className="text-center text-primary mt-4">AI is analyzing your content and creating quiz questions...</p>
                </Card>
              )}

              {/* Questions */}
              <div className="space-y-6">
                {newQuizQuestions.map((question, qIndex) => (
                  <Card key={qIndex} className="p-6 clay-card">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-foreground">Question {qIndex + 1}</h3>
                        {newQuizQuestions.length > 1 && (
                          <Button
                            onClick={() => removeQuestion(qIndex)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Question Text */}
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm">Question</label>
                        <Textarea
                          placeholder="Enter your question..."
                          value={question.question}
                          onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                          className="clay-input resize-none"
                        />
                      </div>

                      {/* Options */}
                      <div className="space-y-3">
                        <label className="text-muted-foreground text-sm">Answer Options</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={question.correctAnswer === oIndex}
                                onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                className="text-primary accent-primary"
                              />
                              <Input
                                placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                value={option}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                className="clay-input"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm">Explanation (Optional)</label>
                        <Textarea
                          placeholder="Explain why this is the correct answer..."
                          value={question.explanation}
                          onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                          className="clay-input resize-none"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Action Buttons */}
          {(showManualInput || !showContentOptions) && (
            <div className="flex items-center justify-between">
              <Button
                onClick={addNewQuestion}
                variant="outline"
                className="clay-button rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Question
              </Button>
              
              <Button
                onClick={saveQuiz}
                disabled={!newQuizTitle.trim() || newQuizQuestions.some(q => !q.question.trim() || q.options.some(opt => !opt.trim()))}
                className="clay-button text-white rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Quiz
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    if (showLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <LoadingAnimations variant="words" ariaLabel="Loading your quizzes" />
        </div>
      );
    }

    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'Easy': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200';
        case 'Medium': return 'bg-accent-cyan/10 dark:bg-accent-cyan/20 text-accent-cyan dark:text-accent-cyan';
        case 'Hard': return 'bg-destructive/10 dark:bg-destructive/20 text-destructive dark:text-destructive';
        default: return 'bg-muted text-muted-foreground';
      }
    };

    const getSubjectColor = (subject: string) => {
      const colors = {
        'Biology': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
        'Chemistry': 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary',
        'Physics': 'bg-accent/10 dark:bg-accent/20 text-accent dark:text-accent',
        'Math': 'bg-accent-indigo/10 dark:bg-accent-indigo/20 text-accent-indigo dark:text-accent-indigo',
      };
      return colors[subject as keyof typeof colors] || 'bg-muted text-muted-foreground';
    };

    return (
      <div className="p-8 space-y-8 bg-background">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-foreground">Quizzes</h1>
            <p className="text-muted-foreground">
              Practice and test your knowledge • {availableQuizzes.length} quizzes available
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => setViewMode('create')}
              className="clay-button text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Quiz
            </Button>
          </div>
        </div>

        {/* Quiz Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableQuizzes.map((quiz) => (
            <Card 
              key={quiz.id}
              className="p-6 clay-card hover:clay-glow-accent transition-all duration-200 group"
            >
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={getSubjectColor(quiz.subject)} variant="secondary">
                        {quiz.subject}
                      </Badge>
                      <Badge className={getDifficultyColor(quiz.difficulty)} variant="secondary">
                        {quiz.difficulty}
                      </Badge>
                    </div>
                    
                    {/* Delete Button - only show for saved quizzes */}
                    {quiz.isSaved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuiz(quiz.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <h3 className="text-foreground">{quiz.title}</h3>
                  <p className="text-muted-foreground text-sm">{quiz.questions} questions</p>
                  <p className="text-muted-foreground/70 text-xs">Last taken: {quiz.lastTaken}</p>
                </div>
                
                <Button 
                  onClick={() => startQuiz(quiz.id)}
                  className="w-full clay-button text-white rounded-xl"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Quiz
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Quiz Stats */}
        <Card className="p-6 clay-card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-2 clay-elevated">
                <List className="w-6 h-6 text-white" />
              </div>
              <p className="text-foreground">{availableQuizzes.length}</p>
              <p className="text-muted-foreground text-sm">Total Quizzes</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto mb-2 clay-elevated">
                <Target className="w-6 h-6 text-white" />
              </div>
              <p className="text-foreground">78%</p>
              <p className="text-muted-foreground text-sm">Avg. Score</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-indigo rounded-xl flex items-center justify-center mx-auto mb-2 clay-elevated">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <p className="text-foreground">15</p>
              <p className="text-muted-foreground text-sm">Completed</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-2 clay-elevated">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <p className="text-foreground">4</p>
              <p className="text-muted-foreground text-sm">Perfect Scores</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (viewMode === 'quiz' && isQuizComplete) {
    const score = getScore();
    return (
      <div className="p-8 space-y-8 bg-background">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto clay-glow-primary">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-foreground">Quiz Complete!</h1>
            <p className="text-muted-foreground">Great job! Here are your results.</p>
          </div>

          {/* Score Card */}
          <Card className="p-8 clay-card">
            <div className="space-y-6">
              <div className="text-center">
                <p className={`text-6xl font-bold ${getScoreColor(score)}`}>{score}%</p>
                <p className="text-muted-foreground mt-2">Your Score</p>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-2 clay-elevated">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-foreground">{quizResults.filter(r => r.isCorrect).length}</p>
                  <p className="text-muted-foreground text-sm">Correct</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-destructive rounded-xl flex items-center justify-center mx-auto mb-2 clay-elevated">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-foreground">{quizResults.filter(r => !r.isCorrect).length}</p>
                  <p className="text-muted-foreground text-sm">Incorrect</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-2 clay-elevated">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-foreground">{Math.floor(timeElapsed / 60)}m</p>
                  <p className="text-muted-foreground text-sm">Time</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <Button 
              onClick={restartQuiz}
              variant="outline"
              className="clay-button rounded-xl"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              onClick={() => onNavigate('flashcards')}
              className="clay-button text-white rounded-xl"
            >
              <Brain className="w-4 h-4 mr-2" />
              Study More
            </Button>
            
            <Button 
              onClick={() => setViewMode('list')}
              variant="outline"
              className="clay-button rounded-xl"
            >
              Back to Quizzes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'quiz') {
    const question = currentQuizQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / currentQuizQuestions.length) * 100;
    const isCorrectAnswer = showResult && selectedAnswer === question.correctAnswer;
    const isWrongAnswer = showResult && selectedAnswer !== question.correctAnswer;

    return (
      <div className="p-8 space-y-8 bg-background min-h-screen">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground">Quiz Time</h1>
              <p className="text-muted-foreground">Test your knowledge</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-primary border-primary">
                {question.subject}
              </Badge>
              <Button 
                onClick={() => setViewMode('list')}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                Exit Quiz
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {currentQuizQuestions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Quiz Card */}
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 clay-card">
            <div className="space-y-8">
              {/* Question */}
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto clay-glow-primary">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-foreground text-xl md:text-2xl leading-relaxed px-4">{question.question}</h2>
              </div>

              {/* Answer Options */}
              <div className="space-y-4">
                {question.options.map((option, index) => {
                  let buttonClass = "min-h-16 py-4 px-6 text-left justify-start rounded-xl transition-all duration-200 border-2 w-full";
                  
                  if (showResult) {
                    if (index === question.correctAnswer) {
                      buttonClass += " border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                    } else if (index === selectedAnswer && selectedAnswer !== question.correctAnswer) {
                      buttonClass += " border-destructive bg-destructive/10 text-destructive";
                    } else {
                      buttonClass += " border-border bg-muted/50 text-muted-foreground";
                    }
                  } else {
                    if (selectedAnswer === index) {
                      buttonClass += " border-primary bg-primary/10 text-primary clay-glow-primary";
                    } else {
                      buttonClass += " border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5";
                    }
                  }

                  return (
                    <Button
                      key={index}
                      onClick={() => !showResult && handleAnswerSelect(index)}
                      disabled={showResult}
                      className={buttonClass}
                      variant="ghost"
                    >
                      <div className="flex items-start space-x-4 w-full">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-1 ${
                          showResult && index === question.correctAnswer 
                            ? 'bg-green-500 text-white'
                            : showResult && index === selectedAnswer && selectedAnswer !== question.correctAnswer
                            ? 'bg-destructive text-white'
                            : selectedAnswer === index
                            ? 'bg-primary text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-1 text-left leading-relaxed whitespace-normal break-words">{option}</span>
                      </div>
                    </Button>
                  );
                })}
              </div>

              {/* Result Message */}
              {showResult && (
                <div className="text-center space-y-4">
                  <div className={`p-4 rounded-xl ${
                    isCorrectAnswer 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    <p className="font-medium mb-2">
                      {isCorrectAnswer ? '🎉 Correct!' : '❌ Incorrect'}
                    </p>
                    <p className="text-sm opacity-90 leading-relaxed whitespace-normal break-words">{question.explanation}</p>
                  </div>
                </div>
              )}

              {/* Next Button */}
              {selectedAnswer !== null && !showResult && (
                <div className="text-center">
                  <Button
                    onClick={handleNextQuestion}
                    className="clay-button text-white rounded-xl"
                  >
                    {currentQuestion < currentQuizQuestions.length - 1 ? (
                      <>
                        Next Question
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      'Finish Quiz'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }
}