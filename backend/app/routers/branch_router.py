from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.branch import BranchCreate, BranchResponse
from app.services.branch_service import create_new_branch, get_branches
from app.utils.security import require_admin

router = APIRouter(prefix="/branches", tags=["Branches"])


@router.post(
    "/",
    response_model=BranchResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_branch(
    request: BranchCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    try:
        return create_new_branch(
            db=db,
            name=request.name,
            address=request.address,
            latitude=request.latitude,
            longitude=request.longitude,
            capacity=request.capacity,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.get(
    "/",
    response_model=list[BranchResponse],
)
def read_branches(
    db: Session = Depends(get_db),
):
    return get_branches(db)