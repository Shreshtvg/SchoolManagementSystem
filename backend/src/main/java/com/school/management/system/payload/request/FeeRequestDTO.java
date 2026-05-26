package com.school.management.system.payload.request;

import lombok.Data;
import java.time.LocalDate;
import javax.validation.constraints.NotNull;

@Data
public class FeeRequestDTO {
    @NotNull
    private Long studentId;
    @NotNull
    private Double totalAmount;
    @NotNull
    private Double amountPaid;
    @NotNull
    private LocalDate dueDate;
}