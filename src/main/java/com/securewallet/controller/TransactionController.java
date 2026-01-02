package com.securewallet.controller;

import com.securewallet.dto.request.DepositRequest;
import com.securewallet.dto.request.TransferRequest;
import com.securewallet.dto.request.WithdrawRequest;
import com.securewallet.dto.response.ApiResponse;
import com.securewallet.dto.response.TransactionResponse;
import com.securewallet.enums.TransactionType;
import com.securewallet.security.UserPrincipal;
import com.securewallet.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Transaction management endpoints")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/transfer")
    @Operation(summary = "Transfer money between wallets")
    public ResponseEntity<ApiResponse<TransactionResponse>> transfer(
            @Valid @RequestBody TransferRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TransactionResponse transaction = transactionService.transfer(request, currentUser.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(transaction, "Transfer successful"));
    }

    @PostMapping("/deposit")
    @Operation(summary = "Deposit money to wallet")
    public ResponseEntity<ApiResponse<TransactionResponse>> deposit(
            @Valid @RequestBody DepositRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TransactionResponse transaction = transactionService.deposit(request, currentUser.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(transaction, "Deposit successful"));
    }

    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw money from wallet")
    public ResponseEntity<ApiResponse<TransactionResponse>> withdraw(
            @Valid @RequestBody WithdrawRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TransactionResponse transaction = transactionService.withdraw(request, currentUser.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(transaction, "Withdrawal successful"));
    }

    @GetMapping
    @Operation(summary = "Get transaction history")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getTransactions(
            @RequestParam(required = false) Long walletId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Page<TransactionResponse> transactions = transactionService.getTransactions(
                currentUser.getId(), walletId, type, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    @GetMapping("/{transactionId}")
    @Operation(summary = "Get transaction by ID")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransaction(
            @PathVariable Long transactionId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TransactionResponse transaction = transactionService.getTransactionById(
                transactionId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(transaction));
    }
}
