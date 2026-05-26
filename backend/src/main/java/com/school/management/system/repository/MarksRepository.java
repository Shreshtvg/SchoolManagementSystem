package com.school.management.system.repository;

import com.school.management.system.entity.Marks;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {
	List<Marks> findByStudentId(Long studentId);
	Optional<Marks> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
	
	// Find the latest mark for each subject for a student (to avoid duplicates)
	@Query("SELECT m FROM Marks m WHERE m.student.id = :studentId " +
		"AND m.id IN (SELECT MAX(m2.id) FROM Marks m2 WHERE m2.student.id = :studentId GROUP BY m2.subject.id)")
	List<Marks> findLatestMarksByStudentId(@Param("studentId") Long studentId);
}