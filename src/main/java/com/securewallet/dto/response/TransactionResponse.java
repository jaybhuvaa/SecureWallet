package com.securewallet.dto.response;

import com.securewallet.enums.TransactionStatus;
import com.securewallet.enums.TransactionType;
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
public class TransactionResponse {
    private Long id;
    private String referenceNumber;
    private Long sourceWalletId;
    private String sourceWalletName;
    private Long destinationWalletId;
    private String destinationWalletName;
    private BigDecimal amount;
    private BigDecimal fee;
    private TransactionType type;
    private TransactionStatus status;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
