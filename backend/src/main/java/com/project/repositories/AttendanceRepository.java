package com.project.repositories;

import com.project.models.Attendance;
import com.project.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    List<Attendance> findByStudent(User student);
    
    List<Attendance> findByStudentId(Long studentId);
    
    List<Attendance> findByStudentIdOrderByDateDesc(Long studentId);
    
    List<Attendance> findByStudentIdAndDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);
    
    List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    Optional<Attendance> findByStudentAndDateAndSubject(User student, LocalDate date, String subject);
    
    List<Attendance> findByStudentAndSubject(User student, String subject);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = 'PRESENT'")
    Long countPresentByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = 'ABSENT'")
    Long countAbsentByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId")
    Long countTotalByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT a.subject, COUNT(a) FROM Attendance a WHERE a.student.id = :studentId GROUP BY a.subject")
    List<Object[]> countBySubjectForStudent(@Param("studentId") Long studentId);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status = 'PRESENT'")
    Long countPresentByDate(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status = 'ABSENT'")
    Long countAbsentByDate(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(DISTINCT a.student.id) FROM Attendance a WHERE a.date = :date AND a.status = 'PRESENT'")
    Long countDistinctPresentStudentsByDate(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(DISTINCT a.student.id) FROM Attendance a WHERE a.date = :date AND a.status = 'ABSENT' " +
           "AND a.student.id NOT IN (SELECT DISTINCT a2.student.id FROM Attendance a2 WHERE a2.date = :date AND a2.status = 'PRESENT')")
    Long countDistinctAbsentStudentsByDate(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(DISTINCT a.student.id) FROM Attendance a WHERE a.date = :date")
    Long countDistinctStudentsWithAttendanceByDate(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status = 'PRESENT' AND a.student.department = :department")
    Long countPresentByDateAndDepartment(@Param("date") LocalDate date, @Param("department") String department);
    
    @Query("SELECT a.subject, a.markedBy, COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END) as present, " +
           "COUNT(CASE WHEN a.status = 'ABSENT' THEN 1 END) as absent, COUNT(a) as total " +
           "FROM Attendance a WHERE a.date = :date GROUP BY a.subject, a.markedBy")
    List<Object[]> findTodayAttendanceBySubjectAndTeacher(@Param("date") LocalDate date);
    
    List<Attendance> findByDate(LocalDate date);
}
