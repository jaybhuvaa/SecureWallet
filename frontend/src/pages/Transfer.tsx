import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, DollarSign, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWallet } from '../hooks/useWallet';
import { useSettings } from '../hooks/useSettings';
import { useNotifications } from '../hooks/useNotifications';
import { getWalletTypeIcon } from '../utils/formatters';
import type { Wallet, Transaction } from '../types';

type TransactionMode = 'deposit' | 'withdraw' | 'transfer';

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

const Transfer = () => {
  const { wallets, fetchWallets, deposit, withdraw, transfer, isLoading } = useWallet();
  const { formatAmount } = useSettings();
  const { addTransactionNotification } = useNotifications();
  const [mode, setMode] = useState<TransactionMode>('transfer');
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [destinationWallet, setDestinationWallet] = useState<Wallet | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    if (wallets.length > 0 && !selectedWallet) {
      setSelectedWallet(wallets[0]);
    }
  }, [wallets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!selectedWallet) {
      toast.error('Please select a wallet');
      return;
    }

    if (mode === 'transfer' && !destinationWallet) {
      toast.error('Please select a destination wallet');
      return;
    }

    if (mode === 'transfer' && selectedWallet.id === destinationWallet?.id) {
      toast.error('Source and destination wallets cannot be the same');
      return;
    }

    setProcessing(true);
    try {
      let result;
      if (mode === 'deposit') {
        result = await deposit({
          walletId: selectedWallet.id,
          amount: amountNum,
          description: description || undefined,
        });
      } else if (mode === 'withdraw') {
        result = await withdraw({
          walletId: selectedWallet.id,
          amount: amountNum,
          description: description || undefined,
        });
      } else {
        result = await transfer({
          sourceWalletId: selectedWallet.id,
          destinationWalletId: destinationWallet!.id,
          amount: amountNum,
          description: description || undefined,
        });
      }

      if (result.meta.requestStatus === 'fulfilled') {
        // Add notification for the transaction
        const transaction = result.payload as Transaction;
        addTransactionNotification(transaction);
        
        toast.success(
          mode === 'deposit'
            ? 'Deposit successful!'
            : mode === 'withdraw'
            ? 'Withdrawal successful!'
            : 'Transfer successful!'
        );
        setAmount('');
        setDescription('');
      } else {
        toast.error('Transaction failed');
      }
    } catch {
      toast.error('Transaction failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getModeInfo = () => {
    switch (mode) {
      case 'deposit':
        return {
          icon: ArrowDownRight,
          color: 'emerald',
          title: 'Deposit Funds',
          subtitle: 'Add money to your wallet',
        };
      case 'withdraw':
        return {
          icon: ArrowUpRight,
          color: 'red',
          title: 'Withdraw Funds',
          subtitle: 'Take money out of your wallet',
        };
      case 'transfer':
        return {
          icon: ArrowLeftRight,
          color: 'blue',
          title: 'Transfer Funds',
          subtitle: 'Send money between wallets',
        };
    }
  };

  const modeInfo = getModeInfo();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-3xl font-display font-bold text-navy-900 dark:text-white">
          Money Transfer
        </h1>
        <p className="mt-2 text-navy-500 dark:text-navy-400">
          Deposit, withdraw, or transfer funds between your wallets
        </p>
      </motion.div>

      {/* Mode Selector */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setMode('deposit')}
          className={`p-4 rounded-xl border-2 transition-all ${
            mode === 'deposit'
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
              : 'border-navy-200 dark:border-navy-700 hover:border-navy-300'
          }`}
        >
          <ArrowDownRight className={`w-6 h-6 mx-auto mb-2 ${mode === 'deposit' ? 'text-emerald-600' : 'text-navy-400'}`} />
          <p className={`text-sm font-medium ${mode === 'deposit' ? 'text-navy-900 dark:text-white' : 'text-navy-500'}`}>
            Deposit
          </p>
        </button>
        <button
          onClick={() => setMode('withdraw')}
          className={`p-4 rounded-xl border-2 transition-all ${
            mode === 'withdraw'
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-navy-200 dark:border-navy-700 hover:border-navy-300'
          }`}
        >
          <ArrowUpRight className={`w-6 h-6 mx-auto mb-2 ${mode === 'withdraw' ? 'text-red-600' : 'text-navy-400'}`} />
          <p className={`text-sm font-medium ${mode === 'withdraw' ? 'text-navy-900 dark:text-white' : 'text-navy-500'}`}>
            Withdraw
          </p>
        </button>
        <button
          onClick={() => setMode('transfer')}
          className={`p-4 rounded-xl border-2 transition-all ${
            mode === 'transfer'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-navy-200 dark:border-navy-700 hover:border-navy-300'
          }`}
        >
          <ArrowLeftRight className={`w-6 h-6 mx-auto mb-2 ${mode === 'transfer' ? 'text-blue-600' : 'text-navy-400'}`} />
          <p className={`text-sm font-medium ${mode === 'transfer' ? 'text-navy-900 dark:text-white' : 'text-navy-500'}`}>
            Transfer
          </p>
        </button>
      </motion.div>

      {/* Form Card */}
      <motion.div variants={itemVariants} className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-navy-100 dark:border-navy-800">
          <div className={`p-3 rounded-xl ${
            mode === 'deposit' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
            mode === 'withdraw' ? 'bg-red-100 dark:bg-red-900/30' :
            'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            <modeInfo.icon className={`w-6 h-6 ${
              mode === 'deposit' ? 'text-emerald-600' :
              mode === 'withdraw' ? 'text-red-600' :
              'text-blue-600'
            }`} />
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-navy-900 dark:text-white">
              {modeInfo.title}
            </h2>
            <p className="text-sm text-navy-500 dark:text-navy-400">{modeInfo.subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Source Wallet */}
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-3">
              {mode === 'transfer' ? 'From Wallet' : 'Select Wallet'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {wallets.map((wallet) => (
                <button
                  key={wallet.id}
                  type="button"
                  onClick={() => setSelectedWallet(wallet)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedWallet?.id === wallet.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-navy-200 dark:border-navy-700 hover:border-navy-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{getWalletTypeIcon(wallet.walletType)}</span>
                    <span className="font-medium text-navy-900 dark:text-white">{wallet.name}</span>
                  </div>
                  <p className="text-lg font-semibold text-navy-900 dark:text-white">
                    {formatAmount(wallet.balance)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Destination Wallet (Transfer only) */}
          {mode === 'transfer' && (
            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-3">
                To Wallet
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {wallets
                  .filter((w) => w.id !== selectedWallet?.id)
                  .map((wallet) => (
                    <button
                      key={wallet.id}
                      type="button"
                      onClick={() => setDestinationWallet(wallet)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        destinationWallet?.id === wallet.id
                          ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                          : 'border-navy-200 dark:border-navy-700 hover:border-navy-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">{getWalletTypeIcon(wallet.walletType)}</span>
                        <span className="font-medium text-navy-900 dark:text-white">
                          {wallet.name}
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-navy-900 dark:text-white">
                        {formatAmount(wallet.balance)}
                      </p>
                    </button>
                  ))}
              </div>
              {wallets.length <= 1 && (
                <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  You need at least 2 wallets to make a transfer
                </p>
              )}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-2">
              Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input pl-12 text-2xl font-semibold"
              />
            </div>
            {selectedWallet && mode !== 'deposit' && (
              <p className="mt-2 text-sm text-navy-500 dark:text-navy-400">
                Available balance: {formatAmount(selectedWallet.balance)}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-2">
              Description <span className="text-navy-400">(optional)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-3 w-5 h-5 text-navy-400" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="input pl-12 resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={processing || isLoading || !selectedWallet || (mode === 'transfer' && !destinationWallet)}
            className="btn-primary w-full"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <modeInfo.icon className="w-5 h-5" />
                {mode === 'deposit' ? 'Deposit' : mode === 'withdraw' ? 'Withdraw' : 'Transfer'}{' '}
                {amount ? formatAmount(parseFloat(amount)) : 'Funds'}
              </span>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Transfer;
