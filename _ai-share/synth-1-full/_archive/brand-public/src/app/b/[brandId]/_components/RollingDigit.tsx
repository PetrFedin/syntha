'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function RollingDigit({ value }: { value: string }) {
  return (
    <div className="group/digit relative h-7 w-5 overflow-hidden rounded-md bg-black shadow-inner">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={value}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="absolute inset-0 z-10 flex items-center justify-center font-mono text-xs font-black text-white"
        >
          {value === ',' || value === ' ' ? (
            <span className="w-1 bg-transparent text-black"> </span>
          ) : (
            value
          )}
        </motion.div>
      </AnimatePresence>
      {value !== ',' && value !== ' ' && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/40" />
      )}
    </div>
  );
}
