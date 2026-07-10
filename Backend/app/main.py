# The Entry Point / Router

from fastapi import FastAPI
from app.database.connection import engine, Base
from app.routes.appointments import router as appointment_router

# Auto-creates your tables in PostgreSQL on start
Base.metadata.create_all(bind=engine)  # Look at all our code models, connect to PostgreSQL, and automatically build the actual database tables if they aren't already there

app = FastAPI(title="Hospital Management System API")

app.include_router(appointment_router)

@app.get("/")    #decorator (after decorator, the function is called always)
    return {"message": "Welcome to the Hospital Management System API"}