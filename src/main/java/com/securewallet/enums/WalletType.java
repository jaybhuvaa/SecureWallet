package com.securewallet.enums;

public enum WalletType {
    SAVINGS("Savings Account"),
    CHECKING("Checking Account"),
    INVESTMENT("Investment Account"),
    MERCHANT("Merchant Account");

    private final String displayName;

    WalletType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
