import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { FaTable, FaChartPie, FaChartBar, FaSearch, FaSort, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Charts = ({ results }) => {
  const [activeView, setActiveView] = useState('table');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter results
  const filteredResults = results.filter(result => 
    result.text.toLowerCase().includes(filter.toLowerCase())
  );

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    return sortDirection === 'asc' 
      ? aValue > bValue ? 1 : -1
      : aValue < bValue ? 1 : -1;
  });

  // Paginate results
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Calculate stats for charts
  const stats = {
    total: results.length,
    toxic: results.filter(r => r.classification === 'toxic').length,
    offensive: results.filter(r => r.classification === 'offensive').length,
    neutral: results.filter(r => r.classification === 'neutral').length
  };

  const pieChartData = {
    labels: ['Toxic', 'Offensive', 'Neutral'],
    datasets: [
      {
        data: [stats.toxic, stats.offensive, stats.neutral],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderWidth: 1,
      },
    ],
  };

  const barChartData = {
    labels: ['Toxic', 'Offensive', 'Neutral'],
    datasets: [
      {
        label: 'Number of Entries',
        data: [stats.toxic, stats.offensive, stats.neutral],
        backgroundColor: ['rgba(239, 68, 68, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(16, 185, 129, 0.7)'],
        borderColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Content Classification Results',
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Classification Distribution',
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">File Analysis Results</h2>
        <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            className={`p-2 rounded ${activeView === 'table' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
            onClick={() => setActiveView('table')}
          >
            📋
          </button>
          <button
            className={`p-2 rounded ${activeView === 'pie' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
            onClick={() => setActiveView('pie')}
          >
            🥧
          </button>
          <button
            className={`p-2 rounded ${activeView === 'bar' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
            onClick={() => setActiveView('bar')}
          >
            📊
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Entries</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">Toxic Content</p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-300">{stats.toxic}</p>
            <p className="text-sm text-red-600 dark:text-red-400">
              ({stats.total ? ((stats.toxic / stats.total) * 100).toFixed(1) : 0}%)
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">Safe Content</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.neutral}</p>
            <p className="text-sm text-green-600 dark:text-green-400">
              ({stats.total ? ((stats.neutral / stats.total) * 100).toFixed(1) : 0}%)
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'table' && (
          <motion.div
            key="table-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-4 flex items-center">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter results..."
                  className="pl-10 pr-4 py-2 w-full border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('text')}
                    >
                      <div className="flex items-center">
                        Text
                        <FaSort className="ml-2" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('classification')}
                    >
                      <div className="flex items-center">
                        Classification
                        <FaSort className="ml-2" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('confidence')}
                    >
                      <div className="flex items-center">
                        Confidence
                        <FaSort className="ml-2" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedResults.map((result, index) => (
                    <tr 
                      key={index}
                      className={result.classification === 'toxic' 
                        ? 'bg-red-50 dark:bg-red-900/10' 
                        : result.classification === 'offensive'
                        ? 'bg-yellow-50 dark:bg-yellow-900/10'
                        : ''}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">
                          {result.text}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          result.classification === 'toxic'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : result.classification === 'offensive'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {result.classification}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {(result.confidence * 100).toFixed(2)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {paginatedResults.length ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredResults.length)} of {filteredResults.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <FaChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeView === 'pie' && (
          <motion.div
            key="pie-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center"
          >
            <div className="max-w-md w-full">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </motion.div>
        )}

        {activeView === 'bar' && (
          <motion.div
            key="bar-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center"
          >
            <div className="max-w-md w-full">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Charts; 