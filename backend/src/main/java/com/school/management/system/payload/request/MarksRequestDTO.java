package com.school.management.system.payload.request;
import lombok.Data;
import javax.validation.constraints.NotNull;
@Data
public class MarksRequestDTO {
@NotNull
private Long studentId;
@NotNull
private Long subjectId;
@NotNull
private Double marksObtained;
}