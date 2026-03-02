package com.pryme.loan.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ApplicationDto(
        Long id,          // Changed UUID to Long to match Entity
        String loanType,
        String bankName,  // <--- NEW FIELD
        BigDecimal amount,
        String status,
        LocalDateTime createdAt
) {}