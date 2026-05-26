package com.school.management.system.service.implementation;

import com.school.management.system.entity.Fees;
import com.school.management.system.entity.Student;
import com.school.management.system.repository.FeesRepository;
import com.school.management.system.repository.StudentRepository;
import com.school.management.system.service.EmailService;
import com.school.management.system.service.FeesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FeesServiceImpl implements FeesService {

    @Autowired
    private FeesRepository feesRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private EmailService emailService;

    @Override
    public Fees processFeePayment(Long feeId, double amountPaid) {
        Fees fee = feesRepository.findById(feeId).orElseThrow(() -> new RuntimeException("Fee record not found"));
        
        fee.setAmountPaid(fee.getAmountPaid() + amountPaid);
        fee.setBalanceAmount(fee.getTotalAmount() - fee.getAmountPaid());

        if (fee.getBalanceAmount() <= 0) {
            fee.setStatus(Fees.FeeStatus.PAID);
            fee.setBalanceAmount(0);
        } else {
            fee.setStatus(Fees.FeeStatus.PARTIAL);
        }
        
        return feesRepository.save(fee);
    }

    @Override
    public void sendFeeReminder(Long studentId) {
        Student student = studentRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found"));
        Fees fee = feesRepository.findByStudentId(studentId).orElseThrow(() -> new RuntimeException("Fee record not found for this student"));
        
        // Recalculate balance amount to ensure accuracy
        double balanceAmount = fee.getTotalAmount() - fee.getAmountPaid();
        if (balanceAmount < 0) {
            balanceAmount = 0;
        }
        
        String parentEmail = student.getParent().getEmail();
        String subject = "Gentle Reminder: School Fee Payment Due";
        
        // Build email text with fee details
        StringBuilder textBuilder = new StringBuilder();
        textBuilder.append("Dear ").append(student.getParent().getName()).append(",\n\n");
        textBuilder.append("This is a friendly reminder that the school fee payment for ").append(student.getFirstName()).append(" ").append(student.getLastName()).append(" is pending.\n\n");
        textBuilder.append("Fee Details:\n");
        textBuilder.append("- Total Amount: $").append(String.format("%.2f", fee.getTotalAmount())).append("\n");
        textBuilder.append("- Amount Paid: $").append(String.format("%.2f", fee.getAmountPaid())).append("\n");
        textBuilder.append("- Due Amount: $").append(String.format("%.2f", balanceAmount)).append("\n");
        if (fee.getDueDate() != null) {
            textBuilder.append("- Due Date: ").append(fee.getDueDate().toString()).append("\n");
        }
        textBuilder.append("\n");
        textBuilder.append("IMPORTANT: The due amount of $").append(String.format("%.2f", balanceAmount)).append(" needs to be paid");
        if (fee.getDueDate() != null) {
            textBuilder.append(" by ").append(fee.getDueDate().toString());
        }
        textBuilder.append(".\n\n");
        textBuilder.append("Please complete the payment at your earliest convenience.\n\n");
        textBuilder.append("Thank you,\nSchool Administration");
        
        emailService.sendSimpleMessage(parentEmail, subject, textBuilder.toString());
    }
}