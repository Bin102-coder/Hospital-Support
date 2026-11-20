import os
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import get_db
from models import User

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()


def bam_mat_khau(mat_khau: str) -> str:
    return pwd_context.hash(mat_khau)


def kiem_tra_mat_khau(mat_khau: str, da_bam: str) -> bool:
    return pwd_context.verify(mat_khau, da_bam)


def tao_token(du_lieu: dict, het_han: timedelta | None = None) -> str:
    to_encode = du_lieu.copy()
    expire = datetime.utcnow() + (het_han or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    loi = HTTPException(status_code=401, detail="Token không hợp lệ hoặc đã hết hạn")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise loi
    except JWTError:
        raise loi
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise loi
    return user


def require_role(*vai_tro):
    def checker(user: User = Depends(get_current_user)) -> User:
        if user.vai_tro not in vai_tro:
            raise HTTPException(status_code=403, detail="Không có quyền truy cập")
        return user
    return checker
