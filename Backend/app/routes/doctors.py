from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.doctors import Doctor
from app.schemas.appointments import DoctorCreate, DoctorResponse

from app.models.users import User
from app.utils.security import require_role, get_current_user

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.post("/", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
def create_doctor_profile(
    doctor: DoctorCreate, 
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))  # ONLY ADMINS ALLOWED!
    ):

    # 1. Verify that the user_id actually exists in the users table (checking if that person is already a general user)
    target_user = db.query(User).filter(User.id == doctor.user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {doctor.user_id} does not exist."
        )

    # 2. Check if a doctor profile already exists for this user_id (checking if this user_id is already assigned to the another doctor)
    if db.query(Doctor).filter(Doctor.user_id == doctor.user_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="A doctor profile already exists for this user ID."
        )

    # 3. Check if this phone number is already registered to a doctor profile
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