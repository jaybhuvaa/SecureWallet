package com.securewallet.exception;

import java.math.BigDecimal;

public class InsufficientBalanceException extends RuntimeException {
    public InsufficientBalanceException(Long walletId, BigDecimal amount) {
        super(String.format("Insufficient balance in wallet %d for amount %s", walletId, amount));
    }
}
