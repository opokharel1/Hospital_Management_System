# Translates Python to Database Tables
# A doctor is also a user in the system. We link user_id to the users table.

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    
    # NEW LINK: Connects this doctor profile directly to a User account row
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String, nullable=False)
    specialization = Column(String, nullable=False)
    phone_number = Column(String, unique=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    appointments = relationship("Appointment", back_populates="doctor")