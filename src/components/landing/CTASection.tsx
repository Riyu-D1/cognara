import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Zap } from 'lucide-react';
import { fadeInOnView } from './animations';

interface CTASectionProps {
  onTryApp: () => void;
}

export function CTASection({ onTryApp }: CTASectionProps) {
  return (
    <section className="py-20 px-6 bg-gradient-to-r from-primary to-accent">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div {...fadeInOnView}>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Study Smarter?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Join thousands of successful students and start your journey to better grades today.
          </p>
          <div 
            onClick={onTryApp}
            className="drawing-button drawing-button-type--C cursor-pointer mx-auto"
          >
            <div className="drawing-button__line"></div>
            <div className="drawing-button__line"></div>
            <div className="drawing-button__text">
              <Zap className="w-5 h-5 mr-2" />
              Try StudyFlow Free
            </div>
            <div className="drawing-button__drow1"></div>
            <div className="drawing-button__drow2"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}