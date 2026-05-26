package com.school.management.system.service.implementation;

import com.school.management.system.entity.*;
import com.school.management.system.payload.request.ClassRequestDTO;
import com.school.management.system.payload.request.FeeRequestDTO;
import com.school.management.system.payload.request.StudentRequestDTO;
import com.school.management.system.payload.request.StudentWithParentDTO;
import com.school.management.system.payload.request.TeacherRequestDTO;
import com.school.management.system.payload.response.DashboardStatsDTO;
import com.school.management.system.payload.response.FeeDetailsDTO;
import com.school.management.system.repository.*;
import com.school.management.system.service.AdminService;
import com.school.management.system.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private EmailService emailService;
    @Autowired private FeesRepository feesRepository;
    @Autowired private ParentRepository parentRepository;
    @Autowired private ClassDetailsRepository classDetailsRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public DashboardStatsDTO getDashboardStats() {
        long studentCount = studentRepository.count();
        long teacherCount = teacherRepository.count();
        return new DashboardStatsDTO(studentCount, teacherCount);
    }

    // --- Student Management ---

    @Override
    @Transactional
    public Student createStudent(StudentWithParentDTO dto) {
        if (userRepository.existsByUsername(dto.getParentUsername())) {
            throw new RuntimeException("Error: Parent username is already taken!");
        }
        if (userRepository.existsByEmail(dto.getParentEmail())) {
            throw new RuntimeException("Error: Parent email is already in use!");
        }

        String tempPassword = UUID.randomUUID().toString().substring(0, 8);
        Role parentRole = roleRepository.findByName(Role.ERole.ROLE_PARENT)
                .orElseThrow(() -> new RuntimeException("Error: Role 'PARENT' not found."));

        User user = new User();
        user.setUsername(dto.getParentUsername());
        user.setEmail(dto.getParentEmail());
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setRoles(Collections.singleton(parentRole));
        User savedUser = userRepository.save(user);

        Parent parent = new Parent();
        parent.setName(dto.getParentName());
        parent.setEmail(dto.getParentEmail());
        parent.setPhone(dto.getParentPhone());
        parent.setUser(savedUser);
        Parent savedParent = parentRepository.save(parent);

        // Class assignment is optional
        ClassDetails classDetails = null;
        if (dto.getClassId() != null) {
            classDetails = classDetailsRepository.findById(dto.getClassId())
                .orElseThrow(() -> new RuntimeException("Error: Class not found."));
        }

        Student student = new Student();
        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setDob(dto.getDob());
        student.setGender(dto.getGender());
        student.setParent(savedParent);
        student.setClassDetails(classDetails);
        Student savedStudent = studentRepository.save(student);

        emailService.sendCredentialsEmail(parent.getEmail(), user.getUsername(), tempPassword);

        return savedStudent;
    }

    @Override
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    @Transactional
    public Student updateStudent(Long studentId, StudentRequestDTO studentDTO) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Error: Student not found."));
        
        if (studentDTO.getParentId() != null) {
        Parent parent = parentRepository.findById(studentDTO.getParentId())
                .orElseThrow(() -> new RuntimeException("Error: Parent not found."));
            student.setParent(parent);
        }

        // Update parent email if provided
        if (studentDTO.getParentEmail() != null && !studentDTO.getParentEmail().trim().isEmpty()) {
            Parent parent = student.getParent();
            if (parent != null) {
                parent.setEmail(studentDTO.getParentEmail());
                parentRepository.save(parent);
                
                // Also update the associated User's email
                if (parent.getUser() != null) {
                    parent.getUser().setEmail(studentDTO.getParentEmail());
                    userRepository.save(parent.getUser());
                }
            } else {
                throw new RuntimeException("Error: Student has no parent associated. Cannot update parent email.");
            }
        }

        // Class assignment is optional - can be set, updated, or removed (null)
        if (studentDTO.getClassId() != null) {
        ClassDetails classDetails = classDetailsRepository.findById(studentDTO.getClassId())
                .orElseThrow(() -> new RuntimeException("Error: Class not found."));
            student.setClassDetails(classDetails);
        } else {
            // If classId is explicitly null, remove class assignment
            student.setClassDetails(null);
        }

        if (studentDTO.getFirstName() != null) {
        student.setFirstName(studentDTO.getFirstName());
        }
        if (studentDTO.getLastName() != null) {
        student.setLastName(studentDTO.getLastName());
        }
        if (studentDTO.getDob() != null) {
        student.setDob(studentDTO.getDob());
        }
        if (studentDTO.getGender() != null) {
        student.setGender(studentDTO.getGender());
        }

        return studentRepository.save(student);
    }

    @Override
    public void deleteStudent(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new RuntimeException("Error: Student not found.");
        }
        studentRepository.deleteById(studentId);
    }

    // --- Teacher Management ---

    @Override
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }
    
    @Override
    @Transactional
    public Teacher createTeacher(TeacherRequestDTO teacherDTO) {
        if (userRepository.existsByUsername(teacherDTO.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(teacherDTO.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        String tempPassword = UUID.randomUUID().toString().substring(0, 8);
        Role teacherRole = roleRepository.findByName(Role.ERole.ROLE_TEACHER)
                .orElseThrow(() -> new RuntimeException("Error: Role 'TEACHER' is not found."));

        User user = new User();
        user.setUsername(teacherDTO.getUsername());
        user.setEmail(teacherDTO.getEmail());
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setRoles(Collections.singleton(teacherRole));
        User savedUser = userRepository.save(user);

        Teacher teacher = new Teacher();
        teacher.setName(teacherDTO.getName());
        teacher.setEmail(teacherDTO.getEmail());
        teacher.setSubject(teacherDTO.getSubject());
        teacher.setUser(savedUser);
        Teacher savedTeacher = teacherRepository.save(teacher);
        
        // Assign teacher to class if classId is provided
        if (teacherDTO.getClassId() != null) {
            ClassDetails classDetails = classDetailsRepository.findById(teacherDTO.getClassId())
                    .orElseThrow(() -> new RuntimeException("Error: Class not found."));
            
            // Check if the class already has a teacher assigned
            if (classDetails.getTeacher() != null) {
                throw new RuntimeException("Error: This class already has a teacher assigned.");
            }
            
            classDetails.setTeacher(savedTeacher);
            classDetailsRepository.save(classDetails);
        }
        
        emailService.sendCredentialsEmail(teacher.getEmail(), user.getUsername(), tempPassword);

        return savedTeacher;
    }
    
    @Override
    @Transactional
    public Teacher updateTeacher(Long teacherId, TeacherRequestDTO teacherDTO) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found."));

        teacher.setName(teacherDTO.getName());
        teacher.setSubject(teacherDTO.getSubject());
        teacher.setEmail(teacherDTO.getEmail());
        Teacher savedTeacher = teacherRepository.save(teacher);
        
        // Handle class assignment
        // First, find the current class assigned to this teacher (if any)
        ClassDetails currentClass = classDetailsRepository.findByTeacherId(teacherId).orElse(null);
        
        if (teacherDTO.getClassId() != null) {
            // Assign teacher to the new class
            ClassDetails newClass = classDetailsRepository.findById(teacherDTO.getClassId())
                    .orElseThrow(() -> new RuntimeException("Error: Class not found."));
            
            // If the teacher is already assigned to this class, no change needed
            if (currentClass != null && currentClass.getId().equals(teacherDTO.getClassId())) {
                return savedTeacher;
            }
            
            // Check if the new class already has a different teacher assigned
            if (newClass.getTeacher() != null && !newClass.getTeacher().getId().equals(teacherId)) {
                throw new RuntimeException("Error: This class already has a teacher assigned.");
            }
            
            // Remove teacher from previous class (if any)
            if (currentClass != null) {
                currentClass.setTeacher(null);
                classDetailsRepository.save(currentClass);
            }
            
            // Assign teacher to new class
            newClass.setTeacher(savedTeacher);
            classDetailsRepository.save(newClass);
        } else {
            // If classId is null, remove teacher from current class (if any)
            if (currentClass != null) {
                currentClass.setTeacher(null);
                classDetailsRepository.save(currentClass);
            }
        }
        
        return savedTeacher;
    }
    
    @Override
    @Transactional
    public void deleteTeacher(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found."));
        
        classDetailsRepository.findByTeacherId(teacherId).ifPresent(classDetails -> {
            classDetails.setTeacher(null);
            classDetailsRepository.save(classDetails);
        });
        
        userRepository.delete(teacher.getUser());
        teacherRepository.delete(teacher);
    }

    // --- Fee Management ---

    @Override
    public List<FeeDetailsDTO> getAllFeeDetails() {
        List<Fees> allFees = feesRepository.findAll();
        return allFees.stream()
            .map(fee -> new FeeDetailsDTO(
                fee.getStudent().getId(),
                fee.getStudent().getFirstName() + " " + fee.getStudent().getLastName(),
                fee.getStudent().getClassDetails() != null ? fee.getStudent().getClassDetails().getClassName() : "N/A",
                fee.getTotalAmount(),
                fee.getAmountPaid(),
                fee.getBalanceAmount(),
                fee.getDueDate(),
                fee.getStatus()
            ))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<FeeDetailsDTO> getFeeDetailsByClass(Long classId) {
        // Find all students in the given class
        List<Student> students = studentRepository.findByClassDetailsId(classId);

        // For each student, find their fee details (or create a default view if none exists)
        return students.stream().map(student -> {
            Fees fee = feesRepository.findByStudentId(student.getId()).orElse(null);
            
            if (fee != null) {
                return new FeeDetailsDTO(
                    student.getId(), student.getFirstName() + " " + student.getLastName(),
                    student.getClassDetails().getClassName(),
                    fee.getTotalAmount(), fee.getAmountPaid(), fee.getBalanceAmount(),
                    fee.getDueDate(), fee.getStatus()
                );
            } else {
                // If a student has no fee record, show them with 0 values
                return new FeeDetailsDTO(
                    student.getId(), student.getFirstName() + " " + student.getLastName(),
                    student.getClassDetails().getClassName(),
                    0.0, 0.0, 0.0, null, Fees.FeeStatus.PENDING
                );
            }
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Fees addOrUpdateFee(FeeRequestDTO feeRequestDTO) {
        Student student = studentRepository.findById(feeRequestDTO.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found."));

        // Find existing fee record for the student, or create a new one
        Fees fee = feesRepository.findByStudentId(student.getId())
                .orElse(new Fees());
        
        fee.setStudent(student);
        fee.setTotalAmount(feeRequestDTO.getTotalAmount());
        fee.setAmountPaid(feeRequestDTO.getAmountPaid());
        fee.setDueDate(feeRequestDTO.getDueDate());

        // Validate that amount paid doesn't exceed total amount
        if (feeRequestDTO.getAmountPaid() > feeRequestDTO.getTotalAmount()) {
            throw new RuntimeException("Amount paid more than total");
        }

        // --- AUTOMATIC CALCULATION LOGIC ---
        double balance = fee.getTotalAmount() - fee.getAmountPaid();
        fee.setBalanceAmount(balance);

        if (balance <= 0) {
            fee.setStatus(Fees.FeeStatus.PAID);
            fee.setBalanceAmount(0); // Ensure balance isn't negative
        } else if (fee.getAmountPaid() > 0 && balance > 0) {
            fee.setStatus(Fees.FeeStatus.PARTIAL);
        } else {
            fee.setStatus(Fees.FeeStatus.PENDING);
        }

        return feesRepository.save(fee);
    }
    
    // --- Class Management ---
    
    @Override
    public List<ClassDetails> getAllClasses() {
        return classDetailsRepository.findAll();
    }
    
    @Override
    @Transactional
    public ClassDetails createClass(ClassRequestDTO classDTO) {
        // Validate class name: must be a whole number (no decimals)
        try {
            String className = classDTO.getClassName();
            if (className != null && !className.trim().isEmpty()) {
                double classNum = Double.parseDouble(className);
                if (classNum % 1 != 0) {
                    throw new RuntimeException("Class name must be a whole number (no decimals).");
                }
            }
        } catch (NumberFormatException e) {
            throw new RuntimeException("Class name must be a valid number.");
        }

        // Validate section: must contain only letters (no numbers)
        String section = classDTO.getSection();
        if (section != null && !section.trim().isEmpty()) {
            if (section.matches(".*[0-9].*")) {
                throw new RuntimeException("Section must contain only letters (no numbers).");
            }
        }

    	if (classDetailsRepository.existsByClassNameAndSection(classDTO.getClassName(), classDTO.getSection())) {
            throw new RuntimeException("Error: A class with this name and section already exists.");
        }

        ClassDetails newClass = new ClassDetails();
        newClass.setClassName(classDTO.getClassName());
        newClass.setSection(classDTO.getSection());
        
        // Teacher assignment is optional
        if (classDTO.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(classDTO.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Error: Teacher not found for assignment."));

            // Check if teacher is already assigned to another class
            if (classDetailsRepository.existsByTeacher(teacher)) {
                 throw new RuntimeException("Error: This teacher is already assigned to another class.");
            }
            
            newClass.setTeacher(teacher);
        } else {
            newClass.setTeacher(null);
        }

        return classDetailsRepository.save(newClass);
    }

    @Override
    @Transactional
    public ClassDetails updateClass(Long classId, ClassRequestDTO classDTO) {
        ClassDetails classDetails = classDetailsRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found."));

        // Validate class name: must be a whole number (no decimals)
        try {
            String className = classDTO.getClassName();
            if (className != null && !className.trim().isEmpty()) {
                double classNum = Double.parseDouble(className);
                if (classNum % 1 != 0) {
                    throw new RuntimeException("Class name must be a whole number (no decimals).");
                }
            }
        } catch (NumberFormatException e) {
            throw new RuntimeException("Class name must be a valid number.");
        }

        // Validate section: must contain only letters (no numbers)
        String section = classDTO.getSection();
        if (section != null && !section.trim().isEmpty()) {
            if (section.matches(".*[0-9].*")) {
                throw new RuntimeException("Section must contain only letters (no numbers).");
            }
        }

        classDetails.setClassName(classDTO.getClassName());
        classDetails.setSection(classDTO.getSection());
        
        // Teacher assignment is optional - can be set, updated, or removed (null)
        if (classDTO.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(classDTO.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found."));

            // Check if the new teacher is already assigned to a *different* class
            classDetailsRepository.findByTeacherId(teacher.getId()).ifPresent(existingClass -> {
                if (!existingClass.getId().equals(classId)) {
                    throw new RuntimeException("Error: This teacher is already assigned to another class.");
                }
            });
            
            classDetails.setTeacher(teacher);
        } else {
            // If teacherId is null, remove teacher assignment
            classDetails.setTeacher(null);
        }
        
        return classDetailsRepository.save(classDetails);
    }
    
    @Override
    @Transactional
    public void deleteClass(Long classId) {
        if (!classDetailsRepository.existsById(classId)) {
            throw new RuntimeException("Class not found.");
        }
        
        // Before deleting the class, set all students' classDetails to null
        List<Student> studentsInClass = studentRepository.findByClassDetailsId(classId);
        for (Student student : studentsInClass) {
            student.setClassDetails(null);
            studentRepository.save(student);
        }
        
        // Now delete the class
        classDetailsRepository.deleteById(classId);
    }
}