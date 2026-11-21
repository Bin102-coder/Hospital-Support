from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


class YeuCau(BaseModel):
    ly_do_kham: str
    trieu_chung: list[str] = []
    thoi_gian: Optional[str] = None
    muc_do: Optional[str] = None
    tien_su: Optional[str] = None
    thuoc_dang_dung: Optional[str] = None
    di_ung: Optional[str] = None
    loi_benh_nhan: str


class GoiYCanNhac(BaseModel):
    ten: str
    ly_do: str
    can_hoi_them: str


class KetQuaAI(BaseModel):
    ban_tom_tat: str
    goi_y_can_nhac: list[GoiYCanNhac] = []
    loi_khuyen_benh_nhan: str = ""
    muc_do_danh_gia: str = ""
    ly_do_muc_do: str = ""


class BanTomTat(BaseModel):
    ly_do_kham: str
    trieu_chung: list[str]
    thoi_gian: Optional[str] = None
    muc_do: Optional[str] = None
    tien_su: Optional[str] = None
    thuoc_dang_dung: Optional[str] = None
    di_ung: Optional[str] = None
    loi_benh_nhan: str
    canh_bao_khan_cap: bool = False
    goi_y_can_nhac: Optional[list[dict]] = None


TU_KHOA_KHAN_CAP = [
    "đau ngực", "khó thở", "ngất", "co giật", "liệt",
    "méo miệng", "nói khó", "ho ra máu", "nôn ra máu",
    "đi ngoài ra máu", "chảy máu không cầm", "muốn chết", "tự tử",
    "tím tái", "không thở được", "mất ý thức", "liệt nửa người",
    "đau đầu dữ dội", "nôn liên tục", "sốt cao", "đau bụng dữ dội",
]

class DangKy(BaseModel):
    email: str
    mat_khau: str
    ho_ten: str


class DangNhap(BaseModel):
    email: str
    mat_khau: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    ho_ten: str
    vai_tro: str

    class Config:
        from_attributes = True


class KetQuaGui(BaseModel):
    canh_bao_khan_cap: bool
    thong_bao: str
    loi_khuyen: str = ""


class HoSoTomTat(BaseModel):
    id: int
    benh_nhan_id: int
    benh_nhan_ho_ten: Optional[str] = None
    trang_thai: str
    canh_bao_khan_cap: bool
    tao_luc: datetime
    ly_do_kham: Optional[str] = None
    muc_do_danh_gia: Optional[str] = None

    class Config:
        from_attributes = True


class HoSoChiTiet(BaseModel):
    id: int
    benh_nhan_id: Optional[int] = None
    benh_nhan_ho_ten: Optional[str] = None
    trang_thai: str
    canh_bao_khan_cap: bool
    tao_luc: datetime
    noi_dung_tom_tat: Optional[dict] = None
    loi_benh_nhan: str
    goi_y_can_nhac: list = []
    luu_y: str = "Chỉ mang tính tham khảo, cần bác sĩ khám và xác nhận."


class TrangThaiUpdate(BaseModel):
    trang_thai: Literal["moi", "da_xem"]


class HoSoTaoMoi(BaseModel):
    benh_nhan_ten: str
    loi_benh_nhan: str
    ban_tom_tat: Optional[str] = None
    trieu_chung: list[str] = []
    canh_bao_khan_cap: bool = False
    trang_thai: Literal["moi", "da_xem"] = "moi"


class HoSoCapNhat(BaseModel):
    ban_tom_tat: Optional[str] = None
    trieu_chung: Optional[list[str]] = None
    canh_bao_khan_cap: Optional[bool] = None
    trang_thai: Optional[Literal["moi", "da_xem"]] = None