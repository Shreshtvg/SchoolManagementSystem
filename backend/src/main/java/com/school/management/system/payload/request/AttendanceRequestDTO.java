package com.school.management.system.payload.request;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class AttendanceRequestDTO {
    @NotNull
    private Long studentId;
    @NotBlank
    private String month;
    @NotNull
    private Integer daysAttended;
    @NotNull
    private Integer totalWorkingDays;
}