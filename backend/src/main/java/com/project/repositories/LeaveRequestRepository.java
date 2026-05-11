package com.project.repositories;

import com.project.models.LeaveRequest;
import com.project.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    
    List<LeaveRequest> findByStudent(User student);
    
    List<LeaveRequest> findByStudentId(Long studentId);
    
    List<LeaveRequest> findByStatus(LeaveRequest.LeaveStatus status);
    
    List<LeaveRequest> findByStudentIdAndStatus(Long studentId, LeaveRequest.LeaveStatus status);
    
    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.student.id = :studentId AND l.status = :status")
    Long countByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") LeaveRequest.LeaveStatus status);
    
    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.status = :status")
    Long countByStatus(@Param("status") LeaveRequest.LeaveStatus status);
    
    List<LeaveRequest> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    
    List<LeaveRequest> findAllByOrderByCreatedAtDesc();
    
    List<LeaveRequest> findTop5ByOrderByCreatedAtDesc();
}
