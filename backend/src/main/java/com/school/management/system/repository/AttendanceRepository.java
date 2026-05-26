package com.school.management.system.repository;

import com.school.management.system.entity.Attendance;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
	List<Attendance> findByStudentId(Long studentId);
	Optional<Attendance> findByStudentIdAndMonth(Long studentId, String month);
}