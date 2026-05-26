package com.school.management.system.controller;

import com.school.management.system.entity.Attendance;
import com.school.management.system.entity.Marks;
import com.school.management.system.entity.Subject;
import com.school.management.system.entity.Teacher;
import com.school.management.system.payload.request.AttendanceRequestDTO;
import com.school.management.system.payload.request.MarksRequestDTO;
import com.school.management.system.payload.response.TeacherDashboardDTO;
import com.school.management.system.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/teacher")
@PreAuthorize("hasRole('TEACHER')")
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    @GetMapping("/dashboard")
    public ResponseEntity<TeacherDashboardDTO> getTeacherDashboard() {
        TeacherDashboardDTO dashboardData = teacherService.getTeacherDashboard();
        return ResponseEntity.ok(dashboardData);
    }

    @GetMapping("/profile")
    public ResponseEntity<Teacher> getTeacherProfile() {
        Teacher teacher = teacherService.getTeacherProfile();
        return ResponseEntity.ok(teacher);
    }
    
    @PostMapping("/attendance")
    public ResponseEntity<Attendance> markAttendance(@Valid @RequestBody AttendanceRequestDTO attendanceDTO) {
        Attendance savedAttendance = teacherService.markStudentAttendance(attendanceDTO);
        return ResponseEntity.ok(savedAttendance);
    }

    @PostMapping("/marks")
    public ResponseEntity<Marks> addOrUpdateMarks(@Valid @RequestBody MarksRequestDTO marksDTO) {
        Marks savedMarks = teacherService.addOrUpdateStudentMarks(marksDTO);
        return ResponseEntity.ok(savedMarks);
    }

    @GetMapping("/reports/student/{studentId}")
    public ResponseEntity<byte[]> generateStudentReport(@PathVariable Long studentId) {
        byte[] reportBytes = teacherService.generatePerformanceReport(studentId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("filename", "student-report-" + studentId + ".pdf");

        return ResponseEntity.ok().headers(headers).body(reportBytes);
    }

    @GetMapping("/attendance/all")
    public ResponseEntity<List<Attendance>> getAllStudentsAttendance() {
        List<Attendance> attendanceList = teacherService.getAllStudentsAttendance();
        return ResponseEntity.ok(attendanceList);
    }

    @GetMapping("/marks/all")
    public ResponseEntity<List<Marks>> getAllStudentsMarks() {
        List<Marks> marksList = teacherService.getAllStudentsMarks();
        return ResponseEntity.ok(marksList);
    }

    @GetMapping("/attendance/student/{studentId}")
    public ResponseEntity<List<Attendance>> getStudentAttendance(@PathVariable Long studentId) {
        List<Attendance> attendanceList = teacherService.getStudentAttendance(studentId);
        return ResponseEntity.ok(attendanceList);
    }

    @GetMapping("/marks/student/{studentId}")
    public ResponseEntity<List<Marks>> getStudentMarks(@PathVariable Long studentId) {
        List<Marks> marksList = teacherService.getStudentMarks(studentId);
        return ResponseEntity.ok(marksList);
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getAllSubjects() {
        List<Subject> subjects = teacherService.getAllSubjects();
        return ResponseEntity.ok(subjects);
    }

    @DeleteMapping("/attendance/{attendanceId}")
    public ResponseEntity<?> deleteAttendance(@PathVariable Long attendanceId) {
        teacherService.deleteAttendance(attendanceId);
        return ResponseEntity.ok().body("Attendance record deleted successfully");
    }

    @DeleteMapping("/marks/{marksId}")
    public ResponseEntity<?> deleteMarks(@PathVariable Long marksId) {
        teacherService.deleteMarks(marksId);
        return ResponseEntity.ok().body("Marks record deleted successfully");
    }
}