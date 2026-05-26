package com.school.management.system.payload.response;

import com.school.management.system.entity.ClassDetails;
import com.school.management.system.entity.Student;
import com.school.management.system.entity.Teacher;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDashboardDTO {
    private Teacher teacher;
    private ClassDetails assignedClass;
    private List<Student> students;
}