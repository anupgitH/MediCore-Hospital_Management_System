package com.medicore.appointment;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotNull private Long patientId;
    @NotNull private Long doctorId;
    @NotNull private LocalDateTime appointmentAt;
    private String reason;
    private String status = "Scheduled";
    public Appointment() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public LocalDateTime getAppointmentAt() { return appointmentAt; }
    public void setAppointmentAt(LocalDateTime appointmentAt) { this.appointmentAt = appointmentAt; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
