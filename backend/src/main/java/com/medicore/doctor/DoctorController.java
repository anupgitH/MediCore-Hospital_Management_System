package com.medicore.doctor;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {
    private final DoctorRepository repository;
    public DoctorController(DoctorRepository repository) { this.repository = repository; }
    @GetMapping public List<Doctor> list() { return repository.findAll(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Doctor create(@Valid @RequestBody Doctor doctor) { doctor.setId(null); return repository.save(doctor); }
}
