package com.securewallet.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BalanceResponse {
    private Long walletId;
    private String walletName;
    private BigDecimal balance;
    private BigDecimal availableBalance;
    private String currency;
}
