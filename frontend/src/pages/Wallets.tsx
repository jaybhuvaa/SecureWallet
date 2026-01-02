import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, X, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWallet } from '../hooks/useWallet';
import { useSettings } from '../hooks/useSettings';
import { formatDate, getWalletTypeColor, getWalletTypeIcon } from '../utils/formatters';
import type { WalletType } from '../types';

const walletTypes: { type: WalletType; name: string; description: string }[] = [
  { type: 'SAVINGS', name: 'Savings', description: 'Earn interest on your savings' },
  { type: 'CHECKING', name: 'Checking', description: 'For everyday transactions' },
  { type: 'INVESTMENT', name: 'Investment', description: 'Grow your wealth' },
  { type: 'MERCHANT', name: 'Merchant', description: 'For business transactions' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Wallets = () => {
  const { wallets, fetchWallets, createWallet, isLoading } = useWallet();
  const { formatAmount } = useSettings();
  const [showModal, setShowModal] = useState(false);
  const [newWallet, setNewWallet] = useState({ name: '', walletType: 'CHECKING' as WalletType });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWallet.name.trim()) {
      toast.error('Please enter a wallet name');
      return;
    }

    setCreating(true);
    try {
      const result = await createWallet(newWallet);
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Wallet created successfully!');
        setShowModal(false);
        setNewWallet({ name: '', walletType: 'CHECKING' });
      } else {
        toast.error('Failed to create wallet');
      }
    } catch {
      toast.error('Failed to create wallet');
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900 dark:text-white">
            My Wallets
          </h1>
          <p className="mt-2 text-navy-500 dark:text-navy-400">
            Manage your digital wallets and track balances
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          New Wallet
        </button>
      </motion.div>

      {/* Wallets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-navy-100 dark:bg-navy-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : wallets.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-navy-100 dark:bg-navy-800 flex items-center justify-center">
            <Wallet className="w-12 h-12 text-navy-400" />
          </div>
          <h2 className="text-xl font-display font-semibold text-navy-900 dark:text-white mb-2">
            No wallets yet
          </h2>
          <p className="text-navy-500 dark:text-navy-400 mb-6">
            Create your first wallet to start managing your finances
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Wallet
          </button>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => (
            <motion.div
              key={wallet.id}
              whileHover={{ y: -4 }}
              className={`card-gradient bg-gradient-to-br ${getWalletTypeColor(wallet.walletType)} p-6 cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-white/70 text-sm mb-1">{wallet.walletType}</p>
                  <h3 className="text-xl font-semibold text-white">{wallet.name}</h3>
                </div>
                <span className="text-3xl">{getWalletTypeIcon(wallet.walletType)}</span>
              </div>

              <div className="mb-6">
                <p className="text-white/70 text-sm">Balance</p>
                <p className="text-3xl font-display font-bold text-white">
                  {formatAmount(wallet.balance)}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/20">
                <div>
                  <p className="text-white/70 text-xs">Wallet Number</p>
                  <p className="text-white font-mono text-sm">
                    •••• {wallet.walletNumber.slice(-4)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-xs">Created</p>
                  <p className="text-white text-sm">{formatDate(wallet.createdAt)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Wallet Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-navy-900 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-navy-100 dark:border-navy-800">
                <h2 className="text-xl font-display font-semibold text-navy-900 dark:text-white">
                  Create New Wallet
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateWallet} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-2">
                    Wallet Name
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                    <input
                      type="text"
                      value={newWallet.name}
                      onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                      placeholder="e.g., My Savings"
                      className="input pl-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-3">
                    Wallet Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {walletTypes.map((wt) => (
                      <button
                        key={wt.type}
                        type="button"
                        onClick={() => setNewWallet({ ...newWallet, walletType: wt.type })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          newWallet.walletType === wt.type
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-navy-200 dark:border-navy-700 hover:border-navy-300 dark:hover:border-navy-600'
                        }`}
                      >
                        <span className="text-2xl mb-2 block">{getWalletTypeIcon(wt.type)}</span>
                        <p className="font-medium text-navy-900 dark:text-white">{wt.name}</p>
                        <p className="text-xs text-navy-500 dark:text-navy-400 mt-1">
                          {wt.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={creating} className="btn-primary flex-1">
                    {creating ? 'Creating...' : 'Create Wallet'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Wallets;
