package com.school.management.system.service.implementation;

import com.school.management.system.entity.*;
import com.school.management.system.payload.request.AttendanceRequestDTO;
import com.school.management.system.payload.request.MarksRequestDTO;
import com.school.management.system.payload.response.TeacherDashboardDTO;
import com.school.management.system.repository.*;
import com.school.management.system.security.services.UserDetailsImpl;
import com.school.management.system.service.TeacherService;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeacherServiceImpl implements TeacherService {

    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private MarksRepository marksRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private ClassDetailsRepository classDetailsRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private ParentRepository parentRepository;

    @Override
    @Transactional(readOnly = true)
    public TeacherDashboardDTO getTeacherDashboard() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Teacher teacher = teacherRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Teacher profile not found for the logged-in user."));
        System.out.println(teacher);

        // Try to find assigned class, but don't throw error if not found
        ClassDetails assignedClass = classDetailsRepository.findByTeacherId(teacher.getId()).orElse(null);
        
        // If class is assigned, get students; otherwise return empty list
        List<Student> students = assignedClass != null 
            ? studentRepository.findByClassDetailsId(assignedClass.getId())
            : Collections.emptyList();

        return new TeacherDashboardDTO(teacher, assignedClass, students);
    }

    @Override
    @Transactional(readOnly = true)
    public Teacher getTeacherProfile() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return teacherRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Teacher profile not found for the logged-in user."));
    }

    private int getMaxDaysInMonth(String month) {
        switch (month) {
            case "January":
            case "March":
            case "May":
            case "July":
            case "August":
            case "October":
            case "December":
                return 31;
            case "April":
            case "June":
            case "September":
            case "November":
                return 30;
            case "February":
                return 29; // Using 29 to account for leap years
            default:
                return 31;
        }
    }

    @Override
    @Transactional
    public Attendance markStudentAttendance(AttendanceRequestDTO attendanceDTO) {
        Student student = studentRepository.findById(attendanceDTO.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found."));

        // Validate that values are whole numbers (no decimals)
        if (attendanceDTO.getDaysAttended() == null || attendanceDTO.getDaysAttended() < 0) {
            throw new RuntimeException("Days attended must be a non-negative whole number.");
        }
        if (attendanceDTO.getTotalWorkingDays() == null || attendanceDTO.getTotalWorkingDays() < 0) {
            throw new RuntimeException("Total working days must be a non-negative whole number.");
        }

        // Validate days against month maximum
        int maxDays = getMaxDaysInMonth(attendanceDTO.getMonth());
        if (attendanceDTO.getDaysAttended() > maxDays) {
            throw new RuntimeException("Days attended cannot exceed " + maxDays + " for " + attendanceDTO.getMonth() + ".");
        }
        if (attendanceDTO.getTotalWorkingDays() > maxDays) {
            throw new RuntimeException("Total working days cannot exceed " + maxDays + " for " + attendanceDTO.getMonth() + ".");
        }

        // Check if an attendance record already exists for this student and month
        Attendance attendance = attendanceRepository.findByStudentIdAndMonth(
                attendanceDTO.getStudentId(), 
                attendanceDTO.getMonth()
        ).orElse(new Attendance());
        
        // Update or set the attendance data
        attendance.setStudent(student);
        attendance.setMonth(attendanceDTO.getMonth());
        attendance.setNoOfDaysAttended(attendanceDTO.getDaysAttended());
        attendance.setTotalWorkingDays(attendanceDTO.getTotalWorkingDays());
        
        double percentage = ((double) attendance.getNoOfDaysAttended() / attendance.getTotalWorkingDays()) * 100;
        attendance.setPercentage(percentage);
        attendance.setStatus(percentage >= 75 ? "GOOD" : "POOR");
        
        return attendanceRepository.save(attendance);
    }

    @Override
    @Transactional
    public Marks addOrUpdateStudentMarks(MarksRequestDTO marksDTO) {
        Student student = studentRepository.findById(marksDTO.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found."));
        Subject subject = subjectRepository.findById(marksDTO.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found."));

        // Check if marks already exist for this student and subject
        Marks marks = marksRepository.findByStudentIdAndSubjectId(marksDTO.getStudentId(), marksDTO.getSubjectId())
                .orElse(new Marks());

        // If it's a new record, set student and subject
        if (marks.getId() == null) {
            marks.setStudent(student);
            marks.setSubject(subject);
        }

        // Update marks
        marks.setMarksObtained(marksDTO.getMarksObtained());

        // Logic to calculate grade
        if (marks.getMarksObtained() >= 90) marks.setGrade("A+");
        else if (marks.getMarksObtained() >= 80) marks.setGrade("A");
        else if (marks.getMarksObtained() >= 70) marks.setGrade("B+");
        else marks.setGrade("B"); // Simplified
        
        return marksRepository.save(marks);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generatePerformanceReport(Long studentId) {
        try {
            // Fetch student with all related data
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found."));
            
            // Fetch parent details
            Parent parent = student.getParent();
            
            // Fetch attendance records
            List<Attendance> attendanceList = attendanceRepository.findByStudentId(studentId);
            
            // Fetch marks records (using the latest marks per subject)
            List<Marks> marksList = marksRepository.findLatestMarksByStudentId(studentId);
            
            // Calculate overall attendance percentage
            double overallAttendancePercentage = 0.0;
            String attendanceStatus = "N/A";
            int totalDaysAttended = 0;
            int totalWorkingDays = 0;
            
            if (!attendanceList.isEmpty()) {
                for (Attendance att : attendanceList) {
                    totalDaysAttended += att.getNoOfDaysAttended() != null ? att.getNoOfDaysAttended() : 0;
                    totalWorkingDays += att.getTotalWorkingDays() != null ? att.getTotalWorkingDays() : 0;
                }
                if (totalWorkingDays > 0) {
                    overallAttendancePercentage = ((double) totalDaysAttended / totalWorkingDays) * 100;
                }
                attendanceStatus = overallAttendancePercentage >= 75 ? "GOOD" : "BAD";
            }
            
            // Calculate overall marks percentage
            double overallMarksPercentage = 0.0;
            String marksStatus = "N/A";
            
            if (!marksList.isEmpty()) {
                double totalMarks = 0.0;
                for (Marks mark : marksList) {
                    totalMarks += mark.getMarksObtained() != null ? mark.getMarksObtained() : 0;
                }
                overallMarksPercentage = totalMarks / marksList.size();
                marksStatus = overallMarksPercentage >= 40 ? "PASS" : "FAIL";
            }
            
            // Generate PDF
            return generatePDF(student, parent, overallAttendancePercentage, attendanceStatus, 
                              totalDaysAttended, totalWorkingDays, overallMarksPercentage, 
                              marksStatus, marksList);
            
        } catch (DocumentException | IOException e) {
            throw new RuntimeException("Failed to generate report: " + e.getMessage(), e);
        }
    }
    
    private byte[] generatePDF(Student student, Parent parent, double attendancePercentage, 
                              String attendanceStatus, int daysAttended, int totalDays,
                              double marksPercentage, String marksStatus, List<Marks> marksList) 
                              throws IOException, DocumentException {
        Document document = new Document();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, baos);
        
        document.open();
        
        // Fonts
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
        Font headingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Font subHeadingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
        Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
        
        // Title
        Paragraph title = new Paragraph("STUDENT PERFORMANCE REPORT", titleFont);
        title.setSpacingAfter(10);
        document.add(title);
        
        // Date
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd MMMM yyyy");
        Paragraph date = new Paragraph("Generated on: " + dateFormat.format(new Date()), smallFont);
        date.setSpacingAfter(20);
        document.add(date);
        
        // Student Details Section
        Paragraph studentDetailsHeading = new Paragraph("STUDENT DETAILS", headingFont);
        studentDetailsHeading.setSpacingAfter(10);
        document.add(studentDetailsHeading);
        
        String studentName = (student.getFirstName() != null ? student.getFirstName() : "") + 
                            " " + (student.getLastName() != null ? student.getLastName() : "");
        document.add(new Paragraph("Name: " + studentName, normalFont));
        
        if (student.getDob() != null) {
            document.add(new Paragraph("Date of Birth: " + 
                new SimpleDateFormat("dd MMMM yyyy").format(student.getDob()), normalFont));
        }
        
        if (student.getClassDetails() != null) {
            document.add(new Paragraph("Class: " + student.getClassDetails().getClassName() + 
                " - Section: " + student.getClassDetails().getSection(), normalFont));
        }
        
        if (parent != null) {
            document.add(new Paragraph("Parent Name: " + 
                (parent.getName() != null ? parent.getName() : "N/A"), normalFont));
            
            if (parent.getEmail() != null) {
                document.add(new Paragraph("Parent Email: " + parent.getEmail(), normalFont));
            }
        }
        
        Paragraph spacing1 = new Paragraph(" ");
        spacing1.setSpacingAfter(15);
        document.add(spacing1);
        
        // Attendance Section
        Paragraph attendanceHeading = new Paragraph("ATTENDANCE PERFORMANCE", headingFont);
        attendanceHeading.setSpacingAfter(10);
        document.add(attendanceHeading);
        
        document.add(new Paragraph("Attendance Percentage: " + 
            String.format("%.2f", attendancePercentage) + "%", normalFont));
        document.add(new Paragraph("Days Attended: " + daysAttended + " / " + totalDays, normalFont));
        document.add(new Paragraph("Status: " + attendanceStatus, subHeadingFont));
        
        Paragraph spacing2 = new Paragraph(" ");
        spacing2.setSpacingAfter(15);
        document.add(spacing2);
        
        // Marks Section
        Paragraph marksHeading = new Paragraph("MARKS PERFORMANCE", headingFont);
        marksHeading.setSpacingAfter(10);
        document.add(marksHeading);
        
        if (!marksList.isEmpty()) {
            // Subject-wise marks
            for (Marks mark : marksList) {
                String subjectName = "Unknown Subject";
                if (mark.getSubject() != null) {
                    if (mark.getSubject().getName() != null) {
                        subjectName = mark.getSubject().getName();
                    } else if (mark.getSubject().getId() != null) {
                        subjectName = "Subject " + mark.getSubject().getId();
                    }
                }
                double marksObtained = mark.getMarksObtained() != null ? mark.getMarksObtained() : 0;
                document.add(new Paragraph(subjectName + ": " + 
                    String.format("%.2f", marksObtained) + "%", normalFont));
            }
        }
        
        document.add(new Paragraph("Overall Average Marks: " + 
            String.format("%.2f", marksPercentage) + "%", normalFont));
        document.add(new Paragraph("Status: " + marksStatus, subHeadingFont));
        
        document.close();
        
        return baos.toByteArray();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Attendance> getAllStudentsAttendance() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Teacher teacher = teacherRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Teacher profile not found for the logged-in user."));

        ClassDetails assignedClass = classDetailsRepository.findByTeacherId(teacher.getId())
                .orElseThrow(() -> new RuntimeException("No class assigned to this teacher."));

        List<Student> students = studentRepository.findByClassDetailsId(assignedClass.getId());
        List<Long> studentIds = students.stream().map(Student::getId).collect(Collectors.toList());

        return attendanceRepository.findAll().stream()
                .filter(attendance -> studentIds.contains(attendance.getStudent().getId()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Marks> getAllStudentsMarks() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Teacher teacher = teacherRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Teacher profile not found for the logged-in user."));

        ClassDetails assignedClass = classDetailsRepository.findByTeacherId(teacher.getId())
                .orElseThrow(() -> new RuntimeException("No class assigned to this teacher."));

        List<Student> students = studentRepository.findByClassDetailsId(assignedClass.getId());
        List<Long> studentIds = students.stream().map(Student::getId).collect(Collectors.toList());

        return marksRepository.findAll().stream()
                .filter(marks -> studentIds.contains(marks.getStudent().getId()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Attendance> getStudentAttendance(Long studentId) {
        // Verify the student belongs to the teacher's class
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Teacher teacher = teacherRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Teacher profile not found for the logged-in user."));

        ClassDetails assignedClass = classDetailsRepository.findByTeacherId(teacher.getId()).orElse(null);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found."));

        // If teacher has an assigned class, verify the student belongs to it
        if (assignedClass != null) {
            if (student.getClassDetails() == null || 
                !student.getClassDetails().getId().equals(assignedClass.getId())) {
                throw new RuntimeException("Student does not belong to your class.");
            }
        }
        // If teacher has no class assigned, still return attendance (for edge cases)

        return attendanceRepository.findByStudentId(studentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Marks> getStudentMarks(Long studentId) {
        // Verify the student belongs to the teacher's class
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Teacher teacher = teacherRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Teacher profile not found for the logged-in user."));

        ClassDetails assignedClass = classDetailsRepository.findByTeacherId(teacher.getId()).orElse(null);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found."));

        // If teacher has an assigned class, verify the student belongs to it
        if (assignedClass != null) {
            if (student.getClassDetails() == null || 
                !student.getClassDetails().getId().equals(assignedClass.getId())) {
                throw new RuntimeException("Student does not belong to your class.");
            }
        }
        // If teacher has no class assigned, still return marks (for edge cases)

        // Return only unique marks per subject (latest one) to avoid duplicates
        return marksRepository.findLatestMarksByStudentId(studentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteAttendance(Long attendanceId) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found."));
        
        // Security check: ensure the teacher can only delete attendance for students in their assigned class
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Teacher teacher = teacherRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Teacher profile not found."));
        
        // Check if teacher has an assigned class
        ClassDetails assignedClass = classDetailsRepository.findByTeacherId(teacher.getId()).orElse(null);
        
        // If teacher has an assigned class, verify the student belongs to it
        if (assignedClass != null) {
            if (attendance.getStudent().getClassDetails() == null || 
                !attendance.getStudent().getClassDetails().getId().equals(assignedClass.getId())) {
                throw new RuntimeException("Access denied: Student does not belong to your assigned class.");
            }
        }
        // If teacher has no class assigned, still allow deletion (matching getStudentAttendance logic)
        
        // Delete the attendance record
        attendanceRepository.deleteById(attendanceId);
        // Flush to ensure the deletion is committed immediately
        attendanceRepository.flush();
    }

    @Override
    @Transactional
    public void deleteMarks(Long marksId) {
        Marks marks = marksRepository.findById(marksId)
                .orElseThrow(() -> new RuntimeException("Marks record not found."));
        
        // Security check: ensure the teacher can only delete marks for students in their assigned class
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Teacher teacher = teacherRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Teacher profile not found."));
        
        // Check if teacher has an assigned class
        ClassDetails assignedClass = classDetailsRepository.findByTeacherId(teacher.getId()).orElse(null);
        
        // If teacher has an assigned class, verify the student belongs to it
        if (assignedClass != null) {
            if (marks.getStudent().getClassDetails() == null || 
                !marks.getStudent().getClassDetails().getId().equals(assignedClass.getId())) {
                throw new RuntimeException("Access denied: Student does not belong to your assigned class.");
            }
        }
        // If teacher has no class assigned, still allow deletion (matching getStudentMarks logic)
        
        // Delete the marks record
        marksRepository.deleteById(marksId);
        // Flush to ensure the deletion is committed immediately
        marksRepository.flush();
    }
}