package com.project.repositories;

import com.project.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByStudentId(String studentId);
    
    Boolean existsByEmail(String email);
    
    Boolean existsByStudentId(String studentId);
    
    List<User> findByRole(User.Role role);
    
    List<User> findByRoleAndIsActive(User.Role role, Boolean isActive);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.isActive = true")
    Long countByRole(@Param("role") User.Role role);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.department = :department AND u.isActive = true")
    Long countByRoleAndDepartment(@Param("role") User.Role role, @Param("department") String department);
    
    Optional<User> findTopByStudentIdStartingWithOrderByStudentIdDesc(String prefix);
}
