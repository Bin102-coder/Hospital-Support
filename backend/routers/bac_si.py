from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import require_role
from ai import goi_y_tu_ai
from database import get_db
from models import HoSoKham, LichKham, User
from schemas import HoSoCapNhat, HoSoChiTiet, HoSoTaoMoi, HoSoTomTat, LichKhamOut, TrangThaiUpdate, UserOut, YeuCau, TU_KHOA_KHAN_CAP

router = APIRouter()


def _benh_nhan_ho_ten(db: Session, ho_so: HoSoKham) -> str | None:
    nd = ho_so.noi_dung_tom_tat or {}
    if nd.get("benh_nhan_ten"):
        return nd.get("benh_nhan_ten")
    if ho_so.benh_nhan_id is not None:
        u = db.query(User).filter(User.id == ho_so.benh_nhan_id).first()
        return u.ho_ten if u else None
    return None


@router.get("/api/bac-si/benh-nhan", response_model=list[UserOut])
def danh_sach_benh_nhan(
    user: User = Depends(require_role("bac_si")),
    db: Session = Depends(get_db),
):
    return db.query(User).filter(User.vai_tro == "benh_nhan").all()


@router.get("/api/bac-si/ho-so", response_model=list[HoSoTomTat])
def danh_sach_ho_so(
    trang_thai: str | None = None,
    user: User = Depends(require_role("bac_si")),
    db: Session = Depends(get_db),
):
    q = db.query(HoSoKham)
    if trang_thai in ("moi", "da_xem"):
        q = q.filter(HoSoKham.trang_thai == trang_thai)
    items = q.order_by(HoSoKham.tao_luc.desc()).all()
    ket_qua = []
    for h in items:
        nd = h.noi_dung_tom_tat or {}
        ket_qua.append(HoSoTomTat(
            id=h.id,
            benh_nhan_id=h.benh_nhan_id,
            benh_nhan_ho_ten=_benh_nhan_ho_ten(db, h),
            trang_thai=h.trang_thai,
            canh_bao_khan_cap=h.canh_bao_khan_cap,
            tao_luc=h.tao_luc,
            ly_do_kham=nd.get("ly_do_kham"),
            muc_do_danh_gia=nd.get("muc_do_danh_gia"),
        ))
    return ket_qua


@router.post("/api/bac-si/ho-so", response_model=HoSoChiTiet)
def tao_ho_so(
    data: HoSoTaoMoi,
    user: User = Depends(require_role("bac_si")),
    db: Session = Depends(get_db),
):
    van_ban = (data.loi_benh_nhan + " " + " ".join(data.trieu_chung)).lower()
    canh_bao = data.canh_bao_khan_cap or any(tk in van_ban for tk in TU_KHOA_KHAN_CAP)

    yeu_cau = YeuCau(
        ly_do_kham=data.benh_nhan_ten,
        trieu_chung=data.trieu_chung,
        loi_benh_nhan=data.loi_benh_nhan,
    )
    ket_qua_ai = goi_y_tu_ai(yeu_cau)
    if ket_qua_ai is not None:
        ban_tom_tat = ket_qua_ai.ban_tom_tat
        goi_y = [g.model_dump() for g in ket_qua_ai.goi_y_can_nhac]
        loi_khuyen = ket_qua_ai.loi_khuyen_benh_nhan
        muc_do_danh_gia = ket_qua_ai.muc_do_danh_gia
    else:
        ban_tom_tat = data.ban_tom_tat or f"Lý do khám: {data.benh_nhan_ten}. Triệu chứng: {', '.join(data.trieu_chung) if data.trieu_chung else 'không nêu rõ'}."
        goi_y = []
        loi_khuyen = "Nghỉ ngơi, uống đủ nước, theo dõi triệu chứng. Nếu triệu chứng kéo dài hoặc nặng hơn, hãy đến gặp bác sĩ."
        muc_do_danh_gia = "chưa đánh giá"

    nd = {
        "benh_nhan_ten": data.benh_nhan_ten,
        "ly_do_kham": data.benh_nhan_ten,
        "trieu_chung": data.trieu_chung,
        "ban_tom_tat": ban_tom_tat,
        "goi_y_can_nhac": goi_y,
        "loi_khuyen": loi_khuyen,
        "muc_do_danh_gia": muc_do_danh_gia,
    }

    ho_so = HoSoKham(
        benh_nhan_id=None,
        noi_dung_tom_tat=nd,
        loi_benh_nhan=data.loi_benh_nhan,
        canh_bao_khan_cap=canh_bao,
        trang_thai=data.trang_thai,
    )
    db.add(ho_so)
    db.commit()
    db.refresh(ho_so)
    return HoSoChiTiet(
        id=ho_so.id,
        benh_nhan_id=None,
        benh_nhan_ho_ten=data.benh_nhan_ten,
        trang_thai=ho_so.trang_thai,
        canh_bao_khan_cap=ho_so.canh_bao_khan_cap,
        tao_luc=ho_so.tao_luc,
        noi_dung_tom_tat=nd,
        loi_benh_nhan=ho_so.loi_benh_nhan,
        goi_y_can_nhac=goi_y,
    )


