import { format, formatDistanceToNow } from 'date-fns';

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatWalletNumber = (walletNumber: string): string => {
  return walletNumber.replace(/(.{4})/g, '$1 ').trim();
};

export const getWalletTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    SAVINGS: 'from-emerald-500 to-teal-600',
    CHECKING: 'from-blue-500 to-indigo-600',
    INVESTMENT: 'from-purple-500 to-pink-600',
    MERCHANT: 'from-orange-500 to-red-600',
  };
  return colors[type] || 'from-gray-500 to-gray-600';
};

export const getWalletTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    SAVINGS: '💰',
    CHECKING: '💳',
    INVESTMENT: '📈',
    MERCHANT: '🏪',
  };
  return icons[type] || '💵';
};

export const getTransactionTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    DEPOSIT: 'text-emerald-500',
    WITHDRAWAL: 'text-red-500',
    TRANSFER: 'text-blue-500',
    PAYMENT: 'text-purple-500',
    REFUND: 'text-amber-500',
  };
  return colors[type] || 'text-gray-500';
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    REVERSED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
