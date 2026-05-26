package com.school.management.system.repository;

import com.school.management.system.entity.Teacher;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
	Optional<Teacher> findByUserId(Long userId);
	
	@Query("SELECT t FROM Teacher t WHERE t.id NOT IN (SELECT c.teacher.id FROM ClassDetails c WHERE c.teacher IS NOT NULL)")
    List<Teacher> findTeachersNotAssignedToAnyClass();
	
}