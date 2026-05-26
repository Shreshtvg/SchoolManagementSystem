package com.school.management.system.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Table(name = "class_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String className;
    private String section;

    @ManyToOne // Switched back from @OneToOne
    @JoinColumn(name = "teacher_id") // 'unique = true' is removed
    private Teacher teacher;
}