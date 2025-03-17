import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
  >
    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-medium text-gray-900 dark:text-white text-center mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 text-center">{description}</p>
  </motion.div>
);

const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Content Moderation with BERT
          </h1>
          <p className="text-xl opacity-90">
            Advanced content moderation powered by state-of-the-art BERT algorithm
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<span>🛡️</span>}
            title="Intelligent Protection"
            description="Advanced detection of toxic and offensive content with high accuracy."
            delay={0.2}
          />
          <FeatureCard
            icon={<span>🤖</span>}
            title="AI-Powered"
            description="Leveraging BERT's deep learning capabilities for context-aware analysis."
            delay={0.4}
          />
          <FeatureCard
            icon={<span>📊</span>}
            title="Insightful Analytics"
            description="Visualize results and understand how the AI classifies your content."
            delay={0.6}
          />
        </div>
      </div>
    </div>
  );
};

export default Hero; 