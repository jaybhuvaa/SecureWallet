import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Globe,
    Shield,
    CreditCard,
    Trash2,
    Download,
    ChevronRight,
    X,
    Eye,
    EyeOff,
    Smartphone,
    Monitor,
    Clock,
    MapPin,
    Check,
    AlertTriangle,
    Plus,
    Trash,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings.tsx';

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

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
};

interface ToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

const Toggle = ({ enabled, onChange }: ToggleProps) => (
    <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
            enabled ? 'bg-primary-500' : 'bg-navy-300 dark:bg-navy-600'
        }`}
    >
        <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                enabled ? 'left-7' : 'left-1'
            }`}
        />
    </button>
);

const Modal = ({ isOpen, onClose, title, children }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode
}) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                />
                <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-navy-100 dark:border-navy-800">
                            <h3 className="text-lg font-semibold text-navy-900 dark:text-white">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">{children}</div>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);

const mockSessions = [
    { id: 1, device: 'Chrome on Windows', location: 'New York, US', lastActive: 'Active now', current: true, icon: Monitor },
    { id: 2, device: 'Safari on iPhone', location: 'New York, US', lastActive: '2 hours ago', current: false, icon: Smartphone },
    { id: 3, device: 'Firefox on MacOS', location: 'Los Angeles, US', lastActive: '1 day ago', current: false, icon: Monitor },
];

const mockPaymentMethods = [
    { id: 1, type: 'card', last4: '4242', brand: 'Visa', expiry: '12/25', isDefault: true },
    { id: 2, type: 'card', last4: '8888', brand: 'Mastercard', expiry: '06/26', isDefault: false },
];

