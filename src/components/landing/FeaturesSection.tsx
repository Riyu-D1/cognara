import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { features } from './constants';
import { fadeInUp, staggerContainer, fadeInOnView } from './animations';
import '../../styles/glassmorphism-cards.css';

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16 relative z-10"
          {...fadeInOnView}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Powerful Features for
            <span className="bg-gradient-to-r from-accent-indigo to-accent bg-clip-text text-transparent"> Smart Learning</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to excel in your studies, powered by cutting-edge AI technology.
          </p>
        </motion.div>

        <div className="glass-container">
          {/* Extra animated bubble */}
          <div className="absolute left-1/2 top-1/2 w-[150px] h-[150px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-60 blur-[50px] animate-[float-bubble-3_14s_ease-in-out_infinite] z-0" />
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 w-full"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <div className="glass-card h-full">
                  <div className="flex items-start justify-between mb-3">
                    <span className="glass-card-badge" style={{ color: '#1a202c' }}>{feature.highlight}</span>
                  </div>
                  
                  <div className={`glass-card-icon bg-gradient-to-r ${feature.gradient}`}>
                    <feature.icon className="w-7 h-7" style={{ color: '#1a202c' }} />
                  </div>
                  
                  <h3 className="glass-card-title" style={{ color: '#1a202c' }}>{feature.title}</h3>
                  <p className="glass-card-desc" style={{ color: '#2d3748' }}>{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}