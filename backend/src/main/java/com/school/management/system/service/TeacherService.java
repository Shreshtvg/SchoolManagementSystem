package com.school.management.system.service;

import com.school.management.system.entity.Attendance;
import com.school.management.system.entity.Marks;
import com.school.management.system.entity.Subject;
import com.school.management.system.entity.Teacher;
import com.school.management.system.payload.request.AttendanceRequestDTO;
import com.school.management.system.payload.request.MarksRequestDTO;
import com.school.management.system.payload.response.TeacherDashboardDTO;

import java.util.List;

public interface TeacherService {
 
    TeacherDashboardDTO getTeacherDashboard();
    Teacher getTeacherProfile();
    Attendance markStudentAttendance(AttendanceRequestDTO attendanceDTO);
    Marks addOrUpdateStudentMarks(MarksRequestDTO marksDTO);
    byte[] generatePerformanceReport(Long studentId);
    List<Attendance> getAllStudentsAttendance();
    List<Marks> getAllStudentsMarks();
    List<Attendance> getStudentAttendance(Long studentId);
    List<Marks> getStudentMarks(Long studentId);
    List<Subject> getAllSubjects();
    void deleteAttendance(Long attendanceId);
    void deleteMarks(Long marksId);
}