package com.school.management.system.payload.request;

import lombok.Data;
import java.time.LocalDate;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class StudentWithParentDTO {

    // Student Details
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    @NotNull
    private LocalDate dob;
    @NotBlank
    private String gender;
    // Class assignment is optional - can be null
    private Long classId;

    // New Parent Details
    @NotBlank
    private String parentName;
    @NotBlank
    @Email
    private String parentEmail;
    @NotBlank
    private String parentPhone;
    @NotBlank
    private String parentUsername;
}