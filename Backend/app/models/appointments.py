# Translates Python to Database Tables
# This is the biggest change. We delete the raw text strings for names and replace them with structural mathematical IDs pointing to our user types.

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    
    # NEW LINKS: Foreign keys pointing to the primary ids of users and doctors tables
    patient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    
    appointment_date = Column(String, nullable=False)
    appointment_time = Column(String, nullable=False)
    status = Column(String, default="pending")

    # Relationships (Allows Python to fetch linked objects seamlessly via code)
    patient = relationship("User")
    doctor = relationship("Doctor", back_populates="appointments")

    