import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';

const FeedbackForm = ({ result, onSubmit, onClose }) => {
  const [feedback, setFeedback] = useState({
    correctLabel: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.correctLabel) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        originalText: result.text,
        originalClassification: result.classification,
        correctClassification: feedback.correctLabel,
        comment: feedback.comment
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Report Incorrect Classification</h3>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FaTimes className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      
      {showSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-4 rounded-lg text-center"
        >
          <p className="font-medium">Thank you for your feedback!</p>
          <p className="text-sm mt-1">Your input helps us improve our model.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Classification
            </label>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200">
              {result.classification}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Correct Classification
            </label>
            <select
              value={feedback.correctLabel}
              onChange={(e) => setFeedback(prev => ({ ...prev, correctLabel: e.target.value }))}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select the correct classification</option>
              <option value="toxic">Toxic</option>
              <option value="offensive">Offensive</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={feedback.comment}
              onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Please provide any additional context..."
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || !feedback.correctLabel}
            className={`
              w-full py-3 px-4 rounded-lg font-medium text-white 
              flex justify-center items-center space-x-2
              bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
              disabled:opacity-70 disabled:cursor-not-allowed
            `}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <FaPaperPlane className="h-4 w-4" />
                <span>Submit Feedback</span>
              </>
            )}
          </motion.button>
        </form>
      )}
    </motion.div>
  );
};

export default FeedbackForm; 