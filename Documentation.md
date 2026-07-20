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
<br> <i> or, </i>
python -m uvicorn app.main:app --reload

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

## Rewrite Data Schemas
## enable automatic email syntax verification
pip install pydantic[email]

## Generate requirements.txt


## Create Separate API Route Blueprints
1. <b>Create a Users Router (app/routes/users.py)</b>
2. <b>Create a Doctors Route File (app/routes/doctors.py)</b>
3. <b>Update the Appointments Router (app/routes/appointments.py)</b>
4. <b>Plug Everything Back into main.py</b>

### Made fully operational database and three working API sections (Users, Doctors, and Appointments)

# JWT Token Authentication

## Install Security Tools inside (.venv)

pip install "passlib[bcrypt]" python-jose[cryptography] python-multipart

 * <b> passlib[bcrypt] </b>: Scrambles passwords into unreadable hashes before saving them to PostgreSQL. <i> (if passlib library is not compatible to bcrypt library:: pip install "bcrypt==4.0.1")</i>

 * <b> python-jose </b> : Creates and unpacks secure JWT data passports.

 * <b> python-multipart </b> : Allows FastAPI to accept standard username/password inputs via form screens.

## Update (.env)

## Create a Security Utility Helper (app/utils/security.py)

## Update Config Loader (app/config/config.py)
make JWT secret and access token expire minutes :: str

## Update Registration & Add Login to app/routes/users.py
--> now, check registering and login users. The JWT tokens are working. (got bearer token)

## Add Current User Extraction (app/utils/security.py)
--> add OAuth2PasswordBearer and a helper function get_current_user. This reads the token from incoming requests and fetches the user from the database.

## Update Appointments Route (app/routes/appointments.py)
--> requiring an authenticated user via current_user: User = Depends(get_current_user)

## Add Strict Date & Time Validation (in app/schemas/appointments.py)

### Authentication and Dynamic User Allocation (Completed)

