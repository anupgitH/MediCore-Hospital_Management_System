package com.medicore.patient;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {
    private final PatientRepository repository;
    public PatientController(PatientRepository repository) { this.repository = repository; }

    @GetMapping
    public List<Patient> list(@RequestParam(required = false) String q) {
        return q == null || q.isBlank() ? repository.findAll() : repository.search(q.trim());
    }

    @GetMapping("/{id}")
    public Patient get(@PathVariable Long id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Patient create(@Valid @RequestBody Patient patient) {
        patient.setId(null);
        return repository.save(patient);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found");
        repository.deleteById(id);
    }
}
