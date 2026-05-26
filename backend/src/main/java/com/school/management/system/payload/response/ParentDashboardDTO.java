package com.school.management.system.payload.response;

import com.school.management.system.entity.Attendance;
import com.school.management.system.entity.Fees;
import com.school.management.system.entity.Marks;
import com.school.management.system.entity.Parent;
import com.school.management.system.entity.Student;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParentDashboardDTO {
    private Parent parent;
    private Student student;
    private Fees fees;
    private List<Attendance> attendance;
    private List<Marks> marks;
}