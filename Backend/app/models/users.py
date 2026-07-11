# Translates Python to Database Tables
# We leave this clean, but we can optionally add a back-reference shortcut so a user object can easily pull their linked doctor profile if they have one.

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="patient")  # "admin", "doctor", "patient"

    # Back-reference: If this user is a doctor, easily find their professional details
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)

    