package com.school.management.system.service;

import com.school.management.system.entity.Fees;

public interface FeesService {
    Fees processFeePayment(Long feeId, double amountPaid);
    void sendFeeReminder(Long studentId);
}