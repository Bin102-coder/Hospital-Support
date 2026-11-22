from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import get_current_user, require_role
from database import get_db
from models import LichKham, User
from schemas import DatLichRequest, LichKhamOut

router = APIRouter()


@router.post("/api/dat-lich", response_model=LichKhamOut)
def dat_lich(
    data: DatLichRequest,
    user: User = Depends(require_role("benh_nhan")),
    db: Session = Depends(get_db),
):
    lich = LichKham(
        benh_nhan_id=user.id,
        thoi_gian=data.thoi_gian,
        ly_do=data.ly_do,
        trang_thai="cho_xac_nhan",
    )
    db.add(lich)
    db.commit()
    db.refresh(lich)
    return LichKhamOut(
        id=lich.id,
        benh_nhan_id=lich.benh_nhan_id,
        benh_nhan_ho_ten=user.ho_ten,
        thoi_gian=lich.thoi_gian,
        ly_do=lich.ly_do,
        trang_thai=lich.trang_thai,
        tao_luc=lich.tao_luc,
    )


@router.get("/api/benh-nhan/lich-kham", response_model=list[LichKhamOut])
def lich_cua_toi(
    user: User = Depends(require_role("benh_nhan")),
    db: Session = Depends(get_db),
):
    items = db.query(LichKham).filter(LichKham.benh_nhan_id == user.id).order_by(LichKham.tao_luc.desc()).all()
    ket_qua = []
    for l in items:
        ket_qua.append(LichKhamOut(
            id=l.id,
            benh_nhan_id=l.benh_nhan_id,
            benh_nhan_ho_ten=user.ho_ten,
            thoi_gian=l.thoi_gian,
            ly_do=l.ly_do,
            trang_thai=l.trang_thai,
            tao_luc=l.tao_luc,
        ))
    return ket_qua