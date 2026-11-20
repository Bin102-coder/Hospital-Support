from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import bam_mat_khau, kiem_tra_mat_khau, tao_token
from database import get_db
from models import User
from schemas import DangKy, DangNhap, Token, UserOut

router = APIRouter()


@router.post("/api/dang-ky", response_model=UserOut)
def dang_ky(data: DangKy, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email đã được đăng ký")
    user = User(
        email=data.email,
        mat_khau_da_bam=bam_mat_khau(data.mat_khau),
        ho_ten=data.ho_ten,
        vai_tro="benh_nhan",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/api/dang-nhap", response_model=Token)
def dang_nhap(data: DangNhap, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not kiem_tra_mat_khau(data.mat_khau, user.mat_khau_da_bam):
        raise HTTPException(status_code=401, detail="Sai email hoặc mật khẩu")
    token = tao_token({"sub": str(user.id), "vai_tro": user.vai_tro})
    return {"access_token": token, "token_type": "bearer"}