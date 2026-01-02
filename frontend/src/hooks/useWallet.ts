import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import {
  fetchWallets,
  createWallet,
  fetchTransactions,
  deposit,
  withdraw,
  transfer,
  selectWallet,
  clearError,
} from '../store/walletSlice';
import type { CreateWalletRequest, DepositRequest, WithdrawRequest, TransferRequest } from '../types';

export const useWallet = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { wallets, selectedWallet, transactions, isLoading, error, totalTransactions } = useSelector(
    (state: RootState) => state.wallet
  );

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  return {
    wallets,
    selectedWallet,
    transactions,
    isLoading,
    error,
    totalBalance,
    totalTransactions,
    fetchWallets: () => dispatch(fetchWallets()),
    createWallet: (data: CreateWalletRequest) => dispatch(createWallet(data)),
    fetchTransactions: (params: { walletId?: number; page?: number; size?: number } = {}) =>
      dispatch(fetchTransactions(params)),
    deposit: (data: DepositRequest) => dispatch(deposit(data)),
    withdraw: (data: WithdrawRequest) => dispatch(withdraw(data)),
    transfer: (data: TransferRequest) => dispatch(transfer(data)),
    selectWallet: (wallet: typeof selectedWallet) => dispatch(selectWallet(wallet)),
    clearError: () => dispatch(clearError()),
  };
};
