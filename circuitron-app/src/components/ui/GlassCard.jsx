'use client';

import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  glow = false, // Kept for prop compatibility but disabled visually for premium feel
  padding = 'md',
  onClick,
  style,
  ...props
}) {
  const paddingMap = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  return (
    <motion.div
      className={`bg-card border border-border rounded-xl shadow-sm overflow-hidden ${
        hover ? 'cursor-pointer hover:border-muted-foreground/30 hover:bg-secondary/50 transition-colors' : ''
      } ${paddingMap[padding]} ${className}`}
      style={style}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.995 } : {}}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
