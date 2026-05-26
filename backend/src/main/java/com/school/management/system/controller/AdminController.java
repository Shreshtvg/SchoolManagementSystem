package com.school.management.system.controller;

import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;

import com.school.management.system.entity.ClassDetails;
import com.school.management.system.entity.Fees;
import com.school.management.system.entity.Student;
import com.school.management.system.entity.Teacher;
import com.school.management.system.payload.request.ClassRequestDTO;
import com.school.management.system.payload.request.FeeRequestDTO;
import com.school.management.system.payload.request.StudentRequestDTO;
import com.school.management.system.payload.request.StudentWithParentDTO;
import com.school.management.system.payload.request.TeacherRequestDTO;
import com.school.management.system.payload.response.DashboardStatsDTO;
import com.school.management.system.payload.response.FeeDetailsDTO;
import com.school.management.system.payload.response.MessageResponse;
import com.school.management.system.service.AdminService;
import com.school.management.system.service.FeesService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
	
	@Autowired
    private AdminService adminService;
    @Autowired
    private FeesService feesService;

    // Dashboard Stats Endpoint
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        DashboardStatsDTO stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    // --- Student Management ---
//    @PostMapping("/students")
//    public ResponseEntity<Student> addStudent(@Valid @RequestBody StudentRequestDTO studentDTO) {
//        Student newStudent = adminService.createStudent(studentDTO);
//        return ResponseEntity.ok(newStudent);
//    }
    
    @PostMapping("/students")
    public ResponseEntity<Student> addStudent(@Valid @RequestBody StudentWithParentDTO studentWithParentDTO) {
        Student newStudent = adminService.createStudent(studentWithParentDTO);
        return ResponseEntity.ok(newStudent);
    }

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        List<Student> students = adminService.getAllStudents();
        return ResponseEntity.ok(students);
    }
    
    @PutMapping("/students/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @Valid @RequestBody StudentRequestDTO studentDTO) {
        Student updatedStudent = adminService.updateStudent(id, studentDTO);
        return ResponseEntity.ok(updatedStudent);
    }
    
    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        adminService.deleteStudent(id);
        return ResponseEntity.ok(new MessageResponse("Student deleted successfully!"));
    }

    // --- Teacher Management ---
    @PostMapping("/teachers")
    public ResponseEntity<Teacher> addTeacher(@Valid @RequestBody TeacherRequestDTO teacherDTO) {
        Teacher newTeacher = adminService.createTeacher(teacherDTO);
        return ResponseEntity.ok(newTeacher);
    }
    @GetMapping("/teachers")
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        return ResponseEntity.ok(adminService.getAllTeachers());
    }
    
    @PutMapping("/teachers/{id}")
    public ResponseEntity<Teacher> updateTeacher(@PathVariable Long id, @Valid @RequestBody TeacherRequestDTO teacherDTO) {
        Teacher updatedTeacher = adminService.updateTeacher(id, teacherDTO);
        return ResponseEntity.ok(updatedTeacher);
    }

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id) {
        adminService.deleteTeacher(id);
        return ResponseEntity.ok(new MessageResponse("Teacher deleted successfully!"));
    }
    
//    @GetMapping("/teachers/unassigned")
//    public ResponseEntity<List<Teacher>> getUnassignedTeachers() {
//        return ResponseEntity.ok(adminService.getUnassignedTeachers());
//    }

    @PutMapping("/classes/{id}")
    public ResponseEntity<ClassDetails> updateClass(@PathVariable Long id, @Valid @RequestBody ClassRequestDTO classDTO) {
        ClassDetails updatedClass = adminService.updateClass(id, classDTO);
        return ResponseEntity.ok(updatedClass);
    }

    @DeleteMapping("/classes/{id}")
    public ResponseEntity<?> deleteClass(@PathVariable Long id) {
        adminService.deleteClass(id);
        return ResponseEntity.ok(new MessageResponse("Class deleted successfully!"));
    }

 // --- Class Management ---
    @PostMapping("/classes")
    public ResponseEntity<ClassDetails> createClass(@Valid @RequestBody ClassRequestDTO classDTO) {
        ClassDetails newClass = adminService.createClass(classDTO);
        return ResponseEntity.ok(newClass);
    }

    @GetMapping("/classes")
    public ResponseEntity<List<ClassDetails>> getAllClasses() {
        return ResponseEntity.ok(adminService.getAllClasses());
    }

    // --- Subject Management ---
    @PostMapping("/subjects")
    public ResponseEntity<?> createSubject(/* DTO here */) {
        // TODO: Call AdminService to create a new subject
        return ResponseEntity.ok("Subject created successfully");
    }

    // --- Fees Management ---
    @GetMapping("/fees")
    public ResponseEntity<List<FeeDetailsDTO>> getAllFees() {
        List<FeeDetailsDTO> feeDetails = adminService.getAllFeeDetails();
        return ResponseEntity.ok(feeDetails);
    }
    
 // --- NEW ENDPOINT to get fees by class ---
    @GetMapping("/fees/class/{classId}")
    public ResponseEntity<List<FeeDetailsDTO>> getFeesByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(adminService.getFeeDetailsByClass(classId));
    }
    
    // --- NEW ENDPOINT to add or update a fee record ---
    @PostMapping("/fees")
    public ResponseEntity<Fees> addOrUpdateFee(@Valid @RequestBody FeeRequestDTO feeRequestDTO) {
        return ResponseEntity.ok(adminService.addOrUpdateFee(feeRequestDTO));
    }

    @PostMapping("/fees/reminder/{studentId}")
    public ResponseEntity<?> sendFeeReminder(@PathVariable Long studentId) {
        feesService.sendFeeReminder(studentId);
        return ResponseEntity.ok(new MessageResponse("Fee reminder sent successfully to parent."));
    }
}