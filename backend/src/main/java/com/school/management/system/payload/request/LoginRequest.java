package com.school.management.system.payload.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class LoginRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;
    
    // Optional: Expected role for role-based login validation
    private String expectedRole;
}