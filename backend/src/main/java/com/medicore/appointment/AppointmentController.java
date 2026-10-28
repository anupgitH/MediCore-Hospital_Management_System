package com.medicore.appointment;

import com.medicore.doctor.DoctorRepository;
import com.medicore.patient.PatientRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentRepository appointments;
    private final PatientRepository patients;
    private final DoctorRepository doctors;
    private static final Set<String> STATUSES = Set.of("Scheduled", "Completed", "Cancelled");

    public AppointmentController(AppointmentRepository appointments, PatientRepository patients, DoctorRepository doctors) {
        this.appointments = appointments; this.patients = patients; this.doctors = doctors;
    }

    @GetMapping public List<Appointment> list() { return appointments.findAll(); }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Appointment create(@Valid @RequestBody Appointment appointment) {
        if (!patients.existsById(appointment.getPatientId())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Patient does not exist");
        if (!doctors.existsById(appointment.getDoctorId())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor does not exist");
        appointment.setId(null);
        appointment.setStatus("Scheduled");
        return appointments.save(appointment);
    }

    @PatchMapping("/{id}/status")
    public Appointment updateStatus(@PathVariable Long id, @RequestBody StatusUpdate update) {
        Appointment appointment = appointments.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        if (update == null || !STATUSES.contains(update.status())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be Scheduled, Completed, or Cancelled");
        appointment.setStatus(update.status());
        return appointments.save(appointment);
    }

    public record StatusUpdate(String status) {}
}
