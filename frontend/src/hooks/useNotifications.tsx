import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Transaction } from '../types';

export interface Notification {
    id: string;
    type: 'transaction' | 'security' | 'alert' | 'promo';
    title: string;
    message: string;
    time: Date;
    read: boolean;
    transactionId?: number;
}

interface NotificationsContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
    addTransactionNotification: (transaction: Transaction) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        const saved = localStorage.getItem('sw_app_notifications');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Convert time strings back to Date objects
            return parsed.map((n: Notification & { time: string }) => ({
                ...n,
                time: new Date(n.time),
            }));
        }
        return [];
    });

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('sw_app_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'time' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            time: new Date(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep max 50 notifications
    }, []);

    const addTransactionNotification = useCallback((transaction: Transaction) => {
        let title = '';
        let message = '';

        switch (transaction.type) {
            case 'DEPOSIT':
                title = 'Deposit Successful';
                message = `$${transaction.amount.toFixed(2)} has been deposited to ${transaction.destinationWalletName || 'your wallet'}.`;
                break;
            case 'WITHDRAWAL':
                title = 'Withdrawal Successful';
                message = `$${transaction.amount.toFixed(2)} has been withdrawn from ${transaction.sourceWalletName || 'your wallet'}.`;
                break;
            case 'TRANSFER':
                title = 'Transfer Successful';
                message = `$${transaction.amount.toFixed(2)} transferred from ${transaction.sourceWalletName || 'source'} to ${transaction.destinationWalletName || 'destination'}.`;
                break;
            default:
                title = 'Transaction Completed';
                message = `Transaction of $${transaction.amount.toFixed(2)} completed.`;
        }

        addNotification({
            type: 'transaction',
            title,
            message,
            transactionId: transaction.id,
        });
    }, [addNotification]);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return (
        <NotificationsContext.Provider value={{
        notifications,
            unreadCount,
            addNotification,
            addTransactionNotification,
            markAsRead,
            markAllAsRead,
            clearNotification,
            clearAll,
    }}>
    {children}
    </NotificationsContext.Provider>
);
};

export const useNotifications = (): NotificationsContextType => {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
};

export default useNotifications;