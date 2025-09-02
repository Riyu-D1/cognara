import React from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Brain, 
  Heart, 
  Target, 
  Users, 
  Lightbulb,
  Code,
  GraduationCap,
  Rocket,
  Star
} from 'lucide-react';
import { fadeInUp, staggerContainer, fadeInOnView } from './landing/animations';

interface AboutPageProps {
  onNavigateBack: () => void;
  onTryApp: () => void;
}

export function AboutPage({ onNavigateBack, onTryApp }: AboutPageProps) {
  const values = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Leveraging cutting-edge artificial intelligence to personalize and enhance the learning experience for every student.",
      gradient: "from-primary to-accent"
    },
    {
      icon: Heart,
      title: "Student-Centered Design",
      description: "Every feature is designed with students in mind, focusing on reducing stress and maximizing learning efficiency.",
      gradient: "from-accent-indigo to-accent-cyan"
    },
    {
      icon: Users,
      title: "Collaborative Learning",
      description: "Building communities where students can learn together, share knowledge, and support each other's growth.",
      gradient: "from-accent-cyan to-primary"
    },
    {
      icon: Rocket,
      title: "Continuous Innovation",
      description: "Constantly evolving with new features and improvements based on student feedback and educational research.",
      gradient: "from-accent to-accent-indigo"
    }
  ];

  const milestones = [
    { year: "2024", title: "StudyFlow Born", description: "The vision for AI-powered learning started" },
    { year: "Q1", title: "Core Features", description: "Notes, flashcards, and AI assistant developed" },
    { year: "Q2", title: "Beta Launch", description: "First students begin using StudyFlow" },
    { year: "Future", title: "Global Impact", description: "Expanding to help students worldwide" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border clay-nav"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onNavigateBack}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center clay-glow-primary">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-foreground">About StudyFlow</span>
            </div>
            
            <div 
              onClick={onTryApp}
              className="drawing-button drawing-button-type--A cursor-pointer"
            >
              <div className="drawing-button__line"></div>
              <div className="drawing-button__line"></div>
              <div className="drawing-button__text">
                Try StudyFlow
              </div>
              <div className="drawing-button__drow1"></div>
              <div className="drawing-button__drow2"></div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <Badge className="mb-4 bg-gradient-to-r from-accent-indigo to-accent-cyan text-white border-0 px-4 py-2 rounded-full">
                <Lightbulb className="w-4 h-4 mr-2" />
                Our Story
              </Badge>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-tight"
            >
              Revolutionizing
              <span className="bg-gradient-to-r from-primary to-accent-cyan bg-clip-text text-transparent"> Student Learning</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-muted-foreground leading-relaxed"
            >
              StudyFlow was born from a simple yet powerful vision: to harness the potential of artificial intelligence 
              to transform how students learn, study, and achieve their academic goals.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid lg:grid-cols-2 gap-16 items-center"
            {...fadeInOnView}
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Meet the
                <span className="bg-gradient-to-r from-accent-indigo to-accent bg-clip-text text-transparent"> Creator</span>
              </h2>
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  StudyFlow was created by a passionate developer and lifelong learner who experienced firsthand 
                  the challenges of modern education. Frustrated by inefficient study methods and scattered tools, 
                  they envisioned a unified platform that could adapt to each student's unique learning style.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  With a background in both technology and education, our founder combines technical expertise 
                  with deep understanding of learning psychology to create tools that truly make a difference 
                  in students' academic journeys.
                </p>
                <div className="flex items-center space-x-4 pt-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                    <Code className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Full-Stack Developer</p>
                    <p className="text-sm text-muted-foreground">Education Technology Enthusiast</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="p-8 clay-card border-0">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-accent-indigo to-accent-cyan rounded-full flex items-center justify-center mx-auto mb-6 clay-elevated">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  "To democratize access to personalized, AI-powered education tools that help every student 
                  reach their full potential, regardless of their learning style or background."
                </p>
                <div className="flex justify-center">
                  <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20">
                    <Star className="w-3 h-3 mr-1" />
                    Education for All
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Vision & Values */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            {...fadeInOnView}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Vision &
              <span className="bg-gradient-to-r from-primary to-accent-cyan bg-clip-text text-transparent"> Values</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We believe that every student deserves access to intelligent, adaptive learning tools that 
              make studying more effective, engaging, and enjoyable.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {values.map((value, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-6 h-full clay-card border-0 hover:clay-glow-accent transition-all duration-300 text-center">
                  <div className={`w-12 h-12 bg-gradient-to-r ${value.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 clay-elevated`}>
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* The Idea Behind StudyFlow */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            {...fadeInOnView}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              The Idea Behind
              <span className="bg-gradient-to-r from-accent-indigo to-accent bg-clip-text text-transparent"> StudyFlow</span>
            </h2>
          </motion.div>

          <motion.div 
            className="space-y-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="p-8 clay-card border-0">
                <h3 className="text-xl font-semibold text-foreground mb-4">The Problem</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Traditional study methods are often inefficient and one-size-fits-all. Students struggle with 
                  scattered notes, ineffective memorization techniques, and lack of personalized feedback. 
                  The digital age has brought information overload rather than intelligent organization.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-8 clay-card border-0 clay-glow-subtle">
                <h3 className="text-xl font-semibold text-foreground mb-4">The Solution</h3>
                <p className="text-muted-foreground leading-relaxed">
                  StudyFlow combines the power of artificial intelligence with proven learning methodologies. 
                  Our platform adapts to each student's learning patterns, automatically generates study materials, 
                  and provides intelligent insights to optimize study sessions and improve retention.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-8 clay-card border-0">
                <h3 className="text-xl font-semibold text-foreground mb-4">The Impact</h3>
                <p className="text-muted-foreground leading-relaxed">
                  By making learning more efficient and personalized, StudyFlow helps students achieve better 
                  academic results while reducing stress and study time. Our goal is to transform the educational 
                  experience for millions of students worldwide.
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            {...fadeInOnView}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Journey</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              From concept to reality - the StudyFlow timeline
            </p>
          </motion.div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center clay-elevated flex-shrink-0">
                  <span className="text-white font-semibold text-sm">{milestone.year}</span>
                </div>
                <Card className="flex-1 p-6 clay-card border-0">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeInOnView}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Join Our Mission
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Be part of the learning revolution. Experience the future of education with StudyFlow.
            </p>
            <div 
              onClick={onTryApp}
              className="drawing-button drawing-button-type--C cursor-pointer mx-auto"
            >
              <div className="drawing-button__line"></div>
              <div className="drawing-button__line"></div>
              <div className="drawing-button__text">
                <Brain className="w-5 h-5 mr-2" />
                Start Your Journey
              </div>
              <div className="drawing-button__drow1"></div>
              <div className="drawing-button__drow2"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-foreground">StudyFlow</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <button onClick={onNavigateBack} className="hover:text-foreground transition-colors">Home</button>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 StudyFlow. Empowering students to achieve more.
          </div>
        </div>
      </footer>
    </div>
  );
}