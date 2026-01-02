// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  errorCode?: string;
  data: T;
  timestamp: string;
}

// User Types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  status: UserStatus;
  emailVerified: boolean;
  roles: string[];
  createdAt: string;
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

// Auth Types
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

// Wallet Types
export type WalletType = 'SAVINGS' | 'CHECKING' | 'INVESTMENT' | 'MERCHANT';
export type WalletStatus = 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'CLOSED';

export interface Wallet {
  id: number;
  walletNumber: string;
  name: string;
  walletType: WalletType;
  balance: number;
  availableBalance: number;
  minimumBalance: number;
  dailyTransactionLimit: number;
  currency: string;
  status: WalletStatus;
  createdAt: string;
}

export interface CreateWalletRequest {
  name: string;
  walletType: WalletType;
}

export interface BalanceResponse {
  walletId: number;
  walletName: string;
  balance: number;
  availableBalance: number;
  currency: string;
}

// Transaction Types
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT' | 'REFUND';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REVERSED';

export interface Transaction {
  id: number;
  referenceNumber: string;
  sourceWalletId?: number;
  sourceWalletName?: string;
  destinationWalletId?: number;
  destinationWalletName?: string;
  amount: number;
  fee: number;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  createdAt: string;
  completedAt?: string;
}

export interface DepositRequest {
  walletId: number;
  amount: number;
  description?: string;
}

export interface WithdrawRequest {
  walletId: number;
  amount: number;
  description?: string;
}

export interface TransferRequest {
  sourceWalletId: number;
  destinationWalletId: number;
  amount: number;
  description?: string;
}

// Page Response
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
