package com.securewallet.pattern.factory;

import com.securewallet.entity.User;
import com.securewallet.entity.Wallet;
import com.securewallet.enums.WalletType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WalletFactoryProvider {

    private final List<WalletFactory> factories;

    @PostConstruct
    public void init() {
        factories.forEach(f -> log.info("Registered wallet factory: {}", f.getType()));
    }

    public WalletFactory getFactory(WalletType type) {
        return factories.stream()
                .filter(f -> f.getType() == type)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "No factory registered for wallet type: " + type
                ));
    }

    public Wallet createWallet(WalletType type, User user, String name) {
        return getFactory(type).createWallet(user, name);
    }
}
