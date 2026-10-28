import { useEffect, useMemo, useState } from 'react'
import { Activity, CalendarDays, ChevronRight, CircleHelp, ClipboardList, Clock3, LayoutDashboard, Menu, Plus, Search, Settings, ShieldCheck, Stethoscope, Users, UserRound, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '')
const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
]
const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase()
const dateLabel = (v) => { if (!v) return '—'; const d = new Date(v); return Number.isNaN(d.getTime()) ? v : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) }

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try { const body = await res.json(); message = body.detail || body.message || body.title || message } catch {}
    throw new Error(message)
  }
  if (res.status === 204) return null
  return res.json()
}

function App() {
  const [page, setPage] = useState('dashboard')
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [dashboard, setDashboard] = useState({ patients: 0, doctors: 0, appointments: 0 })
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [mobileNav, setMobileNav] = useState(false)

  async function loadAll() {
    setBusy(true); setError('')
    try {
      const [p, d, a, stats] = await Promise.all([
        request('/patients'), request('/doctors'), request('/appointments'), request('/dashboard')
      ])
      setPatients(p); setDoctors(d); setAppointments(a); setDashboard(stats)
    } catch (e) { setError(`${e.message}. Make sure the Spring Boot backend and MySQL are running.`) }
    finally { setBusy(false) }
  }
  useEffect(() => { loadAll() }, [])
  const filteredPatients = useMemo(() => patients.filter(p => `${p.fullName} ${p.phone || ''} ${p.email || ''}`.toLowerCase().includes(search.toLowerCase())), [patients, search])
  const filteredDoctors = useMemo(() => doctors.filter(d => `${d.fullName} ${d.specialty}`.toLowerCase().includes(search.toLowerCase())), [doctors, search])
  const patientById = id => patients.find(p => p.id === id)?.fullName || `Patient #${id}`
  const doctorById = id => doctors.find(d => d.id === id)?.fullName || `Doctor #${id}`

  async function savePatient(data) {
    await request('/patients', { method: 'POST', body: JSON.stringify(data) })
    setNotice('Patient registered successfully'); setModal(''); await loadAll()
  }
  async function saveDoctor(data) {
    await request('/doctors', { method: 'POST', body: JSON.stringify(data) })
    setNotice('Doctor added successfully'); setModal(''); await loadAll()
  }
  async function saveAppointment(data) {
    await request('/appointments', { method: 'POST', body: JSON.stringify(data) })
    setNotice('Appointment scheduled successfully'); setModal(''); await loadAll()
  }
  async function updateStatus(id, status) {
    try { await request(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); setNotice('Appointment status updated'); await loadAll() }
    catch (e) { setError(e.message) }
  }
  async function deletePatient(id) {
    if (!window.confirm('Delete this patient record? This action cannot be undone.')) return
    try { await request(`/patients/${id}`, { method: 'DELETE' }); setNotice('Patient deleted'); await loadAll() }
    catch (e) { setError(e.message) }
  }

  const activeNav = nav.find(n => n.id === page)
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Activity size={23} /></div><div><strong>MediCore</strong><span>CARE MANAGEMENT</span></div><button className="mobile-close" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(item => { const Icon = item.icon; return <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => { setPage(item.id); setSearch(''); setMobileNav(false) }}><Icon size={19}/><span>{item.label}</span>{page === item.id && <ChevronRight className="nav-chevron" size={16}/>}</button> })}</nav>
      <div className="sidebar-bottom"><div className="secure-card"><div className="secure-icon"><ShieldCheck size={19}/></div><div><strong>Patient-first care</strong><p>Keep records accurate and confidential.</p></div></div><button className="nav-item" onClick={() => setNotice('Configure environment variables in the README to customize MediCore.')}><Settings size={18}/><span>Settings</span></button><button className="nav-item" onClick={() => setNotice('See README.md for setup instructions and API documentation.')}><CircleHelp size={18}/><span>Help & support</span></button><div className="profile"><div className="profile-avatar">MC</div><div><strong>Hospital Admin</strong><span>Administrator</span></div><span className="online-dot"/></div></div>
    </aside>
    {mobileNav && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)}/>}
    <main className="main">
      <header className="topbar"><button className="menu-button" onClick={() => setMobileNav(true)}><Menu size={21}/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/> <strong>{activeNav?.label || 'Dashboard'}</strong></div><div className="top-actions"><span className="today-label"><span className="live-dot"/> System overview</span><div className="top-avatar">MC</div></div></header>
      <div className="page-content">
        {error && <div className="alert error"><AlertCircle size={18}/><span>{error}</span><button onClick={() => setError('')}><X size={16}/></button></div>}
        {notice && <div className="alert success"><CheckCircle2 size={18}/><span>{notice}</span><button onClick={() => setNotice('')}><X size={16}/></button></div>}
        <div className="page-heading"><div><div className="eyebrow">HOSPITAL OPERATIONS</div><h1>{page === 'dashboard' ? 'Good day, Admin' : activeNav?.label}</h1><p>{page === 'dashboard' ? 'Here’s what’s happening across your hospital today.' : page === 'patients' ? 'Manage patient registrations and contact information.' : page === 'doctors' ? 'View your care team and manage doctor profiles.' : 'Schedule visits and track appointment progress.'}</p></div><button className="button primary" onClick={() => setModal(page === 'doctors' ? 'doctor' : page === 'appointments' ? 'appointment' : 'patient')}><Plus size={17}/>{page === 'doctors' ? 'Add doctor' : page === 'appointments' ? 'New appointment' : 'Register patient'}</button></div>
        {page === 'dashboard' && <Dashboard dashboard={dashboard} appointments={appointments} patients={patients} patientById={patientById} doctorById={doctorById} setPage={setPage} busy={busy} refresh={loadAll}/>}
        {page === 'patients' && <section className="panel"><div className="panel-toolbar"><div><h2>Patient directory</h2><p>{patients.length} registered patient{patients.length === 1 ? '' : 's'}</p></div><div className="searchbox"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..."/></div></div><PatientTable patients={filteredPatients} onDelete={deletePatient}/></section>}
        {page === 'doctors' && <section className="panel"><div className="panel-toolbar"><div><h2>Medical team</h2><p>{doctors.length} doctor{doctors.length === 1 ? '' : 's'} on record</p></div><div className="searchbox"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors..."/></div></div><DoctorTable doctors={filteredDoctors}/></section>}
        {page === 'appointments' && <section className="panel"><div className="panel-toolbar"><div><h2>Appointment schedule</h2><p>Review and update visit status</p></div><div className="searchbox"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient or doctor..."/></div></div><AppointmentTable appointments={appointments.filter(a => `${patientById(a.patientId)} ${doctorById(a.doctorId)} ${a.status}`.toLowerCase().includes(search.toLowerCase()))} patientById={patientById} doctorById={doctorById} updateStatus={updateStatus}/></section>}
        <footer className="footer"><span>© {new Date().getFullYear()} MediCore Hospital Management</span><span><span className="footer-dot"/> API-connected workspace</span></footer>
      </div>
    </main>
    {modal && <Modal type={modal} onClose={() => setModal('')} patients={patients} doctors={doctors} onPatient={savePatient} onDoctor={saveDoctor} onAppointment={saveAppointment}/>}
  </div>
}

function Dashboard({ dashboard, appointments, patients, patientById, doctorById, setPage, busy, refresh }) {
  const upcoming = [...appointments].filter(a => a.status === 'Scheduled').sort((a,b) => new Date(a.appointmentAt) - new Date(b.appointmentAt)).slice(0,5)
  const completed = appointments.filter(a => a.status === 'Completed').length
  const cards = [
    { label: 'Total patients', value: dashboard.patients, icon: Users, tone: 'teal', note: 'Patient records' },
    { label: 'Medical team', value: dashboard.doctors, icon: Stethoscope, tone: 'blue', note: 'Registered doctors' },
    { label: 'Appointments', value: dashboard.appointments, icon: CalendarDays, tone: 'violet', note: 'All visit records' },
    { label: 'Completed visits', value: completed, icon: CheckCircle2, tone: 'amber', note: 'Marked completed' },
  ]
  return <>
    <div className="welcome-banner"><div className="welcome-copy"><div className="welcome-chip"><span/> HOSPITAL OVERVIEW</div><h2>Better care starts<br/>with better coordination.</h2><p>One clear view of patients, care teams, and scheduled visits.</p><button className="banner-button" onClick={() => setPage('appointments')}>View appointments <ChevronRight size={16}/></button></div><div className="banner-art"><div className="art-circle circle-one"/><div className="art-circle circle-two"/><div className="art-cross"><span/><i/></div><div className="art-card"><Activity size={22}/><div><strong>Care in sync</strong><span>Connected operations</span></div><CheckCircle2 size={19}/></div></div></div>
    <div className="stats-grid">{cards.map(c => {const Icon = c.icon; return <div className="stat-card" key={c.label}><div className={`stat-icon ${c.tone}`}><Icon size={20}/></div><span className="stat-label">{c.label}</span><div className="stat-value">{busy ? '—' : c.value}</div><span className="stat-note">{c.note}</span></div>})}</div>
    <div className="dashboard-grid"><section className="panel upcoming-panel"><div className="panel-toolbar"><div><h2>Upcoming appointments</h2><p>Your next scheduled visits</p></div><button className="text-button" onClick={() => setPage('appointments')}>View all <ChevronRight size={15}/></button></div>{upcoming.length ? <div className="appointment-list">{upcoming.map(a => <div className="appointment-row" key={a.id}><div className="appointment-date"><strong>{new Date(a.appointmentAt).toLocaleDateString([], {day:'2-digit'})}</strong><span>{new Date(a.appointmentAt).toLocaleDateString([], {month:'short'})}</span></div><div className="appointment-person"><div className="person-avatar">{initials(patientById(a.patientId))}</div><div><strong>{patientById(a.patientId)}</strong><span>{doctorById(a.doctorId)}</span></div></div><div className="appointment-time"><Clock3 size={14}/>{new Date(a.appointmentAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div><span className="status-pill scheduled">Scheduled</span></div>)}</div> : <Empty icon={CalendarDays} title="No upcoming visits" text="Newly scheduled appointments will appear here." action="Schedule appointment" onClick={() => setPage('appointments')}/>}</section>
    <section className="panel quick-panel"><div className="panel-toolbar"><div><h2>Quick actions</h2><p>Common tasks, one click away</p></div></div><button className="quick-action" onClick={() => setPage('patients')}><div className="quick-icon teal"><UserRound size={19}/></div><div><strong>Patient directory</strong><span>Find or review patient records</span></div><ChevronRight size={17}/></button><button className="quick-action" onClick={() => setPage('doctors')}><div className="quick-icon blue"><Stethoscope size={19}/></div><div><strong>Medical team</strong><span>Review doctor profiles</span></div><ChevronRight size={17}/></button><button className="quick-action" onClick={() => setPage('appointments')}><div className="quick-icon violet"><ClipboardList size={19}/></div><div><strong>Manage appointments</strong><span>Track scheduled and completed visits</span></div><ChevronRight size={17}/></button><div className="system-note"><ShieldCheck size={17}/><span>Use test data only until authentication and access controls are configured.</span></div></section></div>
  </>
}

function PatientTable({ patients, onDelete }) {
  if (!patients.length) return <Empty icon={Users} title="No patients found" text="Register a patient or adjust your search."/>
  return <div className="table-wrap"><table><thead><tr><th>Patient</th><th>Patient ID</th><th>Phone</th><th>Blood group</th><th>Gender</th><th/></tr></thead><tbody>{patients.map(p => <tr key={p.id}><td><div className="table-person"><div className="person-avatar">{initials(p.fullName)}</div><div><strong>{p.fullName}</strong><span>{p.email || 'No email provided'}</span></div></div></td><td><span className="id-tag">PT-{String(p.id).padStart(4,'0')}</span></td><td>{p.phone || '—'}</td><td>{p.bloodGroup || '—'}</td><td>{p.gender || '—'}</td><td><button className="icon-button danger" title="Delete patient" onClick={() => onDelete(p.id)}><X size={16}/></button></td></tr>)}</tbody></table></div>
}
function DoctorTable({ doctors }) {
  if (!doctors.length) return <Empty icon={Stethoscope} title="No doctors added yet" text="Add a doctor to start building your medical team."/>
  return <div className="table-wrap"><table><thead><tr><th>Doctor</th><th>Doctor ID</th><th>Specialty</th><th>Phone</th><th>Status</th></tr></thead><tbody>{doctors.map(d => <tr key={d.id}><td><div className="table-person"><div className="person-avatar doctor">{initials(d.fullName)}</div><div><strong>{d.fullName}</strong><span>{d.email || 'No email provided'}</span></div></div></td><td><span className="id-tag">DR-{String(d.id).padStart(4,'0')}</span></td><td>{d.specialty}</td><td>{d.phone || '—'}</td><td><span className="status-pill completed">{d.availability || 'Available'}</span></td></tr>)}</tbody></table></div>
}
function AppointmentTable({ appointments, patientById, doctorById, updateStatus }) {
  if (!appointments.length) return <Empty icon={CalendarDays} title="No appointments found" text="Create an appointment or change your search."/>
  return <div className="table-wrap"><table><thead><tr><th>Patient</th><th>Doctor</th><th>Date & time</th><th>Reason</th><th>Status</th><th>Update</th></tr></thead><tbody>{[...appointments].sort((a,b) => new Date(b.appointmentAt)-new Date(a.appointmentAt)).map(a => <tr key={a.id}><td><strong>{patientById(a.patientId)}</strong><span className="cell-sub">APT-{String(a.id).padStart(4,'0')}</span></td><td>{doctorById(a.doctorId)}</td><td>{dateLabel(a.appointmentAt)}</td><td>{a.reason || 'General consultation'}</td><td><span className={`status-pill ${a.status?.toLowerCase()}`}>{a.status}</span></td><td><select className="status-select" value={a.status} onChange={e => updateStatus(a.id,e.target.value)} aria-label={`Update appointment ${a.id}`}><option>Scheduled</option><option>Completed</option><option>Cancelled</option></select></td></tr>)}</tbody></table></div>
}
function Empty({ icon: Icon, title, text, action, onClick }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={23}/></div><strong>{title}</strong><p>{text}</p>{action && <button className="button secondary small" onClick={onClick}>{action}</button>}</div>
}
function Modal({ type, onClose, patients, doctors, onPatient, onDoctor, onAppointment }) {
  const [form, setForm] = useState({ gender: 'Prefer not to say', status: 'Scheduled' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const update = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const submit = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (type === 'patient') await onPatient({ fullName: form.fullName?.trim(), dateOfBirth: form.dateOfBirth || null, gender: form.gender, phone: form.phone || null, email: form.email || null, bloodGroup: form.bloodGroup || null })
      if (type === 'doctor') await onDoctor({ fullName: form.fullName?.trim(), specialty: form.specialty?.trim(), phone: form.phone || null, email: form.email || null, availability: 'Available' })
      if (type === 'appointment') await onAppointment({ patientId: Number(form.patientId), doctorId: Number(form.doctorId), appointmentAt: form.appointmentAt, reason: form.reason || 'General consultation' })
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }
  const title = type === 'patient' ? 'Register patient' : type === 'doctor' ? 'Add doctor' : 'Schedule appointment'
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><div className="modal"><div className="modal-header"><div><span className="eyebrow">MEDICORE WORKSPACE</span><h2>{title}</h2></div><button className="icon-button" onClick={onClose}><X size={19}/></button></div><form onSubmit={submit} className="modal-form">
    {type === 'patient' && <>
      <label>Full name *<input name="fullName" value={form.fullName || ''} onChange={update} required maxLength="120" placeholder="Enter patient's full name"/></label>
      <div className="form-row"><label>Date of birth<input type="date" name="dateOfBirth" value={form.dateOfBirth || ''} onChange={update}/></label><label>Gender<select name="gender" value={form.gender} onChange={update}><option>Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option></select></label></div>
      <div className="form-row"><label>Phone<input name="phone" value={form.phone || ''} onChange={update} pattern="[0-9+() -]{7,20}" placeholder="+91 98765 43210"/></label><label>Blood group<select name="bloodGroup" value={form.bloodGroup || ''} onChange={update}><option value="">Not recorded</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(x=><option key={x}>{x}</option>)}</select></label></div>
      <label>Email address<input type="email" name="email" value={form.email || ''} onChange={update} placeholder="patient@example.com"/></label>
    </>}
    {type === 'doctor' && <>
      <label>Doctor's full name *<input name="fullName" value={form.fullName || ''} onChange={update} required placeholder="Dr. Full Name"/></label>
      <label>Specialty *<select name="specialty" value={form.specialty || ''} onChange={update} required><option value="">Select specialty</option>{['General Medicine','Cardiology','Dermatology','Neurology','Orthopedics','Pediatrics','Gynecology','ENT','Ophthalmology','Psychiatry','Dentistry','Radiology','Other'].map(x=><option key={x}>{x}</option>)}</select></label>
      <div className="form-row"><label>Phone<input name="phone" value={form.phone || ''} onChange={update} placeholder="+91 98765 43210"/></label><label>Email<input type="email" name="email" value={form.email || ''} onChange={update} placeholder="doctor@hospital.com"/></label></div>
    </>}
    {type === 'appointment' && <>
      {patients.length === 0 || doctors.length === 0 ? <div className="form-warning"><AlertCircle size={18}/> Add at least one patient and one doctor before scheduling.</div> : <>
        <label>Patient *<select name="patientId" value={form.patientId || ''} onChange={update} required><option value="">Choose a patient</option>{patients.map(p=><option key={p.id} value={p.id}>{p.fullName} · PT-{String(p.id).padStart(4,'0')}</option>)}</select></label>
        <label>Doctor *<select name="doctorId" value={form.doctorId || ''} onChange={update} required><option value="">Choose a doctor</option>{doctors.map(d=><option key={d.id} value={d.id}>{d.fullName} · {d.specialty}</option>)}</select></label>
        <label>Date and time *<input type="datetime-local" name="appointmentAt" value={form.appointmentAt || ''} onChange={update} required min={new Date().toISOString().slice(0,16)}/></label>
        <label>Reason for visit<input name="reason" value={form.reason || ''} onChange={update} maxLength="240" placeholder="e.g. General consultation"/></label>
      </>}
    </>}
    {error && <div className="form-error"><AlertCircle size={16}/>{error}</div>}
    <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" disabled={saving || (type === 'appointment' && (!patients.length || !doctors.length))}>{saving ? 'Saving...' : type === 'patient' ? 'Register patient' : type === 'doctor' ? 'Add doctor' : 'Schedule visit'}</button></div>
  </form></div></div>
}
export default App
