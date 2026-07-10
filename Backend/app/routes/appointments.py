# Executes the business logic

from fastapi import APIRouter, Body, Depends, HTTPException, Query
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


@router.put("/{appointment_id}/status", response_model=AppointmentResponse)
@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: int,
    db: Session = Depends(get_db),
    status: str | None = Query(default=None),
    body: dict | None = Body(default=None),
):
    new_status = status or (body or {}).get("status")

    if not new_status:
        raise HTTPException(status_code=400, detail="Status is required")

    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()

    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.status = new_status
    db.commit()
    db.refresh(appointment)
    return appointment