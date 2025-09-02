import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { features } from './constants';
import { fadeInUp, staggerContainer, fadeInOnView } from './animations';

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
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

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="p-8 h-full clay-card border-0 hover:clay-glow-accent transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mr-4 clay-elevated group-hover:clay-glow-primary`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.highlight}
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}