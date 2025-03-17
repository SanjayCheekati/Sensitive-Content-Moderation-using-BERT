import { useState } from 'react';
import { motion } from 'framer-motion';

const FileUpload = ({ onUpload, loading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="space-y-6">
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30'}
        `}
      >
        <input 
          type="file" 
          id="file-upload" 
          onChange={handleChange}
          accept=".txt,.csv"
          className="hidden"
        />
        
        <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
          <span className="text-4xl mb-4">📁</span>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Drag & drop a file here, or click to select a file
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Supports .txt and .csv files
          </p>
        </label>
      </div>
      
      {selectedFile && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {selectedFile.name.endsWith('.csv') ? '📊' : '📄'}
              </span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={handleUpload}
        disabled={loading || !selectedFile}
        className={`
          w-full py-3 px-4 rounded-lg font-medium text-white 
          flex justify-center items-center space-x-2
          bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
          disabled:opacity-70 disabled:cursor-not-allowed
        `}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>Upload & Analyze</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default FileUpload; 