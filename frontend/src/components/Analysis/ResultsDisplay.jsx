import { motion } from 'framer-motion';

const ResultsDisplay = ({ result, onVisualize, onFeedback }) => {
  const getClassificationIcon = () => {
    switch (result.classification) {
      case 'toxic':
        return '⚠️';
      case 'offensive':
        return '🚩';
      default:
        return '✅';
    }
  };

  const getClassificationColors = () => {
    switch (result.classification) {
      case 'toxic':
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          text: 'text-red-800 dark:text-red-300',
          border: 'border-red-200 dark:border-red-800',
          progress: 'bg-red-500'
        };
      case 'offensive':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          text: 'text-yellow-800 dark:text-yellow-300',
          border: 'border-yellow-200 dark:border-yellow-800',
          progress: 'bg-yellow-500'
        };
      default:
        return {
          bg: 'bg-green-100 dark:bg-green-900/20',
          text: 'text-green-800 dark:text-green-300',
          border: 'border-green-200 dark:border-green-800',
          progress: 'bg-green-500'
        };
    }
  };

  const colors = getClassificationColors();

  // Function to highlight toxic words if any
  const highlightToxicWords = (text, toxicWords) => {
    if (!toxicWords || !toxicWords.length) return text;
    
    let highlightedText = text;
    toxicWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, `<span class="bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200 px-1 rounded">${word}</span>`);
    });
    return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis Result</h2>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onVisualize}
          className="p-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/30"
        >
          🧠
        </motion.button>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Text Analysis:</h3>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {result.toxic_words 
            ? highlightToxicWords(result.text, result.toxic_words)
            : result.text
          }
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Classification:</h3>
          <div className={`flex items-center space-x-3 p-4 rounded-lg ${colors.bg} ${colors.text} border ${colors.border}`}>
            <span>{getClassificationIcon()}</span>
            <span className="font-medium">{result.classification}</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Confidence Score:</h3>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                {(result.confidence * 100).toFixed(2)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full ${colors.progress}`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onFeedback}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-800 dark:text-gray-200"
        >
          Report incorrect classification
        </button>
      </div>
    </motion.div>
  );
};

export default ResultsDisplay; 