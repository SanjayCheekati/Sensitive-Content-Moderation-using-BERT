import { motion } from 'framer-motion';

const History = ({ isOpen, onClose, history, onClearHistory, isLoading }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed left-0 top-0 h-full w-80 bg-gray-900 z-50 overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-100">Analysis History</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="mb-6 px-4 py-2 w-full rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30"
            >
              Clear History
            </button>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-gray-400">No history available</p>
              ) : (
                history.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg glass-card"
                  >
                    <p className="text-gray-300 mb-2 line-clamp-2">{item.text}</p>
                    <div className="flex flex-col gap-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                        item.classification === 'toxic' ? 'bg-red-500/20 text-red-300' :
                        item.classification === 'offensive' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {item.classification}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default History; 