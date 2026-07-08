from pydantic import BaseModel

class AppointmentCreate(BaseModel):
    patient_name: str
    doctor_name: str
    appointment_date: str
    appointment_time: str

class AppointmentResponse(AppointmentCreate):
    id: int
    status: str

    class Config:
        from_attributes = True