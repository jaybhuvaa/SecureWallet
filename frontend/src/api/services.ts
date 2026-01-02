import api from './client';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Wallet,
  CreateWalletRequest,
  Transaction,
  DepositRequest,
  WithdrawRequest,
  TransferRequest,
  PageResponse,
} from '../types';

// Auth API
export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post<ApiResponse<User>>('/auth/register', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// User API
export const userApi = {
  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<User>>('/users/me');
    return response.data;
  },
};

// Wallet API
export const walletApi = {
  getWallets: async () => {
    const response = await api.get<ApiResponse<Wallet[]>>('/wallets');
    return response.data;
  },

  getWallet: async (walletId: number) => {
    const response = await api.get<ApiResponse<Wallet>>(`/wallets/${walletId}`);
    return response.data;
  },

  createWallet: async (data: CreateWalletRequest) => {
    const response = await api.post<ApiResponse<Wallet>>('/wallets', data);
    return response.data;
  },

  getBalance: async (walletId: number) => {
    const response = await api.get<ApiResponse<Wallet>>(`/wallets/${walletId}/balance`);
    return response.data;
  },
};

// Transaction API
export const transactionApi = {
  getTransactions: async (params?: {
    walletId?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await api.get<ApiResponse<PageResponse<Transaction>>>('/transactions', { params });
    return response.data;
  },

  getTransaction: async (transactionId: number) => {
    const response = await api.get<ApiResponse<Transaction>>(`/transactions/${transactionId}`);
    return response.data;
  },

  deposit: async (data: DepositRequest) => {
    const response = await api.post<ApiResponse<Transaction>>('/transactions/deposit', data);
    return response.data;
  },

  withdraw: async (data: WithdrawRequest) => {
    const response = await api.post<ApiResponse<Transaction>>('/transactions/withdraw', data);
    return response.data;
  },

  transfer: async (data: TransferRequest) => {
    const response = await api.post<ApiResponse<Transaction>>('/transactions/transfer', data);
    return response.data;
  },
};
