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

  const currentUserId = useMemo(() => {
    if (!auth?.token) {
      return null
    }

    const payload = decodeJwtPayload(auth.token)
    return payload?.sub ? Number(payload.sub) : null
  }, [auth?.token])

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
      try {
        const doctorList = await fetchDoctors()
        setDoctors(doctorList)

        const currentDoctor = doctorList.find((doctor) => doctor.user_id === currentUserId)
        const initialDoctorId = currentDoctor?.id || doctorList[0]?.id || ''

        if (initialDoctorId) {
          setSelectedDoctorId(String(initialDoctorId))
          await loadAppointments(initialDoctorId)
        }
      } catch (requestError) {
        setError(
          requestError?.response?.data?.detail || 'Unable to load your doctor dashboard.',
        )
      }
    }

    loadDoctorContext()
  }, [currentUserId])

  async function handleStatusChange(appointmentId, status) {
    setError('')
    setSuccess('')

    try {
      await updateAppointmentStatus(appointmentId, status)
      setSuccess('Appointment updated.')
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
          <p className="eyebrow">Doctor and admin view</p>
          <h1>Manage appointments</h1>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => loadAppointments(selectedDoctorId)}
        >
          Refresh
        </button>
      </section>

      <section className="dashboard-grid">
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

        <article className="panel full-width">
          <h2>Appointments</h2>
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
            <p className="muted">No appointments found for the selected doctor.</p>
          )}

          {success ? <p className="form-success">{success}</p> : null}
        </article>
      </section>
    </main>
  )
}

export default DoctorDashboard