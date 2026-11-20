from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import get_current_user, require_role
from ai import goi_y_tu_ai
from database import get_db
from models import HoSoKham, User
from schemas import KetQuaGui, TU_KHOA_KHAN_CAP, YeuCau

router = APIRouter()


@router.get("/api/hello")
def hello():
    return {"message": "Xin chào từ backend!"}


@router.post("/api/tom-tat", response_model=KetQuaGui)
def tom_tat(
    data: YeuCau,
    user: User = Depends(require_role("benh_nhan")),
    db: Session = Depends(get_db),
):
    van_ban = (data.loi_benh_nhan + " " + " ".join(data.trieu_chung)).lower()
    canh_bao = any(tk in van_ban for tk in TU_KHOA_KHAN_CAP)

    ket_qua_ai = goi_y_tu_ai(data)
    if ket_qua_ai is not None:
        ban_tom_tat = ket_qua_ai.ban_tom_tat
        goi_y = [g.model_dump() for g in ket_qua_ai.goi_y_can_nhac]
        loi_khuyen = ket_qua_ai.loi_khuyen_benh_nhan
    else:
        ban_tom_tat = (
            f"Lý do khám: {data.ly_do_kham}. "
            f"Triệu chứng: {', '.join(data.trieu_chung) if data.trieu_chung else 'không nêu rõ'}."
        )
        goi_y = []
        loi_khuyen = "Nghỉ ngơi, uống đủ nước, theo dõi triệu chứng. Nếu triệu chứng kéo dài hoặc nặng hơn, hãy đến gặp bác sĩ."

    noi_dung = {
        "ly_do_kham": data.ly_do_kham,
        "trieu_chung": data.trieu_chung,
        "thoi_gian": data.thoi_gian,
        "muc_do": data.muc_do,
        "tien_su": data.tien_su,
        "thuoc_dang_dung": data.thuoc_dang_dung,
        "di_ung": data.di_ung,
        "ban_tom_tat": ban_tom_tat,
        "goi_y_can_nhac": goi_y,
        "loi_khuyen": loi_khuyen,
    }

    ho_so = HoSoKham(
        benh_nhan_id=user.id,
        noi_dung_tom_tat=noi_dung,
        loi_benh_nhan=data.loi_benh_nhan,
        canh_bao_khan_cap=canh_bao,
        trang_thai="moi",
    )
    db.add(ho_so)
    db.commit()

    return KetQuaGui(
        canh_bao_khan_cap=canh_bao,
        thong_bao="Đã gửi thông tin cho bác sĩ. Bác sĩ sẽ xem và liên hệ bạn.",
        loi_khuyen=loi_khuyen,
    )