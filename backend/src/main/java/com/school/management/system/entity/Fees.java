package com.school.management.system.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "fees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Fees {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    private double totalAmount;
    private double amountPaid;
    private double balanceAmount;
    private LocalDate dueDate;
    
    @Enumerated(EnumType.STRING)
    private FeeStatus status;

    public enum FeeStatus {
        PAID,
        PENDING,
        PARTIAL
    }
}