package com.project.controllers;

import com.project.services.PdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/pdf")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PdfController {
    
    private final PdfService pdfService;
    
    @GetMapping("/monthly/{studentId}")
    public ResponseEntity<byte[]> generateMonthlyPdf(
            @PathVariable Long studentId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        
        // Use current month and year if not provided
        LocalDate now = LocalDate.now();
        int targetMonth = month != null ? month : now.getMonthValue();
        int targetYear = year != null ? year : now.getYear();
        
        byte[] pdfBytes = pdfService.generateMonthlyAttendancePdf(studentId, targetMonth, targetYear);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", 
                "attendance-report-" + studentId + "-" + targetMonth + "-" + targetYear + ".pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
    
    @GetMapping("/generate")
    public ResponseEntity<byte[]> generatePdf(
            @RequestParam Long studentId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        return generateMonthlyPdf(studentId, month, year);
    }
}
