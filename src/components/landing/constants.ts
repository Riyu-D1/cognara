import { 
  Brain, 
  FileText, 
  Zap, 
  HelpCircle, 
  Calendar, 
  Users,
  Clock,
  Award,
  Star
} from 'lucide-react';

export const features = [
  {
    icon: Brain,
    title: "AI-Powered Study Assistant",
    description: "Get personalized help with summaries, flashcards, and practice questions generated from your notes.",
    gradient: "from-accent-indigo to-accent",
    highlight: "Smart AI"
  },
  {
    icon: FileText,
    title: "Smart Note Organization",
    description: "Create, organize, and transform your study materials with intelligent categorization and search.",
    gradient: "from-primary to-accent-cyan",
    highlight: "Organized"
  },
  {
    icon: Zap,
    title: "Interactive Flashcards",
    description: "Dynamic flashcard system with spaced repetition and performance tracking for optimal learning.",
    gradient: "from-accent-cyan to-accent-indigo",
    highlight: "Interactive"
  },
  {
    icon: HelpCircle,
    title: "Adaptive Quizzes",
    description: "Auto-generated quizzes that adapt to your learning progress and identify knowledge gaps.",
    gradient: "from-accent to-primary",
    highlight: "Adaptive"
  },
  {
    icon: Calendar,
    title: "Study Planning",
    description: "Integrated calendar with Pomodoro timer and study session tracking for better time management.",
    gradient: "from-primary to-accent",
    highlight: "Planned"
  },
  {
    icon: Users,
    title: "Collaborative Learning",
    description: "Share study materials, join study groups, and learn together with fellow students.",
    gradient: "from-accent-indigo to-primary",
    highlight: "Social"
  }
];

export const benefits = [
  "Improve study efficiency by up to 40%",
  "AI-generated content saves hours of prep time",
  "Track progress with detailed analytics",
  "Works across all subjects and topics",
  "Collaborative features for group study"
];

export const stats = [
  { number: "10K+", label: "Students Learning", icon: Users },
  { number: "50K+", label: "Study Sessions", icon: Clock },
  { number: "95%", label: "Success Rate", icon: Award },
  { number: "4.8★", label: "User Rating", icon: Star }
];

export const quickActions = [
  { 
    icon: FileText, 
    label: 'Summarize Notes', 
    action: 'Can you summarize my recent notes?',
    gradient: 'from-primary to-accent-cyan'
  },
  { 
    icon: Brain, 
    label: 'Generate Flashcards', 
    action: 'Create flashcards from my notes',
    gradient: 'from-accent-indigo to-accent'
  },
  { 
    icon: HelpCircle, 
    label: 'Practice Quiz', 
    action: 'Generate a practice quiz for me',
    gradient: 'from-accent-cyan to-primary'
  }
];