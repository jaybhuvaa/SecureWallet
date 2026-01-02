package com.securewallet.service;

import com.securewallet.dto.request.DepositRequest;
import com.securewallet.dto.request.TransferRequest;
import com.securewallet.dto.request.WithdrawRequest;
import com.securewallet.dto.response.TransactionResponse;
import com.securewallet.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface TransactionService {
    TransactionResponse deposit(DepositRequest request, Long userId);
    TransactionResponse withdraw(WithdrawRequest request, Long userId);
    TransactionResponse transfer(TransferRequest request, Long userId);
    Page<TransactionResponse> getTransactions(Long userId, Long walletId, TransactionType type,
                                               LocalDate startDate, LocalDate endDate, Pageable pageable);
    TransactionResponse getTransactionById(Long transactionId, Long userId);
}
