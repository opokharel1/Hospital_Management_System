from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.appointments import Appointment
from app.schemas.appointments import AppointmentCreate, AppointmentResponse, AppointmentStatusUpdate

from app.models.users import User
from app.utils.security import get_current_user, require_role

from app.models.doctors import Doctor

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("/", response_model=AppointmentResponse)
# def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    # Temporarily hardcoding a patient_id to 1 until we set up login cookies/tokens next!
def create_appointment(appointment: AppointmentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)    # Requires login!
    ):

    # 1. Verify doctor exists before saving
    doctor = db.query(Doctor).filter(Doctor.id == appointment.doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor with ID {appointment.doctor_id} does not exist."
        )

    # 2. Create appointment record    
    db_appointment = Appointment(
        patient_id=current_user.id,       # Dynamically uses logged-in user's ID
        doctor_id=appointment.doctor_id,
        appointment_date=appointment.appointment_date,
        appointment_time=appointment.appointment_time,
        status="pending"
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.get("/", response_model=list[AppointmentResponse])
def get_all_appointments(db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Protected list view
):
    return db.query(Appointment).all()

# 1. Patient Dashboard: Get ONLY the logged-in patient's appointments
@router.get("/me", response_model=list[AppointmentResponse])
def get_my_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 🔒 Must be logged in
):
    """
    Returns only the appointments that belong to the logged-in patient.
    """
    return db.query(Appointment).filter(Appointment.patient_id == current_user.id).all()


# 2. Doctor Dashboard: Get appointments assigned to a specific doctor
@router.get("/doctor/{doctor_id}", response_model=list[AppointmentResponse])
def get_doctor_appointments(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["doctor", "admin"]))  # 🔒 Doctors & Admins only
):
    """
    Returns all appointments assigned to a specific doctor ID.
    """
    return db.query(Appointment).filter(Appointment.doctor_id == doctor_id).all()

@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: int,
    status_update: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["doctor", "admin"]))  # 🔒 Doctors & Admins only!
):
    # 1. Fetch appointment from database
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment with ID {appointment_id} not found."
        )

    # 2. Update status & save
    appointment.status = status_update.status
    db.commit()
    db.refresh(appointment)
    return appointment