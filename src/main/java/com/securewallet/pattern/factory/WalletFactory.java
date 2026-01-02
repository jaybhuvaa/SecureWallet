package com.securewallet.pattern.factory;

import com.securewallet.entity.User;
import com.securewallet.entity.Wallet;
import com.securewallet.enums.WalletType;

public interface WalletFactory {
    Wallet createWallet(User user, String name);
    WalletType getType();
}
