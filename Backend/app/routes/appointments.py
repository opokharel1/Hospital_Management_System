from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.appointments import Appointment
from app.schemas.appointments import AppointmentCreate, AppointmentResponse

from app.models.users import User
from app.utils.security import get_current_user

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("/", response_model=AppointmentResponse)
# def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    # Temporarily hardcoding a patient_id to 1 until we set up login cookies/tokens next!
def create_appointment(appointment: AppointmentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)    # Requires login!
    ):
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