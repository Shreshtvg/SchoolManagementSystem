package com.school.management.system.payload.request;
import lombok.Data;
import java.time.LocalDate;
@Data
public class StudentRequestDTO {
private String firstName;
private String lastName;
private LocalDate dob;
private String gender;
private Long parentId;
private Long classId;
private String parentEmail;
}