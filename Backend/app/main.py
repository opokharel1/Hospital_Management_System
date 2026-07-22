# The Entry Point / Router

from fastapi import FastAPI
from app.database.connection import engine, Base

from app.models.users import User
from app.models.doctors import Doctor
from app.models.appointments import Appointment

from app.routes.appointments import router as appointment_router
from app.routes.users import router as user_router
from app.routes.doctors import router as doctor_router

# Auto-creates your tables in PostgreSQL on start
Base.metadata.create_all(bind=engine)  # Look at all our code models, connect to PostgreSQL, and automatically build the actual database tables if they aren't already there

app = FastAPI(title="Hospital Management System API", version="0.1.0")

app.include_router(user_router)
app.include_router(doctor_router)
app.include_router(appointment_router)

@app.get("/")    #decorator (after decorator, the function is called always)
def root():
    return {"message": "Welcome to the Hospital Management System API"}