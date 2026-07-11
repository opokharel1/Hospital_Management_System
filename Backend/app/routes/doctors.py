from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.doctors import Doctor
from app.schemas.appointments import DoctorCreate, DoctorResponse

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.post("/", response_model=DoctorResponse)
def create_doctor_profile(doctor: DoctorCreate, db: Session = Depends(get_db)):
    # Check if this phone number is already registered to a doctor profile
    existing_phone = db.query(Doctor).filter(Doctor.phone_number == doctor.phone_number).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already in use by a doctor")
        
    db_doctor = Doctor(
        user_id=doctor.user_id,
        name=doctor.name,
        specialization=doctor.specialization,
        phone_number=doctor.phone_number
    )
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

@router.get("/", response_model=list[DoctorResponse])
def get_all_doctors(db: Session = Depends(get_db)):
    return db.query(Doctor).all()