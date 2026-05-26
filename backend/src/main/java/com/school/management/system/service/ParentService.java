package com.school.management.system.service;

import com.school.management.system.entity.Student;
import com.school.management.system.payload.request.StudentUpdateRequestDTO;
import com.school.management.system.payload.response.ParentDashboardDTO;

public interface ParentService {
	ParentDashboardDTO getChildDashboard();
    Student updateChildInfo(Student student);
    Student updateChildInfo(StudentUpdateRequestDTO updateRequest);
    byte[] downloadPerformanceReport(Long studentId);
}