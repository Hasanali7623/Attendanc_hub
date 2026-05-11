package com.project.services;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.project.dto.AttendanceResponse;
import com.project.exception.ResourceNotFoundException;
import com.project.models.Attendance;
import com.project.models.User;
import com.project.repositories.AttendanceRepository;
import com.project.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PdfService {
    
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final AttendanceService attendanceService;
    
    public byte[] generateMonthlyAttendancePdf(Long studentId, int month, int year) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        
        List<Attendance> attendances = attendanceRepository.findByStudentIdAndDateBetween(
                studentId, startDate, endDate);
        
        Map<String, Object> stats = attendanceService.getAttendanceStats(studentId);
        
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            
            // Title
            Paragraph title = new Paragraph("Monthly Attendance Report")
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(title);
            
            // Student Information
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Student Name: " + student.getName()).setFontSize(12));
            document.add(new Paragraph("Email: " + student.getEmail()).setFontSize(12));
            document.add(new Paragraph("Student ID: " + (student.getStudentId() != null ? student.getStudentId() : "N/A")).setFontSize(12));
            document.add(new Paragraph("Department: " + (student.getDepartment() != null ? student.getDepartment() : "N/A")).setFontSize(12));
            document.add(new Paragraph("Month: " + startDate.format(DateTimeFormatter.ofPattern("MMMM yyyy"))).setFontSize(12));
            document.add(new Paragraph("\n"));
            
            // Summary Statistics
            document.add(new Paragraph("Attendance Summary").setFontSize(14).setBold());
            document.add(new Paragraph("Total Classes: " + stats.get("totalClasses")).setFontSize(11));
            document.add(new Paragraph("Total Present: " + stats.get("totalPresent")).setFontSize(11));
            document.add(new Paragraph("Total Absent: " + stats.get("totalAbsent")).setFontSize(11));
            document.add(new Paragraph("Attendance Percentage: " + stats.get("percentage") + "%").setFontSize(11).setBold());
            document.add(new Paragraph("\n"));
            
            // Subject-wise Attendance
            if (stats.get("subjectWise") != null) {
                Map<String, Long> subjectWise = (Map<String, Long>) stats.get("subjectWise");
                document.add(new Paragraph("Subject-wise Attendance").setFontSize(14).setBold());
                
                Table subjectTable = new Table(UnitValue.createPercentArray(new float[]{3, 2}));
                subjectTable.setWidth(UnitValue.createPercentValue(100));
                
                subjectTable.addHeaderCell(new Cell().add(new Paragraph("Subject").setBold())
                        .setBackgroundColor(ColorConstants.LIGHT_GRAY));
                subjectTable.addHeaderCell(new Cell().add(new Paragraph("Total Classes").setBold())
                        .setBackgroundColor(ColorConstants.LIGHT_GRAY));
                
                for (Map.Entry<String, Long> entry : subjectWise.entrySet()) {
                    subjectTable.addCell(new Cell().add(new Paragraph(entry.getKey())));
                    subjectTable.addCell(new Cell().add(new Paragraph(String.valueOf(entry.getValue()))));
                }
                
                document.add(subjectTable);
                document.add(new Paragraph("\n"));
            }
            
            // Detailed Attendance Records
            document.add(new Paragraph("Detailed Attendance Records").setFontSize(14).setBold());
            
            Table table = new Table(UnitValue.createPercentArray(new float[]{2, 3, 2, 3}));
            table.setWidth(UnitValue.createPercentValue(100));
            
            // Table headers
            table.addHeaderCell(new Cell().add(new Paragraph("Date").setBold())
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY));
            table.addHeaderCell(new Cell().add(new Paragraph("Subject").setBold())
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY));
            table.addHeaderCell(new Cell().add(new Paragraph("Status").setBold())
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY));
            table.addHeaderCell(new Cell().add(new Paragraph("Remarks").setBold())
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY));
            
            // Table data
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy");
            for (Attendance attendance : attendances) {
                table.addCell(new Cell().add(new Paragraph(attendance.getDate().format(dateFormatter))));
                table.addCell(new Cell().add(new Paragraph(attendance.getSubject())));
                
                Cell statusCell = new Cell().add(new Paragraph(attendance.getStatus().name()));
                if (attendance.getStatus() == Attendance.AttendanceStatus.PRESENT) {
                    statusCell.setBackgroundColor(ColorConstants.GREEN).setFontColor(ColorConstants.WHITE);
                } else if (attendance.getStatus() == Attendance.AttendanceStatus.ABSENT) {
                    statusCell.setBackgroundColor(ColorConstants.RED).setFontColor(ColorConstants.WHITE);
                }
                table.addCell(statusCell);
                
                table.addCell(new Cell().add(new Paragraph(
                        attendance.getRemarks() != null ? attendance.getRemarks() : "")));
            }
            
            document.add(table);
            
            // Footer
            document.add(new Paragraph("\n\n"));
            document.add(new Paragraph("Generated on: " + LocalDate.now().format(dateFormatter))
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.RIGHT));
            
            document.close();
            
            return baos.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }
    }
}
