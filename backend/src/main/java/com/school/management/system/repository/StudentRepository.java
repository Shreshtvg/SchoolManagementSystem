package com.school.management.system.repository;

import com.school.management.system.entity.Student;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
	Optional<Student> findByParentId(Long parentId);
	List<Student> findByClassDetailsId(Long classId);
	
	@EntityGraph(attributePaths = {"parent", "classDetails"})
	@Override
	List<Student> findAll();
}