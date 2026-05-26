package com.school.management.system.payload.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StudentUpdateRequestDTO {
    
    private String firstName;
    private String lastName;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dob;
    
    private String address;
    private String contactPhone;
    private String parentName;
    private String parentEmail;
    private String parentPhone;
}