from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.appointments import Appointment
from app.schemas.appointments import AppointmentCreate, AppointmentResponse

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("/", response_model=AppointmentResponse)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    db_appointment = Appointment(**appointment.model_dump())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.get("/", response_model=list[AppointmentResponse])
def get_appointments(db: Session = Depends(get_db)):
    return db.query(Appointment).all()