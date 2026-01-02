import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  Search,
  ChevronDown,
  Check,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Shield,
  CreditCard,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

interface LayoutProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/wallets', icon: Wallet, label: 'Wallets' },
  { path: '/transfer', icon: ArrowLeftRight, label: 'Transfer' },
  { path: '/transactions', icon: Receipt, label: 'Transactions' },
];

// Helper to format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

// Get icon for notification type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'transaction':
      return TrendingUp;
    case 'security':
      return Shield;
    case 'alert':
      return AlertCircle;
    default:
      return Bell;
  }
};

const Layout = ({ darkMode, toggleDarkMode }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Use notifications from context
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification,
    clearAll 
  } = useNotifications();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setNotificationsOpen(false);
      setUserMenuOpen(false);
    };
    if (notificationsOpen || userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [notificationsOpen, userMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-navy-50 dark:bg-navy-950">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 transform bg-white dark:bg-navy-900 border-r border-navy-100 dark:border-navy-800 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-navy-100 dark:border-navy-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-display font-bold text-navy-900 dark:text-white">
                SecureWallet
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-navy-100 dark:border-navy-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-navy-500 dark:text-navy-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 glass-strong">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search (desktop) */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2 bg-navy-100 dark:bg-navy-800 rounded-xl border-0 focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-navy-600" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationsOpen(!notificationsOpen);
                    setUserMenuOpen(false);
                  }}
                  className="relative p-2 rounded-xl hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-navy-800 rounded-xl shadow-xl border border-navy-100 dark:border-navy-700 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-100 dark:border-navy-700">
                        <h3 className="font-semibold text-navy-900 dark:text-white">Notifications</h3>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                            >
                              Mark all read
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button
                              onClick={clearAll}
                              className="text-xs text-red-500 hover:text-red-600 font-medium"
                            >
                              Clear all
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center">
                            <Bell className="w-12 h-12 mx-auto text-navy-300 dark:text-navy-600 mb-2" />
                            <p className="text-navy-500 dark:text-navy-400">No notifications yet</p>
                            <p className="text-xs text-navy-400 dark:text-navy-500 mt-1">
                              Notifications will appear when you make transactions
                            </p>
                          </div>
                        ) : (
                          notifications.map((notification) => {
                            const IconComponent = getNotificationIcon(notification.type);
                            return (
                              <div
                                key={notification.id}
                                className={`px-4 py-3 border-b border-navy-50 dark:border-navy-700/50 hover:bg-navy-50 dark:hover:bg-navy-700/50 transition-colors ${
                                  !notification.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                                }`}
                              >
                                <div className="flex gap-3">
                                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                                    notification.type === 'transaction' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                    notification.type === 'security' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                                    notification.type === 'alert' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                                    'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                                  }`}>
                                    <IconComponent className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className={`text-sm font-medium ${!notification.read ? 'text-navy-900 dark:text-white' : 'text-navy-700 dark:text-navy-300'}`}>
                                        {notification.title}
                                      </p>
                                      <button
                                        onClick={() => clearNotification(notification.id)}
                                        className="text-navy-400 hover:text-red-500 p-0.5"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <p className="text-xs text-navy-500 dark:text-navy-400 mt-0.5 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center justify-between mt-1.5">
                                      <span className="text-xs text-navy-400">
                                        {formatRelativeTime(notification.time)}
                                      </span>
                                      {!notification.read && (
                                        <button
                                          onClick={() => markAsRead(notification.id)}
                                          className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1"
                                        >
                                          <Check className="w-3 h-3" />
                                          Mark read
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-3 border-t border-navy-100 dark:border-navy-700">
                        <button
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate('/settings');
                          }}
                          className="w-full text-center text-sm text-primary-500 hover:text-primary-600 font-medium"
                        >
                          Notification Settings
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.firstName?.charAt(0)}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 hidden sm:block" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-2 w-56 py-2 bg-white dark:bg-navy-800 rounded-xl shadow-xl border border-navy-100 dark:border-navy-700"
                    >
                      <div className="px-4 py-3 border-b border-navy-100 dark:border-navy-700">
                        <p className="text-sm font-medium text-navy-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-navy-500 dark:text-navy-400">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate('/settings');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-navy-600 dark:text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-700"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
