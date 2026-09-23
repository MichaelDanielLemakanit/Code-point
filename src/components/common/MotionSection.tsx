import React from 'react';
import { motion, useReducedMotion, Variants } from 'framer-motion';

interface MotionSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  id?: string;
  className?: string;
  delay?: number;
  threshold?: number;
  staggerChildren?: boolean;
}

const sectionVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 36,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1], // Custom smooth ease-out curve
    },
  },
};

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

export const MotionSection: React.FC<MotionSectionProps> = ({
  children,
  id,
  className = '',
  delay = 0,
  threshold = 0.1,
  staggerChildren = false,
  ...rest
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <section id={id} className={className} {...rest}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold, margin: '-40px 0px' }}
      variants={staggerChildren ? staggerContainerVariants : sectionVariants}
      transition={staggerChildren ? undefined : { delay }}
      {...rest}
    >
      {children}
    </motion.section>
  );
};

export const MotionCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverEffect?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}> = ({ children, className = '', delay = 0, hoverEffect = true, style, onClick }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} style={style} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.55,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      whileHover={
        hoverEffect
          ? {
              y: -5,
              transition: { duration: 0.22, ease: 'easeOut' },
            }
          : undefined
      }
      className={className}
      style={style}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
