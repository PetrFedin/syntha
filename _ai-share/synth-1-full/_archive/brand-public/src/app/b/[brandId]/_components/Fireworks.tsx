'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Fireworks = () => {
  const particles = Array.from({ length: 12 });
  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
      <AnimatePresence>
        {particles.map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [1, 1, 0],
              x: Math.cos((i * 30 * Math.PI) / 180) * (50 + Math.random() * 20),
              y: Math.sin((i * 30 * Math.PI) / 180) * (50 + Math.random() * 20),
            }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
              delay: Math.random() * 0.1,
            }}
            className="absolute h-1 w-1 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{
              backgroundColor: i % 3 === 0 ? '#22c55e' : i % 3 === 1 ? '#ff3b30' : '#ffcc00',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
