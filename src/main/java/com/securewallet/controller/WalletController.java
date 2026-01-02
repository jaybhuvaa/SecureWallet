package com.securewallet.controller;

import com.securewallet.dto.request.CreateWalletRequest;
import com.securewallet.dto.response.ApiResponse;
import com.securewallet.dto.response.BalanceResponse;
import com.securewallet.dto.response.WalletResponse;
import com.securewallet.enums.WalletStatus;
import com.securewallet.security.UserPrincipal;
import com.securewallet.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wallets")
@RequiredArgsConstructor
@Tag(name = "Wallets", description = "Wallet management endpoints")
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    @Operation(summary = "Get all wallets for current user")
    public ResponseEntity<ApiResponse<List<WalletResponse>>> getMyWallets(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<WalletResponse> wallets = walletService.getWalletsByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(wallets));
    }

    @GetMapping("/{walletId}")
    @Operation(summary = "Get wallet by ID")
    public ResponseEntity<ApiResponse<WalletResponse>> getWallet(
            @PathVariable Long walletId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        WalletResponse wallet = walletService.getWalletById(walletId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(wallet));
    }

    @PostMapping
    @Operation(summary = "Create new wallet")
    public ResponseEntity<ApiResponse<WalletResponse>> createWallet(
            @Valid @RequestBody CreateWalletRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        WalletResponse wallet = walletService.createWallet(request, currentUser.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(wallet, "Wallet created successfully"));
    }

    @GetMapping("/{walletId}/balance")
    @Operation(summary = "Get wallet balance")
    public ResponseEntity<ApiResponse<BalanceResponse>> getBalance(
            @PathVariable Long walletId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        BalanceResponse balance = walletService.getBalance(walletId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(balance));
    }

    @PutMapping("/{walletId}/status")
    @Operation(summary = "Update wallet status")
    public ResponseEntity<ApiResponse<WalletResponse>> updateStatus(
            @PathVariable Long walletId,
            @RequestParam WalletStatus status,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        WalletResponse wallet = walletService.updateStatus(walletId, status, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(wallet, "Status updated"));
    }
}
