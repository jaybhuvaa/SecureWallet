import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    ArrowRight,
    Search,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import { useSettings } from '../hooks/useSettings.tsx';
import { formatRelativeTime, getWalletTypeColor, getTransactionTypeColor } from '../utils/formatters';

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

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { wallets, transactions, totalBalance, fetchWallets, fetchTransactions, isLoading } = useWallet();
    const { formatAmount } = useSettings();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchWallets();
        fetchTransactions({ size: 10 });
    }, []);

    // Calculate real statistics from transactions
    const totalIncome = transactions
        .filter((t) => t.type === 'DEPOSIT')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter((t) => t.type === 'WITHDRAWAL')
        .reduce((sum, t) => sum + t.amount, 0);

    // Generate chart data from real transactions
    const generateChartData = () => {
        if (transactions.length === 0) {
            return [];
        }

        // Group transactions by date and calculate running balance
        const sortedTransactions = [...transactions].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        const dailyData: { [key: string]: number } = {};
        let runningBalance = 0;

        sortedTransactions.forEach((tx) => {
            const date = new Date(tx.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });

            if (tx.type === 'DEPOSIT') {
                runningBalance += tx.amount;
            } else if (tx.type === 'WITHDRAWAL') {
                runningBalance -= tx.amount;
            }

            dailyData[date] = runningBalance;
        });

        return Object.entries(dailyData).map(([name, value]) => ({
            name,
            value: Math.max(0, value),
        }));
    };

    const chartData = generateChartData();

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/transactions?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    // Calculate balance change percentage
    const balanceChangePercent = transactions.length > 0 && totalBalance > 0
        ? ((totalIncome - totalExpenses) / totalBalance * 100).toFixed(1)
        : '0';

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
                        Welcome back, {user?.firstName}! 👋
                    </h1>
                    <p className="mt-2 text-navy-500 dark:text-navy-400">
                        Here's what's happening with your finances today.
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search transactions..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy-800 rounded-xl border border-navy-200 dark:border-navy-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </form>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Balance */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                            <Wallet className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        {transactions.length > 0 && (
                            <span className={`flex items-center gap-1 text-sm font-medium ${
                                parseFloat(balanceChangePercent) >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                {parseFloat(balanceChangePercent) >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                ) : (
                    <TrendingDown className="w-4 h-4" />
                )}
                                {balanceChangePercent}%
              </span>
                        )}
                    </div>
                    <p className="text-sm text-navy-500 dark:text-navy-400">Total Balance</p>
                    <p className="text-2xl font-display font-bold text-navy-900 dark:text-white mt-1">
                        {formatAmount(totalBalance)}
                    </p>
                </div>

                {/* Active Wallets */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-accent-100 dark:bg-accent-900/30">
                            <Wallet className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                        </div>
                    </div>
                    <p className="text-sm text-navy-500 dark:text-navy-400">Active Wallets</p>
                    <p className="text-2xl font-display font-bold text-navy-900 dark:text-white mt-1">
                        {wallets.length}
                    </p>
                </div>

                {/* Income */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <ArrowDownRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-sm text-navy-500 dark:text-navy-400">Total Deposits</p>
                    <p className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        +{formatAmount(totalIncome)}
                    </p>
                </div>

                {/* Expenses */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
                            <ArrowUpRight className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <p className="text-sm text-navy-500 dark:text-navy-400">Total Withdrawals</p>
                    <p className="text-2xl font-display font-bold text-red-600 dark:text-red-400 mt-1">
                        -{formatAmount(totalExpenses)}
                    </p>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-display font-semibold text-navy-900 dark:text-white">
                                Balance Overview
                            </h2>
                            {chartData.length > 0 && (
                                <span className="text-sm text-navy-500 dark:text-navy-400">
                  Based on your transactions
                </span>
                            )}
                        </div>

                        {chartData.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-navy-100 dark:bg-navy-800 flex items-center justify-center mb-4">
                                    <TrendingUp className="w-8 h-8 text-navy-400" />
                                </div>
                                <h3 className="text-lg font-medium text-navy-900 dark:text-white mb-2">
                                    No transaction history yet
                                </h3>
                                <p className="text-navy-500 dark:text-navy-400 mb-4 max-w-sm">
                                    Start by depositing funds to your wallet. Your balance history will appear here.
                                </p>
                                <Link to="/transfer" className="btn-primary">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Make First Deposit
                                </Link>
                            </div>
                        ) : (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            tickFormatter={(value) => value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: 'none',
                                                borderRadius: '12px',
                                                padding: '12px',
                                            }}
                                            labelStyle={{ color: '#94a3b8' }}
                                            itemStyle={{ color: '#f8fafc' }}
                                            formatter={(value: number) => [formatAmount(value), 'Balance']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#6366f1"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorValue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants}>
                    <div className="card p-6">
                        <h2 className="text-lg font-display font-semibold text-navy-900 dark:text-white mb-4">
                            Quick Actions
                        </h2>
                        <div className="space-y-3">
                            <Link
                                to="/wallets"
                                className="flex items-center gap-4 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors group"
                            >
                                <div className="p-2 rounded-lg bg-primary-500 text-white">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-navy-900 dark:text-white">Create Wallet</p>
                                    <p className="text-sm text-navy-500 dark:text-navy-400">Add a new wallet</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-navy-400 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                to="/transfer"
                                className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors group"
                            >
                                <div className="p-2 rounded-lg bg-emerald-500 text-white">
                                    <ArrowDownRight className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-navy-900 dark:text-white">Deposit</p>
                                    <p className="text-sm text-navy-500 dark:text-navy-400">Add funds</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-navy-400 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                to="/transfer"
                                className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                            >
                                <div className="p-2 rounded-lg bg-blue-500 text-white">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-navy-900 dark:text-white">Transfer</p>
                                    <p className="text-sm text-navy-500 dark:text-navy-400">Send money</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-navy-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Wallets */}
                <motion.div variants={itemVariants}>
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-display font-semibold text-navy-900 dark:text-white">
                                Your Wallets
                            </h2>
                            <Link to="/wallets" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                                View all
                            </Link>
                        </div>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-20 bg-navy-100 dark:bg-navy-800 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : wallets.length === 0 ? (
                            <div className="text-center py-8">
                                <Wallet className="w-12 h-12 mx-auto text-navy-300 dark:text-navy-600 mb-3" />
                                <p className="text-navy-500 dark:text-navy-400 mb-4">No wallets yet</p>
                                <Link to="/wallets" className="btn-primary">
                                    Create Wallet
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {wallets.slice(0, 3).map((wallet) => (
                                    <div
                                        key={wallet.id}
                                        className={`card-gradient bg-gradient-to-r ${getWalletTypeColor(wallet.walletType)}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-white/70">{wallet.walletType}</p>
                                                <p className="font-semibold text-white">{wallet.name}</p>
                                            </div>
                                            <p className="text-xl font-display font-bold text-white">
                                                {formatAmount(wallet.balance)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Recent Transactions */}
                <motion.div variants={itemVariants}>
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-display font-semibold text-navy-900 dark:text-white">
                                Recent Transactions
                            </h2>
                            <Link to="/transactions" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                                View all
                            </Link>
                        </div>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-16 bg-navy-100 dark:bg-navy-800 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-navy-500 dark:text-navy-400 mb-4">No transactions yet</p>
                                <Link to="/transfer" className="btn-primary">
                                    Make First Transaction
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.slice(0, 5).map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-navy-50 dark:hover:bg-navy-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`p-2 rounded-lg ${
                                                    tx.type === 'DEPOSIT'
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                                        : tx.type === 'WITHDRAWAL'
                                                            ? 'bg-red-100 dark:bg-red-900/30'
                                                            : 'bg-blue-100 dark:bg-blue-900/30'
                                                }`}
                                            >
                                                {tx.type === 'DEPOSIT' ? (
                                                    <ArrowDownRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                ) : tx.type === 'WITHDRAWAL' ? (
                                                    <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                ) : (
                                                    <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-navy-900 dark:text-white">
                                                    {tx.type}
                                                    {tx.description && (
                                                        <span className="text-navy-500 dark:text-navy-400 font-normal ml-2 text-sm">
                              - {tx.description}
                            </span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-navy-500 dark:text-navy-400">
                                                    {formatRelativeTime(tx.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <p className={`font-semibold ${getTransactionTypeColor(tx.type)}`}>
                                            {tx.type === 'DEPOSIT' ? '+' : '-'}
                                            {formatAmount(tx.amount)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;