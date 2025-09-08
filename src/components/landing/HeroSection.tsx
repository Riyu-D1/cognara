import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Bot, Lightbulb, Sparkles } from 'lucide-react';
import { stats } from './constants';
import { fadeInUp, staggerContainer } from './animations';

interface HeroSectionProps {
  onTryApp: () => void;
}

export function HeroSection({ onTryApp }: HeroSectionProps) {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <Badge className="mb-4 bg-gradient-to-r from-primary to-accent text-white border-0 px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Study Platform
            </Badge>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight"
          >
            Transform Your
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Study Game</span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto"
          >
            Cognara combines AI intelligence with proven learning techniques to help you study smarter, 
            retain more, and achieve better results in less time.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <div 
              onClick={onTryApp}
              className="drawing-button drawing-button-type--B cursor-pointer"
            >
              <div className="drawing-button__line"></div>
              <div className="drawing-button__line"></div>
              <div className="drawing-button__text">
                <Bot className="w-5 h-5 mr-2 flex-shrink-0" style={{letterSpacing: 'normal'}} />
                <span>Start Learning Now</span>
              </div>
              <div className="drawing-button__drow1"></div>
              <div className="drawing-button__drow2"></div>
            </div>
            <Button 
              variant="outline" 
              className="w-60 h-14 rounded-xl text-lg clay-input border-2 border-primary text-primary hover:bg-primary hover:text-white"
            >
              <Lightbulb className="w-5 h-5 mr-2" />
              See How It Works
            </Button>
          </motion.div>
        </motion.div>

        {/* Hero Stats */}
        <motion.div 
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="text-center"
            >
              <div className="p-6 clay-surface border-0 hover:clay-glow-accent transition-all duration-300 rounded-xl">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}