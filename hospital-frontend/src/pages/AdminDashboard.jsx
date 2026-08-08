import { useEffect, useState } from 'react'
import {
    fetchDoctors,
    fetchAdminAllAppointments,
    createDoctorProfile,
    fetchAllUsers
} from '../api'

function AdminDashboard() {
    const [doctors, setDoctors] = useState([])
    const [appointments, setAppointments] = useState([])
    const [pendingStaff, setPendingStaff] = useState([]) // New state for unprovisioned users
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [doctorForm, setDoctorForm] = useState({
        user_id: '',
        name: '',
        specialization: '',
        phone_number: ''
    })

    // Helper function to fetch users from backend to see who is waiting for a profile
    async function fetchPendingStaffUsers() {
        return fetchAllUsers();
    }

    async function loadAdminData() {
        setLoading(true)
        setError('')
        try {
            const [doctorList, allAppointments, allUsers] = await Promise.all([
                fetchDoctors(),
                fetchAdminAllAppointments(),
                fetchPendingStaffUsers().catch(() => []) // Fallback graceful handle if route isn't ready
            ])

            setDoctors(doctorList || [])
            setAppointments(allAppointments || [])

            // Filter out users who have a "doctor" role but whose user_id is NOT found in active doctors list
            const activeDoctorUserIds = (doctorList || []).map(d => Number(d.user_id));
            const pending = (allUsers || []).filter(user =>
                user.role === 'doctor' && !activeDoctorUserIds.includes(Number(user.id))
            );
            setPendingStaff(pending)

        } catch (requestError) {
            setError(
                requestError?.response?.data?.detail || 'Failed to fetch comprehensive hospital metrics.'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAdminData()
    }, [])

    // Automatically transfers details from the raw user list straight into your creation form
    function handleSelectPendingUser(user) {
        setDoctorForm({
            user_id: String(user.id),
            name: user.name || user.username || '',
            specialization: '',
            phone_number: ''
        });
        setSuccess(`Loaded User #${user.id} into provisioning form. Fill in specialization to complete validation.`);
    }

    async function handleCreateDoctor(event) {
        event.preventDefault()
        setError('')
        setSuccess('')

        try {
            const payload = {
                ...doctorForm,
                user_id: Number(doctorForm.user_id)
            }

            await createDoctorProfile(payload)
            setSuccess(`Clinical credentials for Dr. ${doctorForm.name} have been verified and saved!`)
            setDoctorForm({ user_id: '', name: '', specialization: '', phone_number: '' })
            await loadAdminData()
        } catch (requestError) {
            setError(
                requestError?.response?.data?.detail || 'Could not instantiate doctor configuration.'
            )
        }
    }

    return (
        <main className="dashboard-shell">
            <section className="dashboard-header">
                <div>
                    <p className="eyebrow">System Administrator View</p>
                    <h1>Hospital Command Console</h1>
                </div>
                <button type="button" className="secondary-button" onClick={loadAdminData} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh Metrics'}
                </button>
            </section>

            <section className="dashboard-grid">

                {/* PANEL 1: PENDING STAFF QUEUE */}
                <article className="panel">
                    <h2>Verification Queue ({pendingStaff.length})</h2>

                    {pendingStaff.length ? (
                        <div className="list-stack">
                            {pendingStaff.map((user) => (
                                <div key={user.id} className="list-card" style={{ borderLeft: '3px solid #e67e22', padding: '0.75rem' }}>
                                    <div>
                                        <strong>{user.username}</strong>
                                        <span style={{ marginLeft: '0.5rem', background: '#fdf2e9', color: '#e67e22' }} className="status">
                                            Awaiting Profile
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                        <small className="muted">User Account ID: {user.id}</small>
                                        <button
                                            type="button"
                                            className="status-button"
                                            style={{ margin: '0 0 0 1rem', padding: '2px 8px', fontSize: '0.75rem', background: '#3498db', color: '#fff' }}
                                            onClick={() => handleSelectPendingUser(user)}
                                        >
                                            Process Verification
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="muted">🎉 No pending staff validations outstanding.</p>
                    )}
                </article>

                {/* PANEL 2: PROVISIONING FORM */}
                <article className="panel">
                    <h2>Provision Clinical Profile</h2>
                    <form onSubmit={handleCreateDoctor} className="stacked-form">
                        <label>
                            Target User ID
                            <input
                                type="number"
                                value={doctorForm.user_id}
                                onChange={(e) => setDoctorForm({ ...doctorForm, user_id: e.target.value })}
                                placeholder="Select a user above or enter ID"
                                required
                            />
                        </label>

                        <label>
                            Practitioner Full Name
                            <input
                                type="text"
                                value={doctorForm.name}
                                onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                                placeholder="Dr. Alexander Fleming"
                                required
                            />
                        </label>

                        <label>
                            Clinical Specialization
                            <input
                                type="text"
                                value={doctorForm.specialization}
                                onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                                placeholder="e.g., Pediatrics, Cardiology"
                                required
                            />
                        </label>

                        <label>
                            Phone Number
                            <input
                                type="text"
                                value={doctorForm.phone_number}
                                onChange={(e) => setDoctorForm({ ...doctorForm, phone_number: e.target.value })}
                                placeholder="+1 (555) 019-2834"
                                required
                            />
                        </label>

                        {error && <p className="form-error">{error}</p>}
                        {success && <p className="form-success">{success}</p>}

                        <button type="submit" disabled={loading}>
                            Approve & Save to Registry
                        </button>
                    </form>
                </article>

                {/* PANEL 3: ACTIVE REGISTRY LIST */}
                <article className="panel full-width">
                    <h2>Verified & Active Medical Registry</h2>
                    {doctors.length ? (
                        <div className="list-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {doctors.map((doc) => (
                                <div key={doc.id} className="list-card" style={{ borderLeft: '3px solid #2ecc71' }}>
                                    <div>
                                        <strong>{doc.name}</strong>
                                        <span style={{ marginLeft: '0.5rem' }} className="status status-confirmed">
                                            {doc.specialization}
                                        </span>
                                    </div>
                                    <small className="muted">Profile ID: {doc.id} | Base UID: {doc.user_id} | Phone: {doc.phone_number}</small>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="muted">No doctors found matching records.</p>
                    )}
                </article>

                {/* PANEL 4: GLOBAL LEDGER */}
                <article className="panel full-width">
                    <h2>Global Appointment Audit Log</h2>
                    {appointments.length ? (
                        <div className="table-grid">
                            <div className="appointment-row" style={{ fontWeight: 'bold', borderBottom: '2px solid var(--border)' }}>
                                <span>Appointment ID</span>
                                <span>Patient ID</span>
                                <span>Doctor ID</span>
                                <span>Scheduled Date</span>
                                <span>Scheduled Time</span>
                                <span>Status</span>
                            </div>
                            {appointments.map((appt) => (
                                <div key={appt.id} className="appointment-row">
                                    <span>Record #{appt.id}</span>
                                    <span>Patient #{appt.patient_id}</span>
                                    <span>Doctor #{appt.doctor_id}</span>
                                    <span>{appt.appointment_date}</span>
                                    <span>{appt.appointment_time}</span>
                                    <span className={`status status-${appt.status}`}>{appt.status}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="muted">No system-wide scheduling transactions recorded.</p>
                    )}
                </article>
            </section>
        </main>
    )
}

export default AdminDashboard