package com.securewallet.dto.request;

import com.securewallet.enums.WalletType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateWalletRequest {
    @NotBlank(message = "Wallet name is required")
    private String name;

    @NotNull(message = "Wallet type is required")
    private WalletType walletType;
}
