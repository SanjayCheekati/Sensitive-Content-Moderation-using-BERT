import { motion } from 'framer-motion';

const AnalysisForm = ({ text, setText, onSubmit, loading }) => {
  return (
    <div className="glass-card rounded-xl p-8 mb-8">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="input-gradient rounded-lg">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full h-40 p-4 bg-transparent rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="button-gradient w-full py-4 rounded-lg font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </div>
          ) : (
            'Analyze Text'
          )}
        </button>
      </form>
    </div>
  );
};

export default AnalysisForm; 