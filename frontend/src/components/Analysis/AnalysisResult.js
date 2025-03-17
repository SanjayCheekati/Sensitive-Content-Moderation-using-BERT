import { motion } from 'framer-motion';

const AnalysisResult = ({ result }) => {
  const highlightToxicWords = (text, toxicWords) => {
    if (!toxicWords || !toxicWords.length) return text;
    
    let highlightedText = text;
    toxicWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      highlightedText = highlightedText.replace(regex, `<span class="bg-red-500/30 text-red-200 px-1 rounded">${word}</span>`);
    });
    return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="glass-card rounded-xl p-8"
      id="analysis-result"
    >
      <h2 className="text-2xl font-semibold mb-6 text-gray-100">Analysis Result</h2>
      
      <div className="space-y-6">
        <div>
          <p className="text-gray-400 mb-2">Text Analysis:</p>
          <div className="p-4 rounded-lg bg-gray-800/30">
            {highlightToxicWords(result.text, result.toxic_words)}
          </div>
        </div>

        <div>
          <p className="text-gray-400 mb-2">Classification:</p>
          <span className={`inline-block px-4 py-2 rounded-full font-medium ${
            result.classification === 'toxic' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
            result.classification === 'offensive' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
            'bg-green-500/20 text-green-300 border border-green-500/30'
          }`}>
            {result.classification}
          </span>
        </div>

        <div>
          <p className="text-gray-400 mb-2">Confidence Score:</p>
          <div className="bg-gray-800/50 h-2.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.confidence * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full ${
                result.classification === 'toxic' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                result.classification === 'offensive' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                'bg-gradient-to-r from-green-500 to-green-600'
              }`}
            />
          </div>
          <p className="text-right mt-2 text-gray-400">
            {(result.confidence * 100).toFixed(2)}%
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisResult; 