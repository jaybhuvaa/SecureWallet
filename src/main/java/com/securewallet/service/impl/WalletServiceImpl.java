package com.securewallet.service.impl;

import com.securewallet.dto.request.CreateWalletRequest;
import com.securewallet.dto.response.BalanceResponse;
import com.securewallet.dto.response.WalletResponse;
import com.securewallet.entity.User;
import com.securewallet.entity.Wallet;
import com.securewallet.enums.WalletStatus;
import com.securewallet.enums.WalletType;
import com.securewallet.exception.UnauthorizedAccessException;
import com.securewallet.exception.UserNotFoundException;
import com.securewallet.exception.WalletNotFoundException;
import com.securewallet.pattern.factory.WalletFactoryProvider;
import com.securewallet.repository.UserRepository;
import com.securewallet.repository.WalletRepository;
import com.securewallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final WalletFactoryProvider factoryProvider;

    @Override
    @Transactional(readOnly = true)
    public List<WalletResponse> getWalletsByUserId(Long userId) {
        log.info("Getting wallets for user: {}", userId);
        return walletRepository.findByUserId(userId).stream()
                .map(this::mapToWalletResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WalletResponse getWalletById(Long walletId, Long userId) {
        log.info("Getting wallet {} for user {}", walletId, userId);
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new WalletNotFoundException(walletId));

        validateWalletOwnership(wallet, userId);
        return mapToWalletResponse(wallet);
    }

    @Override
    @Transactional
    public WalletResponse createWallet(CreateWalletRequest request, Long userId) {
        log.info("Creating wallet for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Wallet wallet = factoryProvider.createWallet(request.getWalletType(), user, request.getName());
        Wallet savedWallet = walletRepository.save(wallet);

        log.info("Wallet created successfully with id: {}", savedWallet.getId());
        return mapToWalletResponse(savedWallet);
    }

    @Override
    @Transactional(readOnly = true)
    public BalanceResponse getBalance(Long walletId, Long userId) {
        log.info("Getting balance for wallet: {}", walletId);
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new WalletNotFoundException(walletId));

        validateWalletOwnership(wallet, userId);

        return BalanceResponse.builder()
                .walletId(wallet.getId())
                .walletName(wallet.getName())
                .balance(wallet.getBalance())
                .availableBalance(wallet.getAvailableBalance())
                .currency(wallet.getCurrency())
                .build();
    }

    @Override
    @Transactional
    public WalletResponse updateStatus(Long walletId, WalletStatus status, Long userId) {
        log.info("Updating status for wallet {} to {}", walletId, status);
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new WalletNotFoundException(walletId));

        validateWalletOwnership(wallet, userId);

        wallet.setStatus(status);
        Wallet savedWallet = walletRepository.save(wallet);

        return mapToWalletResponse(savedWallet);
    }

    private void validateWalletOwnership(Wallet wallet, Long userId) {
        if (!wallet.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You don't have access to this wallet");
        }
    }

    private WalletResponse mapToWalletResponse(Wallet wallet) {
        return WalletResponse.builder()
                .id(wallet.getId())
                .walletNumber(wallet.getWalletNumber())
                .name(wallet.getName())
                .walletType(wallet.getWalletType())
                .balance(wallet.getBalance())
                .availableBalance(wallet.getAvailableBalance())
                .minimumBalance(wallet.getMinimumBalance())
                .dailyTransactionLimit(wallet.getDailyTransactionLimit())
                .currency(wallet.getCurrency())
                .status(wallet.getStatus())
                .createdAt(wallet.getCreatedAt())
                .build();
    }
}
