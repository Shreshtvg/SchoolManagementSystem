package com.school.management.system.repository;

import com.school.management.system.entity.Fees;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeesRepository extends JpaRepository<Fees, Long> {
	 Optional<Fees> findByStudentId(Long studentId);
}