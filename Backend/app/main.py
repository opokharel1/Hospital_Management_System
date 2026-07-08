from fastapi import FastAPI
from app.database.connection import engine, Base
from app.routes.appointments import router as appointment_router

# Auto-creates your tables in PostgreSQL on start
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hospital Management System API")

app.include_router(appointment_router)

@app.get("/")
def root():
    return {"message": "Welcome to the Hospital Management System API"}