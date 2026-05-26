package com.school.management.system.payload.request;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class ClassRequestDTO {
    @NotBlank
    private String className;
    @NotBlank
    private String section;
    // Teacher assignment is optional - can be null
    private Long teacherId;
}
