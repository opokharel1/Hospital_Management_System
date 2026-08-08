import { useEffect, useState } from 'react'
import { createAppointment, fetchDoctors, fetchMyAppointments } from '../api'

function PatientDashboard() {
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [form, setForm] = useState({
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadDashboard() {
    setLoading(true);
    setError('');

    // 1. STEP ONE: Fetch the public doctors list (Isolated)
    try {
      console.log("Fetching doctors from public directory...");
      const doctorList = await fetchDoctors();
      console.log("Doctors successfully loaded:", doctorList);

      // Save the list into your state memory
      setDoctors(doctorList || []);
    } catch (docError) {
      console.error("Failed to load public doctor directory:", docError);
      // We don't block the screen here because it's just one section
    }

    // 2. STEP TWO: Fetch private appointments (Isolated)
    try {
      console.log("Fetching private user appointments...");
      const myAppointments = await fetchMyAppointments();
      setAppointments(myAppointments || []);
    } catch (appError) {
      // If this gets a 404, it will log here but won't wipe out your doctors list!
      console.error("Appointments endpoint temporary failure:", appError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      await createAppointment({
        doctor_id: Number(form.doctor_id),
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time,
      })

      setSuccess('Appointment booked successfully.')
      setForm({ doctor_id: '', appointment_date: '', appointment_time: '' })
      await loadDashboard()
    } catch (requestError) {
      setError(
        requestError?.response?.data?.detail || 'Could not book this appointment.',
      )
    }
  }

  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Patient view</p>
          <h1>Book and track appointments</h1>
        </div>

      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <h2>Book an appointment</h2>
          <form onSubmit={handleSubmit} className="stacked-form">
            <label>
              Doctor
              <select
                value={form.doctor_id}
                onChange={(event) => setForm({ ...form, doctor_id: event.target.value })}
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Date
              <input
                value={form.appointment_date}
                onChange={(event) =>
                  setForm({ ...form, appointment_date: event.target.value })
                }
                type="date"
                required
              />
            </label>

            <label>
              Time
              <input
                value={form.appointment_time}
                onChange={(event) =>
                  setForm({ ...form, appointment_time: event.target.value })
                }
                type="time"
                required
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}
            {success ? <p className="form-success">{success}</p> : null}

            <button type="submit">Book appointment</button>
          </form>
        </article>

        <article className="panel">
          <h2>Available doctors</h2>
          {loading ? (
            <p className="muted">Loading doctors...</p>
          ) : doctors.length ? (
            <div className="list-stack">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="list-card">
                  <strong>{doctor.name}</strong>
                  <span>{doctor.specialization}</span>
                  <small>{doctor.phone_number}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No doctors are registered yet.</p>
          )}
        </article>

        <article className="panel full-width">
          <h2>My appointments</h2>
          {appointments.length ? (
            <div className="table-grid">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-row">
                  <span>Doctor #{appointment.doctor_id}</span>
                  <span>{appointment.appointment_date}</span>
                  <span>{appointment.appointment_time}</span>
                  <span className={`status status-${appointment.status}`}>{appointment.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No appointments booked yet.</p>
          )}
        </article>
      </section>
    </main>
  )
}

export default PatientDashboard