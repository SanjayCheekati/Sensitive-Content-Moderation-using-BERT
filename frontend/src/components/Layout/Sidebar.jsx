import { motion } from 'framer-motion';

const Sidebar = ({ isOpen, onClose, history, onClearHistory }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

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
        className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 z-50 overflow-y-auto shadow-xl"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Analysis History</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              ✕
            </button>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="mb-6 flex items-center justify-center space-x-2 px-4 py-2 w-full rounded-lg bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              <span>🗑️</span>
              <span>Clear History</span>
            </button>
          )}

          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">No history available</p>
            ) : (
              history.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700"
                >
                  <p className="text-gray-900 dark:text-white mb-2 line-clamp-2">{item.text}</p>
                  <div className="flex flex-col gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                      item.classification === 'toxic' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                      item.classification === 'offensive' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                    }`}>
                      {item.classification}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar; 