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

