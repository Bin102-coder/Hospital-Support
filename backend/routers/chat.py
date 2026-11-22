from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ai import chat_tro_ly
from auth import get_current_user, require_role
from database import get_db
from models import LichKham, User
from schemas import ChatRequest, ChatResponse

router = APIRouter()


@router.post("/api/chat", response_model=ChatResponse)
def chat(
    data: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doctors = db.query(User).filter(User.vai_tro == "bac_si").all()
    doctor_list = ", ".join([f"{d.ho_ten} (id {d.id})" for d in doctors])
    context_message = data.message + f"\n[Danh sach bac si: {doctor_list}]"

    result = chat_tro_ly(context_message, data.history)
    if result.action == "schedule" and result.schedule_thoi_gian:
        bs = None
        if result.schedule_bac_si_id:
            bs = db.query(User).filter(User.id == result.schedule_bac_si_id, User.vai_tro == "bac_si").first()
        if bs is None and result.schedule_bac_si_ten:
            ten = result.schedule_bac_si_ten.lower()
            for d in doctors:
                if ten in d.ho_ten.lower():
                    bs = d
                    break
        if bs is None:
            result.reply = "Ban vui long chon bac si de dat lich. Danh sach: " + doctor_list
            result.action = "none"
            result.appointment_id = None
            return result

        lich = LichKham(
            benh_nhan_id=user.id,
            bac_si_id=bs.id,
            thoi_gian=result.schedule_thoi_gian,
            ly_do=result.schedule_ly_do,
            trang_thai="cho_xac_nhan",
        )
        db.add(lich)
        db.commit()
        db.refresh(lich)
        result.appointment_id = lich.id
        if not result.reply:
            result.reply = "Da dat lich kham cho ban."
    return result