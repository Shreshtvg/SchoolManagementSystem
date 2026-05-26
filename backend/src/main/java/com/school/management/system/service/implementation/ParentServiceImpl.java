package com.school.management.system.service.implementation;

import com.school.management.system.entity.*;
import com.school.management.system.payload.request.StudentUpdateRequestDTO;
import com.school.management.system.payload.response.ParentDashboardDTO;
import com.school.management.system.repository.*;
import com.school.management.system.security.services.UserDetailsImpl;
import com.school.management.system.service.ParentService;
import com.school.management.system.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

import javax.transaction.Transactional;

@Service
public class ParentServiceImpl implements ParentService {

    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private MarksRepository marksRepository;
    @Autowired
    private AttendanceRepository attendanceRepository;
    @Autowired
    private FeesRepository feesRepository;
    @Autowired
    private ParentRepository parentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TeacherService teacherService;

    @Override
    public ParentDashboardDTO getChildDashboard() {
        // Get the currently authenticated user's details
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = userDetails.getId();

        // Find the parent profile linked to this user
        Parent parent = parentRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Parent profile not found for the logged-in user."));
        System.out.println(parent);

        // Find the student linked to this parent
        Student student = studentRepository.findByParentId(parent.getId())
                .orElseThrow(() -> new RuntimeException("No student found for this parent."));

        // Fetch all related data for the student
        Fees fees = feesRepository.findByStudentId(student.getId()).orElse(null);
        List<Attendance> attendance = attendanceRepository.findByStudentId(student.getId());
        List<Marks> marks = marksRepository.findByStudentId(student.getId());
        
        // Assemble the DTO and return it (include parent for display)
        return new ParentDashboardDTO(parent, student, fees, attendance, marks);
    }

    @Override
    public Student updateChildInfo(Student student) {
        // Find the existing student and update only allowed fields (e.g., address, contact)
        Student existingStudent = studentRepository.findById(student.getId()).orElse(null);
        if (existingStudent != null) {
            // existingStudent.setAddress(student.getAddress());
            return studentRepository.save(existingStudent);
        }
        return null;
    }
    
    @Override
    @Transactional
    public Student updateChildInfo(StudentUpdateRequestDTO updateRequest) {
        // Get the currently logged-in parent
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Parent parent = parentRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Parent profile not found."));

        // Find the student securely linked to THIS parent
        Student student = studentRepository.findByParentId(parent.getId())
                .orElseThrow(() -> new RuntimeException("No student found for this parent account."));
        
        // Update student fields
        if (updateRequest.getFirstName() != null) {
            student.setFirstName(updateRequest.getFirstName());
        }
        if (updateRequest.getLastName() != null) {
            student.setLastName(updateRequest.getLastName());
        }
        if (updateRequest.getDob() != null) {
            student.setDob(updateRequest.getDob());
        }
        if (updateRequest.getAddress() != null) {
            student.setAddress(updateRequest.getAddress());
        }
        if (updateRequest.getContactPhone() != null) {
            student.setContactPhone(updateRequest.getContactPhone());
        }

        // Update parent fields if provided
        boolean parentUpdated = false;
        
        if (updateRequest.getParentName() != null && !updateRequest.getParentName().trim().isEmpty()) {
            parent.setName(updateRequest.getParentName().trim());
            parentUpdated = true;
        }
        
        if (updateRequest.getParentEmail() != null && !updateRequest.getParentEmail().trim().isEmpty()) {
            // Update email in parents table
            parent.setEmail(updateRequest.getParentEmail().trim());
            parentUpdated = true;
            
            // Update email in users table
            if (parent.getUser() != null && parent.getUser().getId() != null) {
                User user = userRepository.findById(parent.getUser().getId())
                        .orElseThrow(() -> new RuntimeException("Error: User not found for parent."));
                user.setEmail(updateRequest.getParentEmail().trim());
                userRepository.save(user);
            }
        }
        
        if (updateRequest.getParentPhone() != null && !updateRequest.getParentPhone().trim().isEmpty()) {
            parent.setPhone(updateRequest.getParentPhone().trim());
            parentUpdated = true;
        }
        
        if (parentUpdated) {
            parentRepository.save(parent);
        }

        // Save and return the updated student
        return studentRepository.save(student);
    }

    @Override
    public byte[] downloadPerformanceReport(Long studentId) {
        // Security check: Verify the studentId belongs to the currently logged-in parent
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Parent parent = parentRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Parent profile not found."));

        Student student = studentRepository.findByParentId(parent.getId())
                .orElseThrow(() -> new RuntimeException("No student found for this parent account."));
        
        // Verify the studentId matches the parent's child
        if (!student.getId().equals(studentId)) {
            throw new RuntimeException("Access denied: Student does not belong to this parent account.");
        }
        
        // Use the teacher service's report generation
        return teacherService.generatePerformanceReport(studentId);
    }
   }
