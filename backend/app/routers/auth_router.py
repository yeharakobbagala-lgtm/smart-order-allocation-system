from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    UserResponse,
)
from app.services.auth_service import login_user, register_user
from app.utils.security import get_current_user, require_admin

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    try:
        return register_user(
            db=db,
            name=request.name,
            email=request.email,
            password=request.password,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    try:
        access_token, user = login_user(
            db=db,
            email=request.email,
            password=request.password,
        )

        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=user.id,
                name=user.name,
                email=user.email,
                role=user.role,
            ),
        )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.get("/admin-test")
def admin_test(current_user: dict = Depends(require_admin)):
    return {
        "message": "Admin access granted.",
        "user": current_user,
    }