'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  BrainCircuit,
  Activity,
  Zap,
  Settings,
  User,
  Box,
  Truck,
  Factory,
  RefreshCcw,
  Volume2,
  VolumeX,
  Terminal,
  ShieldAlert,
  Sparkles,
  Command,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function AiVoiceAssistant() {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [visualizerLines, setVisualizerLines] = useState<number[]>([]);

  // Simulation of voice activity
  useEffect(() => {
    let interval: any;
    if (isListening) {
      interval = setInterval(() => {
        setVisualizerLines(Array.from({ length: 12 }, () => Math.random() * 100));
      }, 100);
    } else {
      setVisualizerLines([]);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const toggleAssistant = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setTimeout(
        () =>
          setResponse(
            'Syntha Hands-Free активен. Складская логистика под вашим контролем. Чем могу помочь?'
          ),
        1000
      );
    }
  };

  const simulateListen = () => {
    setIsListening(true);
    setResponse(null);
    setTranscript('');

    setTimeout(() => {
      setTranscript('Syntha, сколько метров кашемира MAT-CASH-01 осталось на складе?');
      setTimeout(() => {
        setIsListening(false);
        setResponse(
          'На основном складе Syntha Lab осталось 150.5 метров. Текущий резерв: 50 метров. Хватит на 20 единиц пальто Urban Tech.'
        );
      }, 1500);
    }, 2000);
  };

  return (
    <div
      data-testid="ai-voice-assistant"
      className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-3"
    >
      {/* Assistant Window */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-text-primary flex w-80 flex-col overflow-hidden rounded-xl border border-white/10 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 bg-white/5 p-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="text-accent-primary h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">
                  Hands-Free Mode
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-[8px] font-bold uppercase text-white/40">
                  Voice Engine Live
                </span>
              </div>
            </div>

            <div className="max-h-[400px] flex-1 space-y-6 overflow-y-auto p-4">
              {/* Visualizer */}
              <div className="flex h-12 items-center justify-center gap-1">
                {isListening ? (
                  visualizerLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 4 }}
                      animate={{ height: `${line}%` }}
                      className="bg-accent-primary w-1 rounded-full"
                    />
                  ))
                ) : (
                  <div className="flex items-center gap-1 opacity-20">
                    <div className="h-1 w-1 rounded-full bg-white" />
                    <div className="h-1 w-1 rounded-full bg-white" />
                    <div className="h-1 w-1 rounded-full bg-white" />
                  </div>
                )}
              </div>

              {/* Interaction Text */}
              <div className="space-y-4">
                <AnimatePresence>
                  {transcript && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-1"
                    >
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/40">
                        Вы спросили:
                      </p>
                      <p className="text-xs font-medium italic leading-relaxed text-white">
                        "{transcript}"
                      </p>
                    </motion.div>
                  )}
                  {response && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1 border-t border-white/5 pt-4"
                    >
                      <p className="text-accent-primary text-[8px] font-black uppercase tracking-widest">
                        Syntha AI:
                      </p>
                      <p className="text-xs font-medium leading-relaxed text-white/80">
                        {response}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Commands */}
              {!isListening && !response && (
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { icon: Box, label: 'Остатки сырья' },
                    { icon: Truck, label: 'Статус отгрузок' },
                    { icon: Factory, label: 'Загрузка цеха' },
                  ].map((cmd, i) => (
                    <button
                      key={i}
                      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-colors hover:bg-white/10"
                    >
                      <cmd.icon className="text-accent-primary h-3.5 w-3.5" />
                      <span className="text-[9px] font-black uppercase text-white/60 transition-colors group-hover:text-white">
                        {cmd.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-accent-primary p-4">
              <Button
                onClick={simulateListen}
                disabled={isListening}
                className="text-accent-primary flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-white text-[11px] font-black uppercase tracking-widest shadow-2xl transition-transform hover:scale-105"
              >
                {isListening ? (
                  <Activity className="h-4 w-4 animate-pulse" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
                {isListening ? 'Слушаю...' : 'Нажать и спросить'}
              </Button>
              <p className="mt-4 text-center text-[8px] font-bold uppercase tracking-tighter text-white/40">
                Нажмите или скажите «Syntha, отчет»
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        onClick={toggleAssistant}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full shadow-2xl transition-all duration-500',
          isActive ? 'rotate-90 bg-rose-500' : 'bg-accent-primary'
        )}
      >
        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.div
              key="close"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RefreshCcw className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <Mic className="h-6 w-6 text-white" />
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 -z-10 rounded-full bg-white"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
