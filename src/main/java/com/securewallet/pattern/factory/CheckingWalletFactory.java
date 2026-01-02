package com.securewallet.pattern.factory;

import com.securewallet.entity.User;
import com.securewallet.entity.Wallet;
import com.securewallet.enums.WalletStatus;
import com.securewallet.enums.WalletType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class CheckingWalletFactory implements WalletFactory {

    private static final BigDecimal MIN_BALANCE = BigDecimal.ZERO;
    private static final BigDecimal DAILY_LIMIT = new BigDecimal("100000.00");

    @Override
    public WalletType getType() {
        return WalletType.CHECKING;
    }

    @Override
    public Wallet createWallet(User user, String name) {
        return Wallet.builder()
                .user(user)
                .name(name)
                .walletType(WalletType.CHECKING)
                .balance(BigDecimal.ZERO)
                .minimumBalance(MIN_BALANCE)
                .interestRate(BigDecimal.ZERO)
                .dailyTransactionLimit(DAILY_LIMIT)
                .currency("USD")
                .status(WalletStatus.ACTIVE)
                .build();
    }
}
