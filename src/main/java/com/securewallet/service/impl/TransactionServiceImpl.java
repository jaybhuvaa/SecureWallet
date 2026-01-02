package com.securewallet.service.impl;

import com.securewallet.dto.request.DepositRequest;
import com.securewallet.dto.request.TransferRequest;
import com.securewallet.dto.request.WithdrawRequest;
import com.securewallet.dto.response.TransactionResponse;
import com.securewallet.entity.Transaction;
import com.securewallet.entity.Wallet;
import com.securewallet.enums.TransactionStatus;
import com.securewallet.enums.TransactionType;
import com.securewallet.exception.InsufficientBalanceException;
import com.securewallet.exception.InvalidTransactionException;
import com.securewallet.exception.UnauthorizedAccessException;
import com.securewallet.exception.WalletNotFoundException;
import com.securewallet.repository.TransactionRepository;
import com.securewallet.repository.WalletRepository;
import com.securewallet.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;

    @Override
    @Transactional
    public TransactionResponse deposit(DepositRequest request, Long userId) {
        log.info("Processing deposit of {} to wallet {}", request.getAmount(), request.getWalletId());

        Wallet wallet = walletRepository.findByIdWithLock(request.getWalletId())
                .orElseThrow(() -> new WalletNotFoundException(request.getWalletId()));

        validateWalletOwnership(wallet, userId);
        validateWalletActive(wallet);

        wallet.credit(request.getAmount());
        walletRepository.save(wallet);

        Transaction transaction = Transaction.builder()
                .destinationWallet(wallet)
                .amount(request.getAmount())
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.COMPLETED)
                .description(request.getDescription() != null ? request.getDescription() : "Deposit")
                .completedAt(LocalDateTime.now())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        log.info("Deposit completed successfully. Transaction ID: {}", saved.getId());

        return mapToTransactionResponse(saved);
    }

    @Override
    @Transactional
    public TransactionResponse withdraw(WithdrawRequest request, Long userId) {
        log.info("Processing withdrawal of {} from wallet {}", request.getAmount(), request.getWalletId());

        Wallet wallet = walletRepository.findByIdWithLock(request.getWalletId())
                .orElseThrow(() -> new WalletNotFoundException(request.getWalletId()));

        validateWalletOwnership(wallet, userId);
        validateWalletActive(wallet);

        if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException(wallet.getId(), request.getAmount());
        }

        wallet.debit(request.getAmount());
        walletRepository.save(wallet);

        Transaction transaction = Transaction.builder()
                .sourceWallet(wallet)
                .amount(request.getAmount())
                .type(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.COMPLETED)
                .description(request.getDescription() != null ? request.getDescription() : "Withdrawal")
                .completedAt(LocalDateTime.now())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        log.info("Withdrawal completed successfully. Transaction ID: {}", saved.getId());

        return mapToTransactionResponse(saved);
    }

    @Override
    @Transactional
    public TransactionResponse transfer(TransferRequest request, Long userId) {
        log.info("Processing transfer of {} from wallet {} to wallet {}",
                request.getAmount(), request.getSourceWalletId(), request.getDestinationWalletId());

        if (request.getSourceWalletId().equals(request.getDestinationWalletId())) {
            throw new InvalidTransactionException("Source and destination wallets cannot be the same");
        }

        Wallet sourceWallet = walletRepository.findByIdWithLock(request.getSourceWalletId())
                .orElseThrow(() -> new WalletNotFoundException(request.getSourceWalletId()));

        Wallet destWallet = walletRepository.findByIdWithLock(request.getDestinationWalletId())
                .orElseThrow(() -> new WalletNotFoundException(request.getDestinationWalletId()));

        validateWalletOwnership(sourceWallet, userId);
        validateWalletActive(sourceWallet);
        validateWalletActive(destWallet);

        if (sourceWallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException(sourceWallet.getId(), request.getAmount());
        }

        sourceWallet.debit(request.getAmount());
        destWallet.credit(request.getAmount());

        walletRepository.save(sourceWallet);
        walletRepository.save(destWallet);

        Transaction transaction = Transaction.builder()
                .sourceWallet(sourceWallet)
                .destinationWallet(destWallet)
                .amount(request.getAmount())
                .type(TransactionType.TRANSFER)
                .status(TransactionStatus.COMPLETED)
                .description(request.getDescription() != null ? request.getDescription() : "Transfer")
                .completedAt(LocalDateTime.now())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        log.info("Transfer completed successfully. Transaction ID: {}", saved.getId());

        return mapToTransactionResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(Long userId, Long walletId, TransactionType type,
                                                      LocalDate startDate, LocalDate endDate, Pageable pageable) {
        log.info("Getting transactions for user {}", userId);

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.plusDays(1).atStartOfDay() : null;

        Page<Transaction> transactions;
        if (walletId != null) {
            Wallet wallet = walletRepository.findById(walletId)
                    .orElseThrow(() -> new WalletNotFoundException(walletId));
            validateWalletOwnership(wallet, userId);
            transactions = transactionRepository.findByWalletId(walletId, pageable);
        } else {
            transactions = transactionRepository.findByUserIdWithFilters(userId, type, startDateTime, endDateTime, pageable);
        }

        return transactions.map(this::mapToTransactionResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long transactionId, Long userId) {
        log.info("Getting transaction {} for user {}", transactionId, userId);

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new InvalidTransactionException("Transaction not found: " + transactionId));

        boolean hasAccess = false;
        if (transaction.getSourceWallet() != null &&
                transaction.getSourceWallet().getUser().getId().equals(userId)) {
            hasAccess = true;
        }
        if (transaction.getDestinationWallet() != null &&
                transaction.getDestinationWallet().getUser().getId().equals(userId)) {
            hasAccess = true;
        }

        if (!hasAccess) {
            throw new UnauthorizedAccessException("You don't have access to this transaction");
        }

        return mapToTransactionResponse(transaction);
    }

    private void validateWalletOwnership(Wallet wallet, Long userId) {
        if (!wallet.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You don't have access to this wallet");
        }
    }

    private void validateWalletActive(Wallet wallet) {
        if (!wallet.isActive()) {
            throw new InvalidTransactionException("Wallet is not active");
        }
    }

    private TransactionResponse mapToTransactionResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .referenceNumber(transaction.getReferenceNumber())
                .sourceWalletId(transaction.getSourceWallet() != null ?
                        transaction.getSourceWallet().getId() : null)
                .sourceWalletName(transaction.getSourceWallet() != null ?
                        transaction.getSourceWallet().getName() : null)
                .destinationWalletId(transaction.getDestinationWallet() != null ?
                        transaction.getDestinationWallet().getId() : null)
                .destinationWalletName(transaction.getDestinationWallet() != null ?
                        transaction.getDestinationWallet().getName() : null)
                .amount(transaction.getAmount())
                .fee(transaction.getFee())
                .type(transaction.getType())
                .status(transaction.getStatus())
                .description(transaction.getDescription())
                .createdAt(transaction.getCreatedAt())
                .completedAt(transaction.getCompletedAt())
                .build();
    }
}
