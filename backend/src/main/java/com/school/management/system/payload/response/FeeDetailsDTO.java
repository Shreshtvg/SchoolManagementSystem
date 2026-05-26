package com.school.management.system.payload.response;

import com.school.management.system.entity.Fees;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeeDetailsDTO {
    private Long studentId;
    private String studentName;
    private String className;
    private double totalAmount;
    private double amountPaid;
    private double balanceAmount;
    private LocalDate dueDate;
    private Fees.FeeStatus status;
}