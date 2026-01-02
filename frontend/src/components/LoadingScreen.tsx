import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50 dark:bg-navy-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 mx-auto mb-4 border-4 border-primary-200 dark:border-primary-900 border-t-primary-500 rounded-full"
        />
        <h2 className="text-xl font-display font-semibold text-navy-900 dark:text-white">
          Loading SecureWallet
        </h2>
        <p className="mt-2 text-navy-500 dark:text-navy-400">Please wait...</p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
