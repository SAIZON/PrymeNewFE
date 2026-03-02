package com.pryme.loan.controller;

import com.pryme.loan.dto.LoanDocumentDto;
import com.pryme.loan.entity.Application;
import com.pryme.loan.entity.DocumentStatus;
import com.pryme.loan.entity.DocumentType;
import com.pryme.loan.entity.LoanDocument;
import com.pryme.loan.repository.ApplicationRepository;
import com.pryme.loan.repository.LoanDocumentRepository;
import com.pryme.loan.service.DocumentStorageService;
import com.pryme.loan.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentStorageService storageService;
    private final LoanDocumentRepository documentRepository;
    private final ApplicationRepository applicationRepository;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LoanDocumentDto> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("applicationId") Long applicationId,
            @RequestParam("type") DocumentType type,
            Principal principal) {

        // 1. Authorization: Ensure user owns the application
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getUser().getEmail().equals(principal.getName())) {
            throw new AccessDeniedException("You do not own this application");
        }

        // 2. Validation
        if (file.isEmpty() || file.getSize() > 5 * 1024 * 1024) { // 5MB limit
            throw new IllegalArgumentException("Invalid file size");
        }

        // 3. Storage
        String storedFilePath = storageService.storeFile(file);

        // 4. Persistence
        LoanDocument doc = new LoanDocument();
        doc.setApplication(app);
        doc.setFileName(file.getOriginalFilename());
        doc.setFilePath(storedFilePath);
        doc.setType(type);
        doc.setStatus(DocumentStatus.PENDING);

        LoanDocument savedDoc = documentRepository.save(doc);

        return ResponseEntity.ok(convertToDto(savedDoc));
    }

    // --- FIX: Added the missing conversion method ---
    private LoanDocumentDto convertToDto(LoanDocument doc) {
        return new LoanDocumentDto(
                doc.getId(),
                doc.getFileName(), // Maps the entity's filename to DTO's 'name'
                doc.getType() != null ? doc.getType().name() : "OTHER",
                doc.getStatus() != null ? doc.getStatus().name() : "PENDING",
                doc.getUploadedAt()
        );
    }
}