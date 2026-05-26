package com.school.management.system.repository;

import com.school.management.system.entity.ClassDetails;
import com.school.management.system.entity.Teacher;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassDetailsRepository extends JpaRepository<ClassDetails, Long> {
	Optional<ClassDetails> findByTeacherId(Long teacherId);
    boolean existsByClassNameAndSection(String className, String section);
    boolean existsByTeacher(Teacher teacher);
}