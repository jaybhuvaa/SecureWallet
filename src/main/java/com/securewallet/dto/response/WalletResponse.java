package com.securewallet.dto.response;

import com.securewallet.enums.WalletStatus;
import com.securewallet.enums.WalletType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletResponse {
    private Long id;
    private String walletNumber;
    private String name;
    private WalletType walletType;
    private BigDecimal balance;
    private BigDecimal availableBalance;
    private BigDecimal minimumBalance;
    private BigDecimal dailyTransactionLimit;
    private String currency;
    private WalletStatus status;
    private LocalDateTime createdAt;
}
