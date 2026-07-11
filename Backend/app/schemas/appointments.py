# Pydantic checks & validates data

from pydantic import BaseModel, EmailStr

# --- USER SCHEMAS ---
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "patient" # default to patient, can be "doctor" or "admin"

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str

    class Config:
        from_attributes = True

# --- DOCTOR SCHEMAS ---
class DoctorCreate(BaseModel):
    user_id: int
    name: str
    specialization: str
    phone_number: str

class DoctorResponse(BaseModel):
    id: int
    user_id: int
    name: str
    specialization: str
    phone_number: str

    class Config:
        from_attributes = True

# --- APPOINTMENT SCHEMAS ---
class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: str
    appointment_time: str

class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    appointment_date: str
    appointment_time: str
    status: str

    class Config:
        from_attributes = True