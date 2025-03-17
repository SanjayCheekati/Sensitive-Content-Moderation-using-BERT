import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaStepForward, FaRedo, FaTimes } from 'react-icons/fa';

const BertVisualizer = ({ text, onClose }) => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [attention, setAttention] = useState([]);

  const steps = [
    { id: 0, title: 'Input Text', description: 'Raw text before processing' },
    { id: 1, title: 'Tokenization', description: 'Breaking text into tokens' },
    { id: 2, title: 'Embedding', description: 'Converting tokens to vectors' },
    { id: 3, title: 'Self-Attention', description: 'Analyzing relationships between tokens' },
    { id: 4, title: 'Classification', description: 'Final prediction' }
  ];

  useEffect(() => {
    if (text) {
      // Simulate tokenization
      const simpleTokens = text
        .split(/\s+/)
        .filter(Boolean)
        .map((word, i) => ({
          id: i,
          text: word,
          vector: Array(8).fill(0).map(() => Math.random())
        }));
      setTokens(simpleTokens);

      // Simulate attention scores
      const attentionMatrix = simpleTokens.map(() => 
        simpleTokens.map(() => Math.random())
      );
      setAttention(attentionMatrix);
    }
  }, [text]);

  useEffect(() => {
    let interval;
    if (isPlaying && step < steps.length - 1) {
      interval = setInterval(() => {
        setStep(prev => prev + 1);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, step, steps.length]);

  const handlePlay = () => setIsPlaying(!isPlaying);
  const handleStep = () => setStep(prev => Math.min(prev + 1, steps.length - 1));
  const handleReset = () => {
    setStep(0);
    setIsPlaying(false);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="font-mono">{text}</p>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-wrap gap-2">
            {tokens.map((token, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-md"
              >
                {token.text}
              </motion.div>
            ))}
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tokens.map((token, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg"
              >
                <div className="font-mono text-sm mb-2 text-purple-800 dark:text-purple-200">{token.text}</div>
                <div className="h-20 flex items-end space-x-1">
                  {token.vector.map((v, j) => (
                    <motion.div
                      key={j}
                      initial={{ height: 0 }}
                      animate={{ height: `${v * 100}%` }}
                      transition={{ delay: i * 0.1 + j * 0.05 }}
                      className="w-2 bg-purple-500 dark:bg-purple-400"
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid" 
                style={{ 
                  gridTemplateColumns: `repeat(${tokens.length + 1}, minmax(60px, 1fr))` 
                }}
              >
                <div className=""></div>
                {tokens.map((token, i) => (
                  <div key={i} className="font-mono text-sm text-center p-2 text-gray-700 dark:text-gray-300">
                    {token.text}
                  </div>
                ))}
                {tokens.map((fromToken, i) => (
                  <>
                    <div key={`row-label-${i}`} className="font-mono text-sm p-2 text-gray-700 dark:text-gray-300">
                      {fromToken.text}
                    </div>
                    {tokens.map((toToken, j) => (
                      <motion.div 
                        key={`cell-${i}-${j}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: (i * tokens.length + j) * 0.01 }}
                        className="p-2"
                        style={{
                          backgroundColor: `rgba(59, 130, 246, ${attention[i][j]})`,
                        }}
                      >
                      </motion.div>
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              Classification Result
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="px-6 py-3 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full text-lg"
            >
              Neutral
            </motion.div>
            <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ delay: 0.5, duration: 1 }}
                className="bg-green-500 h-4 rounded-full"
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Confidence: 75%
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">BERT Visualization</h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePlay}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button
            onClick={handleStep}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={step === steps.length - 1}
            aria-label="Next step"
          >
            <FaStepForward />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Reset"
          >
            <FaRedo />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-gray-900 dark:text-white">{steps[step].title}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Step {step + 1} of {steps.length}
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {steps[step].description}
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <motion.div 
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            className="h-2 bg-blue-600 rounded-full"
          />
        </div>
      </div>

      <div className="min-h-[300px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BertVisualizer; 