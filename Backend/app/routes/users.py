from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.users import User
from app.schemas.appointments import UserCreate, UserResponse
from app.utils.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Prevent duplicate email accounts
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Prevent duplicate usernames
    existing_username = db.query(User).filter(User.username == user.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # 3. Securely hash the password before saving
    secure_password = hash_password(user.password)
    
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=secure_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Look for the user in the database (OAuth2 uses 'username' field for login input)
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid username or password"
        )
    
    # 2. Check if the mathematical hash matches the password typed
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid username or password"
        )
    
    # 3. Create the JWT Token containing their identifying info
    token_payload = {"sub": str(user.id), "role": user.role}
    access_token = create_access_token(data=token_payload)
    
    # 4. Return standard OAuth2 token parameters
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role
    }