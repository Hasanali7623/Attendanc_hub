package com.project.repositories;

import com.project.models.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findBySemester(String semester);
    List<Subject> findByDepartment(String department);
    List<Subject> findBySemesterAndDepartment(String semester, String department);
    List<Subject> findByIsActive(Boolean isActive);
    Optional<Subject> findByCode(String code);
    List<Subject> findAllByOrderByCreatedAtDesc();
}
