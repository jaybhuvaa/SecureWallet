package com.securewallet.pattern.factory;

import com.securewallet.entity.User;
import com.securewallet.entity.Wallet;
import com.securewallet.enums.WalletStatus;
import com.securewallet.enums.WalletType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class InvestmentWalletFactory implements WalletFactory {

    private static final BigDecimal MIN_BALANCE = new BigDecimal("1000.00");
    private static final BigDecimal DAILY_LIMIT = new BigDecimal("500000.00");

    @Override
    public WalletType getType() {
        return WalletType.INVESTMENT;
    }

    @Override
    public Wallet createWallet(User user, String name) {
        return Wallet.builder()
                .user(user)
                .name(name)
                .walletType(WalletType.INVESTMENT)
                .balance(BigDecimal.ZERO)
                .minimumBalance(MIN_BALANCE)
                .interestRate(BigDecimal.ZERO)
                .dailyTransactionLimit(DAILY_LIMIT)
                .currency("USD")
                .status(WalletStatus.ACTIVE)
                .build();
    }
}
