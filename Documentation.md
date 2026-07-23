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

### Next steps:
<b>Role-Based Access Control (RBAC):</b> Restrict /doctors/ creation endpoints so only users with role == "admin" or role == "doctor" can add doctor profiles.

<b>GET /appointments/me:</b> A patient route that returns only the logged-in patient's appointments (instead of showing every appointment in the system).

<b>GET /appointments/doctor/{doctor_id}:</b> A route for doctors to see their daily upcoming patient appointments.

<b>PATCH /appointments/{id}/status:</b> Allow doctors or admins to update appointment status from "pending" to "confirmed" or "cancelled". 
Also, admin will create the slots for appointments for doctor, and patients can just choose those slots for feasibility. notifiy the doctor or admin, either can confirm the appointment?

### Role-Based Access Control (RBAC):
# Protected Doctor Management Endpoints:

POST /doctors/ ➔ Admin Only (Creates a doctor profile).

GET /doctors/ ➔ Public / All Authenticated Users (Lists active doctors so patients can pick one).

## Add Role Dependency (app/utils/security.py)

## Implement Doctor Routes (app/routes/doctors.py)

## Register Doctor Router in app/main.py

### Prevent 500 Crashes (Validate Foreign Keys First), Update app/routes/doctors.py

If you try to create a doctor profile for user_id = 40, but you only have 5 users registered, PostgreSQL crashes with a 500 Internal Server Error (Foreign Key violation). Checking <i> User.id == doctor.user_id </i> catches this and turns it into a friendly 404 Not Found.

## 1: Status Update Route 
Add an endpoint (PATCH /appointments/{id}/status) so admins or doctors can change an appointment's status (e.g., from pending to confirmed or cancelled).

--> Add Request Schema (app/schemas/appointments.py)
--> Implement PATCH Endpoint (app/routes/appointments.py)

## 2: Implement Personalized Dashboard Endpoints
Add filtered endpoints so users only see their own data:

GET /appointments/me — Returns only the logged-in patient's appointments.

GET /appointments/doctor/{doctor_id} — Returns only appointments assigned to a specific doctor.

# --> add new routes on (app/routes/appointments.py)

### Work for Later (in Backend):

<b> A: Add Doctor Role Guard in Profile Creation </b> — Add a quick check in POST /doctors/ to verify that target_user.role == "doctor" before creating a profile.

<b> B: Add Pagination / Sorting </b>— Allow users to sort appointments by date or limit the number of results per page.

<b> C: Write Tests </b>— Set up unit tests using pytest and httpx to automatically test your FastAPI endpoints.


### Frotend Integration

## Enable CORS in FastAPI; add CORSMiddleware in main.py

## Create React app using Vite
--> Oxlint 
--> <i> 
cd hospital-frontend
npm install
npm install axios react-router-dom </i>

--> run the dev server: <i>npm run dev</i>

## Folder structure:

src/
├── api.js              # Axios configuration & interceptors
├── App.jsx             # Main router & state wrapper
├── components/
│   ├── Navbar.jsx      # Navigation bar with role-based links
│   └── ProtectedRoute.jsx # Restricts pages based on login status
└── pages/
    ├── Login.jsx       # Login page
    ├── Register.jsx    # Registration page
    ├── PatientDashboard.jsx # Patient view (Book & View Appointments)
    └── DoctorDashboard.jsx  # Doctor/Admin view (Manage Appointments)

## Configure src/api.js
--> all API calls automatically attach to authentication token

## Enable CORS in FastAPI (main.py)
--> add CORSMiddleware in FastAPI main.py file so the backend permits requests coming from http://localhost:5173 (at allow_origins)

## in hospital-frontend terminal, run:
npm install @tailwindcss/vite

--> Use Tailwind plugin in project root; vite.config.js
--> Update src/index.css; import tailwindcss

## code for Login.jsx, Register.jsx, App.jsx

### <i> Note: </i> Backend should run inside .venv, to control the versions of python, but, react-frontend can run outside of .venv, because node_modules handles isolation











