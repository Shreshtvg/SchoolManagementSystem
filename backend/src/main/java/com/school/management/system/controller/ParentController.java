package com.school.management.system.controller;

import com.school.management.system.entity.Student;
import com.school.management.system.payload.request.FeePaymentRequest;
import com.school.management.system.payload.request.StudentUpdateRequestDTO;
import com.school.management.system.payload.response.MessageResponse;
import com.school.management.system.payload.response.ParentDashboardDTO;
import com.school.management.system.service.FeesService;
import com.school.management.system.service.ParentService;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/parent")
@PreAuthorize("hasRole('PARENT')")
public class ParentController {

	@Autowired
    private FeesService feesService;
	
    @Autowired
    private ParentService parentService;

    @GetMapping("/dashboard")
    public ResponseEntity<ParentDashboardDTO> getParentDashboard() {
        ParentDashboardDTO dashboardData = parentService.getChildDashboard();
        return ResponseEntity.ok(dashboardData);
    }
    
    // --- Fee Payment ---
    @PostMapping("/fees/pay")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<?> payFees(@Valid @RequestBody FeePaymentRequest paymentRequest) {
        feesService.processFeePayment(paymentRequest.getFeeId(), paymentRequest.getAmount());
        return ResponseEntity.ok(new MessageResponse("Payment was successful!"));
    }
    // --- Download Report ---
    @GetMapping("/reports/download/{studentId}")
    public ResponseEntity<byte[]> downloadPerformanceReport(@PathVariable Long studentId) {
        byte[] reportBytes = parentService.downloadPerformanceReport(studentId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        // This header suggests a filename to the browser.
        headers.setContentDispositionFormData("filename", "student-report-" + studentId + ".pdf");

        return ResponseEntity.ok().headers(headers).body(reportBytes);
    }

    // --- Update Child's Info ---
    @PutMapping("/student/update")
    public ResponseEntity<Student> updateChildDetails(@RequestBody StudentUpdateRequestDTO updateRequest) {
        Student updatedStudent = parentService.updateChildInfo(updateRequest);
        return ResponseEntity.ok(updatedStudent);
    }
    }