@router.get("/api/bac-si/ho-so/{ho_so_id}", response_model=HoSoChiTiet)
def chi_tiet_ho_so(
    ho_so_id: int,
    user: User = Depends(require_role("bac_si")),
    db: Session = Depends(get_db),
):
    h = db.query(HoSoKham).filter(HoSoKham.id == ho_so_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ")
    nd = h.noi_dung_tom_tat or {}
    return HoSoChiTiet(
        id=h.id,
        benh_nhan_id=h.benh_nhan_id,
        benh_nhan_ho_ten=_benh_nhan_ho_ten(db, h),
        trang_thai=h.trang_thai,
        canh_bao_khan_cap=h.canh_bao_khan_cap,
        tao_luc=h.tao_luc,
        noi_dung_tom_tat=nd,
        loi_benh_nhan=h.loi_benh_nhan,
        goi_y_can_nhac=nd.get("goi_y_can_nhac", []),
    )


@router.patch("/api/bac-si/ho-so/{ho_so_id}", response_model=HoSoChiTiet)
def cap_nhat_ho_so(
    ho_so_id: int,
    data: HoSoCapNhat,
    user: User = Depends(require_role("bac_si")),
    db: Session = Depends(get_db),
):
    h = db.query(HoSoKham).filter(HoSoKham.id == ho_so_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ")
    nd = h.noi_dung_tom_tat or {}
    if data.ban_tom_tat is not None:
        nd["ban_tom_tat"] = data.ban_tom_tat
    if data.trieu_chung is not None:
        nd["trieu_chung"] = data.trieu_chung
    if data.canh_bao_khan_cap is not None:
        h.canh_bao_khan_cap = data.canh_bao_khan_cap
    if data.trang_thai is not None:
        h.trang_thai = data.trang_thai
    h.noi_dung_tom_tat = nd
    db.commit()
    db.refresh(h)
    return HoSoChiTiet(
        id=h.id,
        benh_nhan_id=h.benh_nhan_id,
        benh_nhan_ho_ten=_benh_nhan_ho_ten(db, h),
        trang_thai=h.trang_thai,
        canh_bao_khan_cap=h.canh_bao_khan_cap,
        tao_luc=h.tao_luc,
        noi_dung_tom_tat=nd,
        loi_benh_nhan=h.loi_benh_nhan,
        goi_y_can_nhac=nd.get("goi_y_can_nhac", []),
    )


@router.delete("/api/bac-si/ho-so/{ho_so_id}")
def xoa_ho_so(
    ho_so_id: int,
    user: User = Depends(require_role("bac_si")),
    db: Session = Depends(get_db),
):
    h = db.query(HoSoKham).filter(HoSoKham.id == ho_so_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ")
    db.delete(h)
    db.commit()
    return {"ok": True}


@router.get("/api/bac-si/lich-kham", response_model=list[LichKhamOut])
def danh_sach_lich_kham(
    user: User = Depends(require_role("bac_si")),
    db: Session = Depends(get_db),
):
    items = db.query(LichKham).filter((LichKham.bac_si_id == user.id) | (LichKham.bac_si_id.is_(None))).order_by(LichKham.tao_luc.desc()).all()
    ket_qua = []
    for l in items:
        bn = db.query(User).filter(User.id == l.benh_nhan_id).first()
        bs = db.query(User).filter(User.id == l.bac_si_id).first() if l.bac_si_id else None
        ket_qua.append(LichKhamOut(
            id=l.id,
            benh_nhan_id=l.benh_nhan_id,
            bac_si_id=l.bac_si_id,
            benh_nhan_ho_ten=bn.ho_ten if bn else None,
            bac_si_ho_ten=bs.ho_ten if bs else None,
            thoi_gian=l.thoi_gian,
            ly_do=l.ly_do,
            trang_thai=l.trang_thai,
            tao_luc=l.tao_luc,
        ))
    return ket_qua


@router.patch("/api/bac-si/lich-kham/{lich_id}")
def cap_nhat_lich_kham(
    lich_id: int,
    trang_thai: str,
    user: User = Depends(require_role("bac_si")),
    db: Session = Depends(get_db),
):
    l = db.query(LichKham).filter(LichKham.id == lich_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch khám")
    if trang_thai in ("cho_xac_nhan", "da_xac_nhan", "huy"):
        l.trang_thai = trang_thai
        db.commit()
    return {"ok": True}