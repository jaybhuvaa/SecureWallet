package com.securewallet.service;

import com.securewallet.dto.request.CreateWalletRequest;
import com.securewallet.dto.response.BalanceResponse;
import com.securewallet.dto.response.WalletResponse;
import com.securewallet.enums.WalletStatus;

import java.util.List;

public interface WalletService {
    List<WalletResponse> getWalletsByUserId(Long userId);
    WalletResponse getWalletById(Long walletId, Long userId);
    WalletResponse createWallet(CreateWalletRequest request, Long userId);
    BalanceResponse getBalance(Long walletId, Long userId);
    WalletResponse updateStatus(Long walletId, WalletStatus status, Long userId);
}
