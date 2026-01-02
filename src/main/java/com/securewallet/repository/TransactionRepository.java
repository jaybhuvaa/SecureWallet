package com.securewallet.repository;

import com.securewallet.entity.Transaction;
import com.securewallet.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction t WHERE " +
            "(t.sourceWallet IS NOT NULL AND t.sourceWallet.user.id = :userId) OR " +
            "(t.destinationWallet IS NOT NULL AND t.destinationWallet.user.id = :userId) " +
            "ORDER BY t.createdAt DESC")
    Page<Transaction> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE " +
            "(t.sourceWallet IS NOT NULL AND t.sourceWallet.id = :walletId) OR " +
            "(t.destinationWallet IS NOT NULL AND t.destinationWallet.id = :walletId) " +
            "ORDER BY t.createdAt DESC")
    Page<Transaction> findByWalletId(@Param("walletId") Long walletId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE " +
            "((t.sourceWallet IS NOT NULL AND t.sourceWallet.user.id = :userId) OR " +
            "(t.destinationWallet IS NOT NULL AND t.destinationWallet.user.id = :userId)) " +
            "AND (:type IS NULL OR t.type = :type) " +
            "AND (:startDate IS NULL OR t.createdAt >= :startDate) " +
            "AND (:endDate IS NULL OR t.createdAt <= :endDate) " +
            "ORDER BY t.createdAt DESC")
    Page<Transaction> findByUserIdWithFilters(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    Optional<Transaction> findByReferenceNumber(String referenceNumber);

    @Query("SELECT t FROM Transaction t WHERE " +
            "(t.sourceWallet IS NOT NULL AND t.sourceWallet.id = :walletId) OR " +
            "(t.destinationWallet IS NOT NULL AND t.destinationWallet.id = :walletId) " +
            "ORDER BY t.createdAt DESC")
    List<Transaction> findTop10ByWalletId(@Param("walletId") Long walletId, Pageable pageable);
}
