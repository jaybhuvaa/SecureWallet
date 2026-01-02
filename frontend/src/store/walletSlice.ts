import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { walletApi, transactionApi } from '../api/services';
import type { Wallet, Transaction, CreateWalletRequest, DepositRequest, WithdrawRequest, TransferRequest } from '../types';

interface WalletState {
    wallets: Wallet[];
    selectedWallet: Wallet | null;
    transactions: Transaction[];
    isLoading: boolean;
    error: string | null;
    totalTransactions: number;
}

const initialState: WalletState = {
    wallets: [],
    selectedWallet: null,
    transactions: [],
    isLoading: false,
    error: null,
    totalTransactions: 0,
};

export const fetchWallets = createAsyncThunk(
    'wallet/fetchWallets',
    async (_, { rejectWithValue }) => {
        try {
            const response = await walletApi.getWallets();
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch wallets');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch wallets');
        }
    }
);

export const createWallet = createAsyncThunk(
    'wallet/createWallet',
    async (data: CreateWalletRequest, { rejectWithValue }) => {
        try {
            const response = await walletApi.createWallet(data);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to create wallet');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to create wallet');
        }
    }
);

export const fetchTransactions = createAsyncThunk(
    'wallet/fetchTransactions',
    async (params: { walletId?: number; page?: number; size?: number } = {}, { rejectWithValue }) => {
        try {
            const response = await transactionApi.getTransactions(params);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch transactions');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch transactions');
        }
    }
);

export const deposit = createAsyncThunk(
    'wallet/deposit',
    async (data: DepositRequest, { rejectWithValue, dispatch }) => {
        try {
            const response = await transactionApi.deposit(data);
            if (response.success) {
                // Refresh data
                dispatch(fetchWallets());
                dispatch(fetchTransactions({ size: 20 }));
                return response.data;
            }
            return rejectWithValue(response.message || 'Deposit failed');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Deposit failed');
        }
    }
);

export const withdraw = createAsyncThunk(
    'wallet/withdraw',
    async (data: WithdrawRequest, { rejectWithValue, dispatch }) => {
        try {
            const response = await transactionApi.withdraw(data);
            if (response.success) {
                // Refresh data
                dispatch(fetchWallets());
                dispatch(fetchTransactions({ size: 20 }));
                return response.data;
            }
            return rejectWithValue(response.message || 'Withdrawal failed');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Withdrawal failed');
        }
    }
);

export const transfer = createAsyncThunk(
    'wallet/transfer',
    async (data: TransferRequest, { rejectWithValue, dispatch }) => {
        try {
            const response = await transactionApi.transfer(data);
            if (response.success) {
                // Refresh data
                dispatch(fetchWallets());
                dispatch(fetchTransactions({ size: 20 }));
                return response.data;
            }
            return rejectWithValue(response.message || 'Transfer failed');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Transfer failed');
        }
    }
);

const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        selectWallet: (state, action) => {
            state.selectedWallet = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch wallets
            .addCase(fetchWallets.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWallets.fulfilled, (state, action) => {
                state.isLoading = false;
                state.wallets = action.payload;
            })
            .addCase(fetchWallets.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create wallet
            .addCase(createWallet.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createWallet.fulfilled, (state, action) => {
                state.isLoading = false;
                state.wallets.push(action.payload);
            })
            .addCase(createWallet.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch transactions
            .addCase(fetchTransactions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.transactions = action.payload.content;
                state.totalTransactions = action.payload.totalElements;
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Deposit
            .addCase(deposit.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Withdraw
            .addCase(withdraw.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Transfer
            .addCase(transfer.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { clearError, selectWallet } = walletSlice.actions;
export default walletSlice.reducer;