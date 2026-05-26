package com.school.management.system.service;

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
import java.util.List;

public interface AdminService {

    DashboardStatsDTO getDashboardStats();

    // Student Methods
    Student createStudent(StudentWithParentDTO studentWithParentDTO);
    List<Student> getAllStudents();
    Student updateStudent(Long studentId, StudentRequestDTO studentDTO);
    void deleteStudent(Long studentId);

    // Teacher Methods
    List<Teacher> getAllTeachers();
    Teacher createTeacher(TeacherRequestDTO teacherDTO);
    Teacher updateTeacher(Long teacherId, TeacherRequestDTO teacherDTO);
    void deleteTeacher(Long teacherId);

    // Fee Methods
    List<FeeDetailsDTO> getAllFeeDetails();
    List<FeeDetailsDTO> getFeeDetailsByClass(Long classId);
    Fees addOrUpdateFee(FeeRequestDTO feeRequestDTO);

    // Class Methods
    List<ClassDetails> getAllClasses();
    ClassDetails createClass(ClassRequestDTO classDTO);
    ClassDetails updateClass(Long classId, ClassRequestDTO classDTO);
    void deleteClass(Long classId);
}