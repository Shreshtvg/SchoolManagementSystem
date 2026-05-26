package com.school.management.system.payload.request;

import lombok.Data;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

@Data
public class TeacherRequestDTO {
    @NotBlank
    private String name;
    
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    private String subject;

    // We will create a User account for the teacher automatically
    @NotBlank
    private String username;
    
    private Long classId; 
}