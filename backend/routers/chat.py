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
    result = chat_tro_ly(data.message, data.history)
    if result.action == "schedule" and result.schedule_thoi_gian:
        lich = LichKham(
            benh_nhan_id=user.id,
            thoi_gian=result.schedule_thoi_gian,
            ly_do=result.schedule_ly_do,
            trang_thai="cho_xac_nhan",
        )
        db.add(lich)
        db.commit()
        db.refresh(lich)
        result.appointment_id = lich.id
        if not result.reply:
            result.reply = "Đã đặt lịch khám cho bạn."
    return result