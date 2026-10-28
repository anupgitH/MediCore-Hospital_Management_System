package com.medicore.dashboard;

import com.medicore.patient.PatientRepository;
import com.medicore.doctor.DoctorRepository;
import com.medicore.appointment.AppointmentRepository;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {
    private final PatientRepository patients;
    private final DoctorRepository doctors;
    private final AppointmentRepository appointments;
    public DashboardController(PatientRepository patients, DoctorRepository doctors, AppointmentRepository appointments) {
        this.patients = patients; this.doctors = doctors; this.appointments = appointments;
    }
    @GetMapping("/health") public Map<String, String> health() { return Map.of("status", "ok", "service", "MediCore API"); }
    @GetMapping("/dashboard") public Map<String, Long> dashboard() {
        return Map.of("patients", patients.count(), "doctors", doctors.count(), "appointments", appointments.count());
    }
}
