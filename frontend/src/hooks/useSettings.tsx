import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  transactions: boolean;
  marketing: boolean;
  lowBalance: boolean;
  security: boolean;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  language: string;
  notifications: NotificationSettings;
  twoFactorEnabled: boolean;
}

interface SettingsContextType {
  settings: AppSettings;
  updateCurrency: (currency: string) => void;
  updateLanguage: (language: string) => void;
  updateNotifications: (key: keyof NotificationSettings, value: boolean) => void;
  updateTwoFactor: (enabled: boolean) => void;
  formatAmount: (amount: number) => string;
}

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
};

const defaultSettings: AppSettings = {
  currency: 'USD',
  currencySymbol: '$',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    transactions: true,
    marketing: false,
    lowBalance: true,
    security: true,
  },
  twoFactorEnabled: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Load from localStorage
    const savedCurrency = localStorage.getItem('sw_currency') || 'USD';
    const savedLanguage = localStorage.getItem('sw_language') || 'en';
    const savedNotifications = localStorage.getItem('sw_notifications');
    const saved2FA = localStorage.getItem('sw_2fa') === 'true';

    return {
      currency: savedCurrency,
      currencySymbol: currencySymbols[savedCurrency] || '$',
      language: savedLanguage,
      notifications: savedNotifications 
        ? JSON.parse(savedNotifications) 
        : defaultSettings.notifications,
      twoFactorEnabled: saved2FA,
    };
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('sw_currency', settings.currency);
    localStorage.setItem('sw_language', settings.language);
    localStorage.setItem('sw_notifications', JSON.stringify(settings.notifications));
    localStorage.setItem('sw_2fa', String(settings.twoFactorEnabled));
  }, [settings]);

  const updateCurrency = (currency: string) => {
    setSettings(prev => ({
      ...prev,
      currency,
      currencySymbol: currencySymbols[currency] || '$',
    }));
  };

  const updateLanguage = (language: string) => {
    setSettings(prev => ({ ...prev, language }));
  };

  const updateNotifications = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  const updateTwoFactor = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, twoFactorEnabled: enabled }));
  };

  const formatAmount = (amount: number): string => {
    const locale = settings.language === 'en' ? 'en-US' :
                   settings.language === 'es' ? 'es-ES' :
                   settings.language === 'fr' ? 'fr-FR' :
                   settings.language === 'de' ? 'de-DE' :
                   settings.language === 'hi' ? 'hi-IN' :
                   settings.language === 'zh' ? 'zh-CN' : 'en-US';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateCurrency,
      updateLanguage,
      updateNotifications,
      updateTwoFactor,
      formatAmount,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default useSettings;
