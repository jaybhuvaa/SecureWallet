package com.securewallet.pattern.factory;

import com.securewallet.entity.User;
import com.securewallet.entity.Wallet;
import com.securewallet.enums.WalletStatus;
import com.securewallet.enums.WalletType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class SavingsWalletFactory implements WalletFactory {

    private static final BigDecimal MIN_BALANCE = new BigDecimal("100.00");
    private static final BigDecimal INTEREST_RATE = new BigDecimal("0.04");
    private static final BigDecimal DAILY_LIMIT = new BigDecimal("50000.00");

    @Override
    public WalletType getType() {
        return WalletType.SAVINGS;
    }

    @Override
    public Wallet createWallet(User user, String name) {
        return Wallet.builder()
                .user(user)
                .name(name)
                .walletType(WalletType.SAVINGS)
                .balance(BigDecimal.ZERO)
                .minimumBalance(MIN_BALANCE)
                .interestRate(INTEREST_RATE)
                .dailyTransactionLimit(DAILY_LIMIT)
                .currency("USD")
                .status(WalletStatus.ACTIVE)
                .build();
    }
}