const Settings = () => {
    const { user } = useAuth();
    const {
        settings,
        updateCurrency,
        updateLanguage,
        updateNotifications,
        updateTwoFactor
    } = useSettings();

    // Modal states
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);

    // Password change form
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
    const [sessions, setSessions] = useState(mockSessions);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const handleNotificationChange = (key: keyof typeof settings.notifications, value: boolean) => {
        updateNotifications(key, value);
        toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${value ? 'enabled' : 'disabled'}`);
    };

    const handleCurrencyChange = (currency: string) => {
        updateCurrency(currency);
        toast.success(`Currency changed to ${currency}`);
    };

    const handleLanguageChange = (language: string) => {
        updateLanguage(language);
        toast.success('Language preference saved');
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        toast.success('Password changed successfully');
        setPasswordModalOpen(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handleExportData = () => {
        const exportData = {
            user: {
                email: user?.email,
                firstName: user?.firstName,
                lastName: user?.lastName,
                createdAt: user?.createdAt,
            },
            settings: settings,
            exportedAt: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'securewallet-data-export.json';
        a.click();
        URL.revokeObjectURL(url);

        toast.success('Data exported successfully!');
    };

    const handleDeleteAccount = () => {
        if (deleteConfirmText !== 'DELETE') {
            toast.error('Please type DELETE to confirm');
            return;
        }
        toast.success('Account deletion request submitted.');
        setDeleteModalOpen(false);
        setDeleteConfirmText('');
    };

    const handleRevokeSession = (sessionId: number) => {
        setSessions(sessions.filter(s => s.id !== sessionId));
        toast.success('Session revoked successfully');
    };

    const handleRemovePaymentMethod = (methodId: number) => {
        setPaymentMethods(paymentMethods.filter(m => m.id !== methodId));
        toast.success('Payment method removed');
    };

    const handleSetDefaultPayment = (methodId: number) => {
        setPaymentMethods(paymentMethods.map(m => ({ ...m, isDefault: m.id === methodId })));
        toast.success('Default payment method updated');
    };

    const handleToggle2FA = () => {
        if (!settings.twoFactorEnabled) {
            setTwoFactorModalOpen(true);
        } else {
            updateTwoFactor(false);
            toast.success('Two-factor authentication disabled');
        }
    };

    const handleEnable2FA = () => {
        updateTwoFactor(true);
        setTwoFactorModalOpen(false);
        toast.success('Two-factor authentication enabled');
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto space-y-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-display font-bold text-navy-900 dark:text-white">
                    Settings
                </h1>
                <p className="mt-2 text-navy-500 dark:text-navy-400">
                    Customize your app preferences and account settings
                </p>
            </motion.div>

            {/* Notifications */}
            <motion.div variants={itemVariants} className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                        <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
                        Notifications
                    </h2>
                </div>

                <div className="space-y-4">
                    {[
                        { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                        { key: 'push', label: 'Push Notifications', desc: 'Get notified on your device' },
                        { key: 'transactions', label: 'Transaction Alerts', desc: 'Get notified for every transaction' },
                        { key: 'lowBalance', label: 'Low Balance Alerts', desc: 'Get notified when balance is low' },
                        { key: 'security', label: 'Security Alerts', desc: 'Get notified about security events' },
                        { key: 'marketing', label: 'Marketing Emails', desc: 'Receive news and promotions' },
                    ].map((item, idx) => (
                        <div key={item.key} className={`flex items-center justify-between py-3 ${idx > 0 ? 'border-t border-navy-100 dark:border-navy-800' : ''}`}>
                            <div>
                                <p className="font-medium text-navy-900 dark:text-white">{item.label}</p>
                                <p className="text-sm text-navy-500 dark:text-navy-400">{item.desc}</p>
                            </div>
                            <Toggle
                                enabled={settings.notifications[item.key as keyof typeof settings.notifications]}
                                onChange={(v) => handleNotificationChange(item.key as keyof typeof settings.notifications, v)}
                            />
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Preferences */}
            <motion.div variants={itemVariants} className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-accent-100 dark:bg-accent-900/30">
                        <Globe className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
                        Preferences
                    </h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="font-medium text-navy-900 dark:text-white">Currency</p>
                            <p className="text-sm text-navy-500 dark:text-navy-400">
                                Choose your preferred currency
                            </p>
                        </div>
                        <select
                            value={settings.currency}
                            onChange={(e) => handleCurrencyChange(e.target.value)}
                            className="px-4 py-2 bg-navy-100 dark:bg-navy-800 rounded-lg border-0 text-sm font-medium focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="INR">INR (₹)</option>
                            <option value="JPY">JPY (¥)</option>
                            <option value="AUD">AUD (A$)</option>
                            <option value="CAD">CAD (C$)</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between py-3 border-t border-navy-100 dark:border-navy-800">
                        <div>
                            <p className="font-medium text-navy-900 dark:text-white">Language</p>
                            <p className="text-sm text-navy-500 dark:text-navy-400">
                                Choose your preferred language
                            </p>
                        </div>
                        <select
                            value={settings.language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="px-4 py-2 bg-navy-100 dark:bg-navy-800 rounded-lg border-0 text-sm font-medium focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                            <option value="hi">हिन्दी</option>
                            <option value="zh">中文</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Security */}
            <motion.div variants={itemVariants} className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
                        Security
                    </h2>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-navy-50 dark:bg-navy-800">
                        <div className="flex items-center gap-4">
                            <Shield className="w-5 h-5 text-navy-500" />
                            <div>
                                <span className="font-medium text-navy-900 dark:text-white block">Two-Factor Authentication</span>
                                <span className="text-sm text-navy-500 dark:text-navy-400">
                                    {settings.twoFactorEnabled ? 'Enabled' : 'Add extra security'}
                                </span>
                            </div>
                        </div>
                        <Toggle enabled={settings.twoFactorEnabled} onChange={handleToggle2FA} />
                    </div>

                    <button
                        onClick={() => setPasswordModalOpen(true)}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-navy-50 dark:bg-navy-800 hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <Shield className="w-5 h-5 text-navy-500" />
                            <span className="font-medium text-navy-900 dark:text-white">Change Password</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-navy-400" />
                    </button>

                    <button
                        onClick={() => setPaymentModalOpen(true)}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-navy-50 dark:bg-navy-800 hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <CreditCard className="w-5 h-5 text-navy-500" />
                            <div className="text-left">
                                <span className="font-medium text-navy-900 dark:text-white block">Manage Payment Methods</span>
                                <span className="text-sm text-navy-500 dark:text-navy-400">
                                    {paymentMethods.length} payment method{paymentMethods.length !== 1 ? 's' : ''} linked
                                </span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-navy-400" />
                    </button>

                    <button
                        onClick={() => setSessionsModalOpen(true)}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-navy-50 dark:bg-navy-800 hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <Monitor className="w-5 h-5 text-navy-500" />
                            <div className="text-left">
                                <span className="font-medium text-navy-900 dark:text-white block">Active Sessions</span>
                                <span className="text-sm text-navy-500 dark:text-navy-400">
                                    {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-navy-400" />
                    </button>
                </div>
            </motion.div>

            {/* Data & Privacy */}
            <motion.div variants={itemVariants} className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
                        Data & Privacy
                    </h2>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleExportData}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-navy-50 dark:bg-navy-800 hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <Download className="w-5 h-5 text-navy-500" />
                            <div className="text-left">
                                <span className="font-medium text-navy-900 dark:text-white block">Export My Data</span>
                                <span className="text-sm text-navy-500 dark:text-navy-400">
                                    Download all your data in JSON format
                                </span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-navy-400" />
                    </button>

                    <button
                        onClick={() => setDeleteModalOpen(true)}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            <div className="text-left">
                                <span className="font-medium text-red-600 dark:text-red-400 block">Delete Account</span>
                                <span className="text-sm text-red-500/70 dark:text-red-400/70">
                                    Permanently delete your account
                                </span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-red-400" />
                    </button>
                </div>
            </motion.div>

            {/* App Info */}
            <motion.div variants={itemVariants} className="text-center py-4">
                <p className="text-sm text-navy-500 dark:text-navy-400">
                    SecureWallet v1.0.0
                </p>
                <p className="text-xs text-navy-400 dark:text-navy-500 mt-1">
                    © 2024 SecureWallet. All rights reserved.
                </p>
            </motion.div>

            {/* Password Modal */}
            <Modal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} title="Change Password">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    {['current', 'new', 'confirm'].map((type) => (
                        <div key={type}>
                            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-2">
                                {type === 'current' ? 'Current' : type === 'new' ? 'New' : 'Confirm New'} Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords[type as keyof typeof showPasswords] ? 'text' : 'password'}
                                    value={passwordForm[`${type}Password` as keyof typeof passwordForm]}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, [`${type}Password`]: e.target.value })}
                                    className="input pr-10"
                                    required
                                    minLength={type !== 'current' ? 8 : undefined}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, [type]: !showPasswords[type as keyof typeof showPasswords] })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
                                >
                                    {showPasswords[type as keyof typeof showPasswords] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setPasswordModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" className="btn-primary flex-1">Update Password</button>
                    </div>
                </form>
            </Modal>

            {/* Payment Methods Modal */}
            <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Payment Methods">
                <div className="space-y-4">
                    {paymentMethods.length === 0 ? (
                        <div className="text-center py-8">
                            <CreditCard className="w-12 h-12 mx-auto text-navy-300 dark:text-navy-600 mb-3" />
                            <p className="text-navy-500 dark:text-navy-400">No payment methods added</p>
                        </div>
                    ) : (
                        paymentMethods.map((method) => (
                            <div key={method.id} className="flex items-center justify-between p-4 bg-navy-50 dark:bg-navy-800 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white dark:bg-navy-700 rounded-lg flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-navy-600 dark:text-navy-300" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-navy-900 dark:text-white">
                                            {method.brand} •••• {method.last4}
                                            {method.isDefault && (
                                                <span className="ml-2 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">Default</span>
                                            )}
                                        </p>
                                        <p className="text-sm text-navy-500 dark:text-navy-400">Expires {method.expiry}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!method.isDefault && (
                                        <button onClick={() => handleSetDefaultPayment(method.id)} className="p-2 text-navy-400 hover:text-primary-500" title="Set as default">
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button onClick={() => handleRemovePaymentMethod(method.id)} className="p-2 text-navy-400 hover:text-red-500" title="Remove">
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    <button className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-navy-200 dark:border-navy-700 rounded-xl text-navy-500 hover:border-primary-500 hover:text-primary-500 transition-colors">
                        <Plus className="w-5 h-5" />
                        Add Payment Method
                    </button>
                </div>
            </Modal>

            {/* Active Sessions Modal */}
            <Modal isOpen={sessionsModalOpen} onClose={() => setSessionsModalOpen(false)} title="Active Sessions">
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 bg-navy-50 dark:bg-navy-800 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white dark:bg-navy-700 rounded-lg flex items-center justify-center">
                                    <session.icon className="w-5 h-5 text-navy-600 dark:text-navy-300" />
                                </div>
                                <div>
                                    <p className="font-medium text-navy-900 dark:text-white flex items-center gap-2">
                                        {session.device}
                                        {session.current && (
                                            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">Current</span>
                                        )}
                                    </p>
                                    <div className="flex items-center gap-3 text-sm text-navy-500 dark:text-navy-400">
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{session.location}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.lastActive}</span>
                                    </div>
                                </div>
                            </div>
                            {!session.current && (
                                <button onClick={() => handleRevokeSession(session.id)} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                    Revoke
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </Modal>

            {/* 2FA Modal */}
            <Modal isOpen={twoFactorModalOpen} onClose={() => setTwoFactorModalOpen(false)} title="Enable Two-Factor Authentication">
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto bg-navy-100 dark:bg-navy-800 rounded-xl flex items-center justify-center mb-4">
                            <div className="text-4xl">📱</div>
                        </div>
                        <p className="text-navy-600 dark:text-navy-400">Scan this QR code with your authenticator app</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-2">Enter 6-digit code</label>
                        <input type="text" maxLength={6} placeholder="000000" className="input text-center text-2xl tracking-widest font-mono" />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setTwoFactorModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                        <button onClick={handleEnable2FA} className="btn-primary flex-1">Enable 2FA</button>
                    </div>
                </div>
            </Modal>

            {/* Delete Account Modal */}
            <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Account">
                <div className="space-y-6">
                    <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-700 dark:text-red-400">This action cannot be undone</p>
                            <p className="text-sm text-red-600 dark:text-red-400/80 mt-1">All your data will be permanently deleted.</p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-2">
                            Type <span className="font-bold text-red-500">DELETE</span> to confirm
                        </label>
                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="DELETE"
                            className="input"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmText !== 'DELETE'}
                            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-xl font-medium transition-colors"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
};

export default Settings;