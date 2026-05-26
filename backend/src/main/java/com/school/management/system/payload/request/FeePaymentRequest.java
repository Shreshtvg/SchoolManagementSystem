package com.school.management.system.payload.request;

import lombok.Data;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;

@Data
public class FeePaymentRequest {
    @NotNull
    private Long feeId;

    @NotNull
    @Positive
    private Double amount;
}