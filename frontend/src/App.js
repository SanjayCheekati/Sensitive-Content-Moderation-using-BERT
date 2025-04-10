import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from './components/Layout/Hero';
import Sidebar from './components/Layout/Sidebar';
import TextInput from './components/Analysis/TextInput';
import FileUpload from './components/Analysis/FileUpload';
import ResultsDisplay from './components/Analysis/ResultsDisplay';
import FeedbackForm from './components/Feedback/FeedbackForm';
import BertVisualizer from './components/Visualization/BertVisualizer';
import Charts from './components/Visualization/Charts';
import './index.css';

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [fileResults, setFileResults] = useState([]);
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'file'

  // Fetch history when component mounts
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/content/history');
      const data = await response.json();
      console.log('Fetched history:', data);
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleTextAnalysis = async (inputText) => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setText(inputText);
    
    try {
      const response = await fetch('http://localhost:5000/api/content/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();
      setResult(data);
      fetchHistory();
      
      // Scroll to result
      document.getElementById('results-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    setActiveTab('file');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:5000/api/content/classify-file', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setFileResults(data.results);
      fetchHistory();
      
      // Scroll to result
      document.getElementById('results-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (feedback) => {
    try {
      await fetch('http://localhost:5000/api/content/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });
      setShowFeedback(false);
      fetchHistory();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleClearHistory = async () => {
    try {
      await fetch('http://localhost:5000/api/content/clear-history', {
        method: 'DELETE',
      });
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Add fixed position theme toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 z-50"
      >
        {darkMode ? '🌞' : '🌙'}
      </motion.button>
      
      <Sidebar 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        history={history}
        onClearHistory={handleClearHistory}
      />
      
      <Hero />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-center">
            <div className="flex space-x-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md transition-all ${
                  activeTab === 'text' 
                    ? 'bg-white dark:bg-gray-700 shadow-md' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('text')}
              >
                Text Analysis
              </button>
              <button
                className={`px-4 py-2 rounded-md transition-all ${
                  activeTab === 'file' 
                    ? 'bg-white dark:bg-gray-700 shadow-md' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('file')}
              >
                File Upload
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 mb-8">
            <AnimatePresence mode="wait">
              {activeTab === 'text' ? (
                <motion.div
                  key="text-input"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <TextInput onAnalyze={handleTextAnalysis} loading={loading} />
                </motion.div>
              ) : (
                <motion.div
                  key="file-upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <FileUpload onUpload={handleFileUpload} loading={loading} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div id="results-section">
            {activeTab === 'text' && result && (
              <div className="mb-8">
                <ResultsDisplay 
                  result={result} 
                  onVisualize={() => setShowVisualization(true)}
                  onFeedback={() => setShowFeedback(true)}
                />
                
                {showVisualization && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8"
                  >
                    <BertVisualizer 
                      text={text} 
                      result={result}
                      onClose={() => setShowVisualization(false)}
                    />
                  </motion.div>
                )}
                
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8"
                  >
                    <FeedbackForm 
                      result={result} 
                      onSubmit={handleFeedbackSubmit}
                      onClose={() => setShowFeedback(false)}
                    />
                  </motion.div>
                )}
              </div>
            )}
            
            {activeTab === 'file' && fileResults.length > 0 && (
              <div className="mb-8">
                <Charts results={fileResults} />
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowHistory(true)}
            className="fixed left-4 bottom-4 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
          >
            View History
          </button>
        </div>
      </main>
    </div>
  );
}

export default App; 