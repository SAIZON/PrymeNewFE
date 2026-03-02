package com.pryme.loan.repository;

import com.pryme.loan.entity.LoanDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
// import java.util.UUID; // REMOVE THIS

public interface LoanDocumentRepository extends JpaRepository<LoanDocument, Long> {

    // CHANGE UUID to Long
    List<LoanDocument> findByApplicationId(Long applicationId);
}