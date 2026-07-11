## Make Virtual Environment
python -m venv .venv

### Activate Virtual Environment 
.venv\Scripts\activate

## Install Packages
pip install fastapi uvicorn sqlalchemy psycopg2[binary] alembic python-dotenv pydantic-settings

<i>fastapi & uvicorn: To run web server.</i>

<i> sqlalchemy: To let Python talk directly to database.</i>

## Folder structure

Hospital_Management_System/
├── .venv/                          # Installed in root (Perfect)
├── Documentation.md
└── Backend/                        # existing backend folder
    ├── .env                        # Create here
    ├── .gitignore                  # Create here
    └── app/                        # Create this new folder
        ├── __init__.py
        ├── main.py
        ├── config/
        │   └── config.py
        ├── database/
        │   └── connection.py
        ├── models/
        │   └── appointments.py
        ├── routes/
        │   └── appointments.py
        └── schemas/
            └── appointments.py

## Write in env file

## Boot platform server
pip install psycopg2-binary

# Until Now:

[ Web Browser ] 
       │
       ▼ (Sends a "GET /" Request)
[ FastAPI Server (Uvicorn) ] ──(Reads credentials via pydantic-settings)──> [ .env File ]
       │
       ▼ (Uses SQLAlchemy to check tables)
[ PostgreSQL Database (hospital_db) ]

### Just implemented three fundamental pillars of professional backend architecture:

<i>1.</i> Environment Isolation (.env)

<i>2.</i> <b> Object-Relational Mapping (ORM via SQLAlchemy)</b>: You didn't have to open pgAdmin and write raw SQL commands like CREATE TABLE appointments (...). You wrote pure Python code in models.py, and SQLAlchemy translated it into PostgreSQL dialect seamlessly.

<i>3.</i> <b> Data Validation (Pydantic Schemas)</b>: Before data is allowed to enter your database, your code inside schemas.py checks it. If a user tries to send a missing field or corrupt data, your system will automatically reject it before it can break your database.

## Run Backend
uvicorn app.main:app --reload  <i>(remeber, you need to be inside virtual environment and inside backend folder)</i>

### Open in Browser:

http://127.0.0.1:8000/docs

This is FastAPI's automatic interactive documentation page (Swagger UI).

Click on the POST /appointments/ endpoint.

Click "Try it out".

Change the test names in the JSON box, and click the big blue "Execute" button.

Once you hit execute, look at your terminal log. You will see a "POST /appointments/ HTTP/1.1" 200 OK appear, proving that you just saved a real appointment into PostgreSQL. Try it out and let me know what happens!

## The Relational Architecture Blueprint

  ┌───────────────┐               ┌─────────────────┐
  │     users     │               │     doctors     │
  ├───────────────┤               ├─────────────────┤
  │ id (PK)       │◄──────┐       │ id (PK)         │◄──────┐
  │ email         │       │       │ user_id (FK)────┘       │
  │ role          │       │       │ specialization  │       │
  └───────────────┘       │       └─────────────────┘       │
                          │                                 │
                 (Links to Patient User)          (Links to Assigned Doctor)
                          │                                 │
                  ┌───────┴─────────┐                       │
                  │  appointments   │                       │
                  ├─────────────────┤                       │
                  │ id (PK)         │                       │
                  │ patient_id (FK) │                       │
                  │ doctor_id (FK) ─────────────────────────┘
                  │ status          │
                  └─────────────────┘

