import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  
  // Smooth out the scroll progress using spring physics for a buttery feel
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <div className="fixed top-0 left-0 right-0 h-[2.5px] z-50 pointer-events-none bg-transparent">
      <motion.div
        className="h-full origin-left shadow-sm"
        style={{
          scaleX,
          background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))',
          boxShadow: '0 0 10px rgba(var(--primary-rgb), 0.7)',
        }}
      />
    </div>
  );
};
