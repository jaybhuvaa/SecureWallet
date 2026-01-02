import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowUpRight, ArrowDownRight, ArrowLeftRight, X, RefreshCw } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useSettings } from '../hooks/useSettings';
import { formatDateTime, getStatusColor, getTransactionTypeColor } from '../utils/formatters';
import type { TransactionType } from '../types';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const Transactions = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { transactions, fetchTransactions, isLoading, totalTransactions } = useWallet();
    const { formatAmount } = useSettings();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [filterType, setFilterType] = useState<TransactionType | ''>('');
    const [page, setPage] = useState(0);

    useEffect(() => {
        fetchTransactions({ page, size: 20 });
    }, [page]);

    // Update search from URL params
    useEffect(() => {
        const urlSearch = searchParams.get('search');
        if (urlSearch) {
            setSearchTerm(urlSearch);
        }
    }, [searchParams]);

    // Filter transactions based on search and type
    const filteredTransactions = transactions.filter((tx) => {
        // Search filter - search in reference, description, type, wallet names
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm ||
            tx.referenceNumber.toLowerCase().includes(searchLower) ||
            (tx.description?.toLowerCase().includes(searchLower)) ||
            tx.type.toLowerCase().includes(searchLower) ||
            (tx.sourceWalletName?.toLowerCase().includes(searchLower)) ||
            (tx.destinationWalletName?.toLowerCase().includes(searchLower)) ||
            tx.amount.toString().includes(searchLower);

        // Type filter
        const matchesType = !filterType || tx.type === filterType;

        return matchesSearch && matchesType;
    });

    const clearSearch = () => {
        setSearchTerm('');
        setSearchParams({});
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        if (value) {
            setSearchParams({ search: value });
        } else {
            setSearchParams({});
        }
    };

    const getTransactionIcon = (type: TransactionType) => {
        switch (type) {
            case 'DEPOSIT':
                return <ArrowDownRight className="w-5 h-5" />;
            case 'WITHDRAWAL':
                return <ArrowUpRight className="w-5 h-5" />;
            case 'TRANSFER':
                return <ArrowLeftRight className="w-5 h-5" />;
            default:
                return <ArrowUpRight className="w-5 h-5" />;
        }
    };

    const getIconBg = (type: TransactionType) => {
        switch (type) {
            case 'DEPOSIT':
                return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
            case 'WITHDRAWAL':
                return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
            case 'TRANSFER':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
            default:
                return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
        }
    };

    const handleRefresh = () => {
        fetchTransactions({ page, size: 20 });
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-navy-900 dark:text-white">
                        Transactions
                    </h1>
                    <p className="mt-2 text-navy-500 dark:text-navy-400">
                        View and track all your transaction history ({filteredTransactions.length} of {transactions.length})
                    </p>
                </div>
                <button onClick={handleRefresh} className="btn-secondary self-start sm:self-auto">
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </motion.div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search by reference, description, amount, wallet..."
                        className="input pl-12 pr-10"
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-navy-100 dark:hover:bg-navy-700 rounded-full"
                        >
                            <X className="w-4 h-4 text-navy-400" />
                        </button>
                    )}
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as TransactionType | '')}
                        className="input pl-12 pr-8 appearance-none min-w-[180px] cursor-pointer"
                    >
                        <option value="">All Types</option>
                        <option value="DEPOSIT">💰 Deposits</option>
                        <option value="WITHDRAWAL">💸 Withdrawals</option>
                        <option value="TRANSFER">🔄 Transfers</option>
                        <option value="PAYMENT">💳 Payments</option>
                    </select>
                </div>
            </motion.div>

            {/* Active Filters Display */}
            {(searchTerm || filterType) && (
                <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
                    {searchTerm && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
              Search: "{searchTerm}"
              <button onClick={clearSearch}>
                <X className="w-4 h-4" />
              </button>
            </span>
                    )}
                    {filterType && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-full text-sm">
              Type: {filterType}
                            <button onClick={() => setFilterType('')}>
                <X className="w-4 h-4" />
              </button>
            </span>
                    )}
                </motion.div>
            )}

            {/* Transactions List */}
            <motion.div variants={itemVariants} className="card overflow-hidden">
                {isLoading ? (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-20 bg-navy-100 dark:bg-navy-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-navy-100 dark:bg-navy-800 flex items-center justify-center">
                            <Search className="w-8 h-8 text-navy-400" />
                        </div>
                        <h3 className="text-lg font-medium text-navy-900 dark:text-white mb-2">
                            {searchTerm || filterType ? 'No matching transactions' : 'No transactions yet'}
                        </h3>
                        <p className="text-navy-500 dark:text-navy-400 mb-4">
                            {searchTerm || filterType
                                ? 'Try adjusting your search or filter criteria'
                                : 'Make your first deposit or transfer to see transactions here'}
                        </p>
                        {(searchTerm || filterType) && (
                            <button onClick={() => { clearSearch(); setFilterType(''); }} className="btn-secondary">
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-navy-100 dark:border-navy-800">
                                    <th className="text-left text-sm font-medium text-navy-500 dark:text-navy-400 px-6 py-4">
                                        Transaction
                                    </th>
                                    <th className="text-left text-sm font-medium text-navy-500 dark:text-navy-400 px-6 py-4">
                                        Reference
                                    </th>
                                    <th className="text-left text-sm font-medium text-navy-500 dark:text-navy-400 px-6 py-4">
                                        Wallet
                                    </th>
                                    <th className="text-left text-sm font-medium text-navy-500 dark:text-navy-400 px-6 py-4">
                                        Date
                                    </th>
                                    <th className="text-left text-sm font-medium text-navy-500 dark:text-navy-400 px-6 py-4">
                                        Status
                                    </th>
                                    <th className="text-right text-sm font-medium text-navy-500 dark:text-navy-400 px-6 py-4">
                                        Amount
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredTransactions.map((tx) => (
                                    <tr
                                        key={tx.id}
                                        className="border-b border-navy-50 dark:border-navy-800/50 hover:bg-navy-50 dark:hover:bg-navy-800/30 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${getIconBg(tx.type)}`}>
                                                    {getTransactionIcon(tx.type)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-navy-900 dark:text-white">
                                                        {tx.type}
                                                    </p>
                                                    <p className="text-sm text-navy-500 dark:text-navy-400 max-w-[200px] truncate">
                                                        {tx.description || 'No description'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-sm font-mono text-navy-600 dark:text-navy-400 bg-navy-100 dark:bg-navy-800 px-2 py-1 rounded">
                                                {tx.referenceNumber.slice(0, 15)}...
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-navy-600 dark:text-navy-400">
                                                {tx.type === 'DEPOSIT'
                                                    ? tx.destinationWalletName || 'Wallet'
                                                    : tx.type === 'WITHDRAWAL'
                                                        ? tx.sourceWalletName || 'Wallet'
                                                        : `${tx.sourceWalletName || 'Source'} → ${tx.destinationWalletName || 'Dest'}`
                                                }
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-navy-600 dark:text-navy-400">
                                                {formatDateTime(tx.createdAt)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                tx.status
                            )}`}
                        >
                          {tx.status}
                        </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                        <span className={`font-semibold ${getTransactionTypeColor(tx.type)}`}>
                          {tx.type === 'DEPOSIT' ? '+' : '-'}
                            {formatAmount(tx.amount)}
                        </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List */}
                        <div className="md:hidden divide-y divide-navy-100 dark:divide-navy-800">
                            {filteredTransactions.map((tx) => (
                                <div key={tx.id} className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${getIconBg(tx.type)}`}>
                                                {getTransactionIcon(tx.type)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-navy-900 dark:text-white">{tx.type}</p>
                                                <p className="text-xs text-navy-500 dark:text-navy-400">
                                                    {formatDateTime(tx.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`font-semibold ${getTransactionTypeColor(tx.type)}`}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'}
                                            {formatAmount(tx.amount)}
                    </span>
                                    </div>
                                    {tx.description && (
                                        <p className="text-sm text-navy-600 dark:text-navy-400 pl-12">
                                            {tx.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between text-sm pl-12">
                                        <code className="font-mono text-navy-500 dark:text-navy-400 text-xs">
                                            {tx.referenceNumber.slice(0, 12)}...
                                        </code>
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                tx.status
                                            )}`}
                                        >
                      {tx.status}
                    </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </motion.div>

            {/* Pagination */}
            {totalTransactions > 20 && (
                <motion.div variants={itemVariants} className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="btn-secondary disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-navy-600 dark:text-navy-400">
            Page {page + 1} of {Math.ceil(totalTransactions / 20)}
          </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={(page + 1) * 20 >= totalTransactions}
                        className="btn-secondary disabled:opacity-50"
                    >
                        Next
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Transactions;