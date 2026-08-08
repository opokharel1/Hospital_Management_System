import { useEffect, useMemo, useState } from 'react'
import {
  decodeJwtPayload,
  fetchDoctors,
  fetchDoctorAppointments,
  updateAppointmentStatus,
} from '../api'

function DoctorDashboard({ auth }) {
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 1. Decode token to get the logged-in User's ID and Role
  const { currentUserId, userRole } = useMemo(() => {
    if (!auth?.token) {
      return { currentUserId: null, userRole: 'patient' }
    }
    const payload = decodeJwtPayload(auth.token)
    return {
      currentUserId: payload?.sub ? Number(payload.sub) : null,
      userRole: payload?.role || 'patient' // Assuming your JWT payload contains the role!
    }
  }, [auth?.token])

  // Determines if the user is a medical staff member or a system administrator
  const isAdmin = userRole === 'admin'

  async function loadAppointments(doctorId) {
    if (!doctorId) {
      setAppointments([])
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await fetchDoctorAppointments(doctorId)
      setAppointments(data)
    } catch (requestError) {
      setError(
        requestError?.response?.data?.detail || 'Unable to load doctor appointments.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function loadDoctorContext() {
      setLoading(true)
      try {
        const doctorList = await fetchDoctors()
        setDoctors(doctorList)

        // Find the doctor profile that matches the logged-in User ID
        const currentDoctor = doctorList.find((doctor) => doctor.user_id === currentUserId)
        
        // CRITICAL FIX: If they are a doctor, force their ID. If admin, fallback to the first doctor in list.
        const initialDoctorId = currentDoctor?.id || (isAdmin ? doctorList[0]?.id : null)

        if (initialDoctorId) {
          setSelectedDoctorId(String(initialDoctorId))
          await loadAppointments(initialDoctorId)
        } else if (!isAdmin) {
          // If a doctor logs in but has no profile created in the doctor table yet
          setError("Your user account is marked as a doctor, but no clinical profile has been set up by the admin yet.")
        }
      } catch (requestError) {
        setError(
          requestError?.response?.data?.detail || 'Unable to load your doctor dashboard.',
        )
      } finally {
        setLoading(false)
      }
    }

    if (currentUserId) {
      loadDoctorContext()
    }
  }, [currentUserId, isAdmin])

  async function handleStatusChange(appointmentId, status) {
    setError('')
    setSuccess('')

    try {
      await updateAppointmentStatus(appointmentId, status)
      setSuccess(`Appointment status successfully updated to ${status}.`)
      await loadAppointments(selectedDoctorId)
    } catch (requestError) {
      setError(
        requestError?.response?.data?.detail || 'Could not update the appointment status.',
      )
    }
  }

  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">{isAdmin ? "Admin view" : "Doctor view"}</p>
          <h1>{isAdmin ? "Hospital Schedules" : "My Appointments"}</h1>
        </div>
        <button
          type="button"
          className="secondary-button"
          disabled={!selectedDoctorId}
          onClick={() => loadAppointments(selectedDoctorId)}
        >
          Refresh
        </button>
      </section>

      <section className="dashboard-grid">
        {/* 2. HIDE SELECTOR FOR DOCTORS: Only show the selector panel if an Admin is logged in */}
        {isAdmin && (
          <article className="panel full-width">
            <h2>Select doctor</h2>
            <div className="inline-form">
              <select
                value={selectedDoctorId}
                onChange={(event) => {
                  const nextDoctorId = event.target.value
                  setSelectedDoctorId(nextDoctorId)
                  loadAppointments(nextDoctorId)
                }}
              >
                <option value="">Choose a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>
          </article>
        )}

        <article className="panel full-width">
          <h2>Appointments Schedule</h2>
          {loading ? (
            <p className="muted">Loading appointments...</p>
          ) : error ? (
            <p className="form-error">{error}</p>
          ) : appointments.length ? (
            <div className="appointment-table">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-row appointment-actions">
                  <span>Patient #{appointment.patient_id}</span>
                  <span>{appointment.appointment_date}</span>
                  <span>{appointment.appointment_time}</span>
                  <span className={`status status-${appointment.status}`}>{appointment.status}</span>
                  <div className="status-controls">
                    {['pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        className="status-button"
                        onClick={() => handleStatusChange(appointment.id, status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No appointments scheduled.</p>
          )}

          {success ? <p className="form-success">{success}</p> : null}
        </article>
      </section>
    </main>
  )
}

export default DoctorDashboard