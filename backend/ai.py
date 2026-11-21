import os
import time
from typing import Optional

env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

from google import genai
from google.genai import types

from schemas import KetQuaAI, YeuCau

MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
API_KEY = os.getenv("GEMINI_API_KEY")
FALLBACK_MODELS = ["gemini-3.1-flash-lite", "gemini-3.6-flash", "gemini-3.7-flash"]

SYSTEM_PROMPT = (
    "Bạn là trợ lý hỗ trợ bác sĩ. Nhiệm vụ: tóm tắt đúng lời khai của bệnh nhân "
    "(không thêm triệu chứng, không bịa thông tin) và đưa 3-5 khả năng để BÁC SĨ cân nhắc.\n"
    "Quy tắc bắt buộc:\n"
    "- Chỉ dùng thông tin bệnh nhân cung cấp; không bịa triệu chứng/bệnh.\n"
    "- Không chẩn đoán chắc chắn, không kê thuốc, không hướng dẫn điều trị.\n"
    "- Nếu có dấu hiệu nguy hiểm (đau ngực, khó thở, ngất, co giật, liệt, méo miệng, ...), "
    "không được xem nhẹ; gợi ý phải nhấn mạnh cần cấp cứu/khám ngay.\n"
    "- Không được nhầm bệnh nguy hiểm thành bệnh thông thường; luôn nêu độ không chắc chắn.\n"
    "- goi_y_can_nhac: 3-5 mục, mỗi mục có ten (tên khả năng), ly_do (vì sao cân nhắc dựa trên lời khai), "
    "can_hoi_them (câu hỏi bác sĩ nên hỏi thêm).\n"
    "- ban_tom_tat: tóm tắt ngắn gọn, trung lập.\n"
    "- loi_khuyen_benh_nhan: lời khuyên chung cho bệnh nhân (nghỉ ngơi, uống nước, theo dõi triệu chứng), "
    "không chẩn đoán, không kê thuốc; luôn khuyên gặp bác sĩ nếu triệu chứng kéo dài/nặng hơn.\n"
    "Trả về JSON theo schema."
)


def goi_y_tu_ai(du_lieu: YeuCau) -> Optional[KetQuaAI]:
    if not API_KEY:
        print("AI disabled: no GEMINI_API_KEY")
        return None
    client = genai.Client(api_key=API_KEY)
    noi_dung = (
        f"Lý do khám: {du_lieu.ly_do_kham}\n"
        f"Triệu chứng: {', '.join(du_lieu.trieu_chung)}\n"
        f"Thời gian: {du_lieu.thoi_gian}\n"
        f"Mức độ: {du_lieu.muc_do}\n"
        f"Tiền sử: {du_lieu.tien_su}\n"
        f"Thuốc đang dùng: {du_lieu.thuoc_dang_dung}\n"
        f"Dị ứng: {du_lieu.di_ung}\n"
        f"Lời khai gốc: {du_lieu.loi_benh_nhan}\n"
    )
    models_to_try = [MODEL] + [m for m in FALLBACK_MODELS if m != MODEL]
    for model_name in models_to_try:
        for lan in range(2):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=noi_dung,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        response_mime_type="application/json",
                        response_schema=KetQuaAI,
                    ),
                )
                if response.parsed is None:
                    continue
                return response.parsed
            except Exception as e:
                print("AI error", model_name, "lan", lan + 1, ":", e)
                time.sleep(1)
    return None