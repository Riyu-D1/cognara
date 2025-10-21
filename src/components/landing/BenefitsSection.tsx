import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { CheckCircle, ArrowRight, Bot } from 'lucide-react';
import { benefits } from './constants';
import { slideInLeft, slideInRight } from './animations';

interface BenefitsSectionProps {
  onTryApp: () => void;
}

export function BenefitsSection({ onTryApp }: BenefitsSectionProps) {
  return (
    <section id="benefits" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div {...slideInLeft}>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
              Why Students
              <span className="bg-gradient-to-r from-primary to-accent-cyan bg-clip-text text-transparent"> Love StudyNet</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Join thousands of students who have transformed their learning experience and achieved better results.
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <Button 
              onClick={onTryApp}
              size="lg" 
              className="mt-8 clay-button text-white rounded-xl px-8 py-4"
            >
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          <motion.div {...slideInRight} className="relative">
            <Card className="p-8 clay-card border-0 clay-glow-subtle">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-accent-indigo to-accent rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">AI Study Assistant</h4>
                    <p className="text-sm text-muted-foreground">Ready to help 24/7</p>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-xl">
                  <p className="text-sm text-foreground">
                    "Can you create a summary of my biology notes on cellular respiration?"
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-primary to-accent p-4 rounded-xl text-white">
                  <p className="text-sm">
                    "I've created a comprehensive summary covering the three stages of cellular respiration. 
                    I've also generated 10 practice questions to test your understanding!"
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Generated in 2.3 seconds</span>
                  <Badge variant="secondary">85% accuracy boost</Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}