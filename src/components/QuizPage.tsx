import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ContentInputOptions } from './ContentInputOptions';
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

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    const newResult: QuizResult = {
      questionId: questions[currentQuestion].id,
      selectedAnswer,
      isCorrect
    };

    setQuizResults([...quizResults, newResult]);
    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
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

  const startQuiz = () => {
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
  const availableQuizzes = [
    { id: 1, title: 'Biology Basics', questions: 5, subject: 'Biology', difficulty: 'Easy', lastTaken: '2 days ago' },
    { id: 2, title: 'Chemistry Elements', questions: 8, subject: 'Chemistry', difficulty: 'Medium', lastTaken: '1 week ago' },
    { id: 3, title: 'Physics Laws', questions: 6, subject: 'Physics', difficulty: 'Hard', lastTaken: 'Never' },
    { id: 4, title: 'Math Equations', questions: 10, subject: 'Math', difficulty: 'Medium', lastTaken: '3 days ago' },
  ];

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
    console.log('Saving quiz:', { title: newQuizTitle, questions: newQuizQuestions });
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

  const handleContentSelect = (type: 'youtube' | 'file', content: any) => {
    console.log('Content selected for quiz:', type, content);
    setShowContentOptions(false);
    setShowManualInput(true);
    // Here you would typically process the content and generate quiz questions
    // For now, we'll just show placeholder data
    if (type === 'youtube') {
      setNewQuizTitle(`Quiz from: ${content.url}`);
      setNewQuizQuestions([
        {
          question: 'Sample question based on video content',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: 'AI will generate questions from the YouTube video content'
        },
        {
          question: 'Another sample question from video',
          options: ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'],
          correctAnswer: 1,
          explanation: 'Questions will be automatically created based on key concepts'
        }
      ]);
    } else if (type === 'file') {
      const fileNames = content.files.map((file: File) => file.name).join(', ');
      setNewQuizTitle(`Quiz from: ${fileNames}`);
      setNewQuizQuestions([
        {
          question: 'Sample question from uploaded content',
          options: ['Answer A', 'Answer B', 'Answer C', 'Answer D'],
          correctAnswer: 0,
          explanation: 'AI will extract key information and create quiz questions'
        },
        {
          question: 'Another question from document',
          options: ['Response 1', 'Response 2', 'Response 3', 'Response 4'],
          correctAnswer: 2,
          explanation: 'Questions will be based on the most important concepts in the documents'
        }
      ]);
    }
  };

  const getScore = () => {
    const correct = quizResults.filter(result => result.isCorrect).length;
    return Math.round((correct / questions.length) * 100);
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
              className="p-6 clay-card hover:clay-glow-accent transition-all duration-200"
            >
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={getSubjectColor(quiz.subject)} variant="secondary">
                      {quiz.subject}
                    </Badge>
                    <Badge className={getDifficultyColor(quiz.difficulty)} variant="secondary">
                      {quiz.difficulty}
                    </Badge>
                  </div>
                  
                  <h3 className="text-foreground">{quiz.title}</h3>
                  <p className="text-muted-foreground text-sm">{quiz.questions} questions</p>
                  <p className="text-muted-foreground/70 text-xs">Last taken: {quiz.lastTaken}</p>
                </div>
                
                <Button 
                  onClick={() => startQuiz()}
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
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
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
              <span>Question {currentQuestion + 1} of {questions.length}</span>
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
                <h2 className="text-foreground">{question.question}</h2>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((option, index) => {
                  let buttonClass = "h-16 text-left justify-start rounded-xl transition-all duration-200 border-2";
                  
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
                      <div className="flex items-center space-x-3 w-full">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
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
                        <span className="flex-1 text-left">{option}</span>
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
                    <p className="text-sm opacity-90">{question.explanation}</p>
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
                    {currentQuestion < questions.length - 1 ? (
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