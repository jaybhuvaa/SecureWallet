import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { login, register, logout, fetchCurrentUser, clearError } from '../store/authSlice';
import type { LoginRequest, RegisterRequest } from '../types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: (credentials: LoginRequest) => dispatch(login(credentials)),
    register: (data: RegisterRequest) => dispatch(register(data)),
    logout: () => dispatch(logout()),
    fetchCurrentUser: () => dispatch(fetchCurrentUser()),
    clearError: () => dispatch(clearError()),
  };
};
