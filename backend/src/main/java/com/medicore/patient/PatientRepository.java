package com.medicore.patient;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    @Query("select p from Patient p where lower(p.fullName) like lower(concat('%', :q, '%')) or lower(coalesce(p.phone,'')) like lower(concat('%', :q, '%')) or lower(coalesce(p.email,'')) like lower(concat('%', :q, '%'))")
    List<Patient> search(@Param("q") String query);
}
