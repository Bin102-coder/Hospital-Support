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

from schemas import ChatResponse, KetQuaAI, YeuCau

MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
API_KEY = os.getenv("GEMINI_API_KEY")
FALLBACK_MODELS = ["gemini-3.1-flash-lite", "gemini-3.6-flash", "gemini-3.7-flash"]

SYSTEM_PROMPT = (
    "Bạn là trợ lý hỗ trợ bác sĩ. Nhiệm vụ: tóm tắt đúng lời khai của bệnh nhân "
    "(không thêm triệu chứng, không bịa thông tin) và đưa 3-5 khả năng để BÁC SĨ cân nhắc.\n"
    "Quy tắc bắt buộc:\n"
    "- Chỉ dùng thông tin bệnh nhân cung cấp; không bịa triệu chứng/bệnh.\n"
    "- Không chẩn đoán chắc chắn, không kê thuốc, không hướng dẫn điều trị.\n"
    "- Nếu thông tin không đủ, phải nói rõ 'không đủ thông tin', không suy đoán.\n"
    "- Mỗi gợi ý phải dựa trực tiếp trên triệu chứng/lời khai; không thêm bệnh không liên quan.\n"
    "- Không dùng cụm 'cần được loại trừ các tình trạng đe dọa tính mạng ngay lập tức'.\n"
    "- Nếu có dấu hiệu nguy hiểm (đau ngực, khó thở, ngất, co giật, liệt, méo miệng, ...), "
    "không được xem nhẹ; gợi ý phải nhấn mạnh cần cấp cứu/khám ngay.\n"
    "- Không được nhầm bệnh nguy hiểm thành bệnh thông thường; luôn nêu độ không chắc chắn.\n"
    "- goi_y_can_nhac: 3-5 mục, mỗi mục có ten (tên khả năng), ly_do (vì sao cân nhắc dựa trên lời khai), "
    "can_hoi_them (câu hỏi bác sĩ nên hỏi thêm).\n"
    "- ban_tom_tat: tóm tắt ngắn gọn, trung lập.\n"
    "- loi_khuyen_benh_nhan: lời khuyên chung cho bệnh nhân (nghỉ ngơi, uống nước, theo dõi triệu chứng), "
    "không chẩn đoán, không kê thuốc; luôn khuyên gặp bác sĩ nếu triệu chứng kéo dài/nặng hơn.\n"
    "- muc_do_danh_gia: đánh giá mức độ tình trạng theo triệu chứng: 'thấp', 'trung bình', 'cao' hoặc 'nguy hiểm'.\n"
    "- ly_do_muc_do: lý do ngắn gọn cho mức độ trên (dựa trên triệu chứng), không chẩn đoán bệnh.\n"
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
                        temperature=0.2,
                    ),
                )
                if response.parsed is None:
                    continue
                return response.parsed
            except Exception as e:
                print("AI error", model_name, "lan", lan + 1, ":", e)
                time.sleep(1)
    return None


CHAT_SYSTEM_PROMPT = (
    "Bạn là trợ lý ảo hỗ trợ bệnh nhân của hệ thống khám bệnh. "
    "Nhiệm vụ: trả lời câu hỏi, gợi ý tính năng, và hỗ trợ đặt lịch khám. "
    "Quy tắc:\n"
    "- Trả lời ngắn gọn, thân thiện, tiếng Việt có dấu.\n"
    "- Không chẩn đoán bệnh, không kê thuốc.\n"
    "- Nếu bệnh nhân muốn đặt lịch, hỏi rõ ngày/giờ và lý do, sau đó đặt action='schedule'.\n"
    "- Nếu chưa rõ thông tin, hỏi lại để làm rõ.\n"
    "- Có thể gợi ý tính năng mới (vd: xem lịch sử khám, nhận thông báo).\n"
    "- Luôn nhắc gặp bác sĩ nếu triệu chứng nguy hiểm.\n"
    "Trả về JSON theo schema."
)


def chat_tro_ly(message: str, history: list[dict]) -> ChatResponse:
    if not API_KEY:
        return ChatResponse(reply="Xin lỗi, hệ thống AI chưa sẵn sàng.")
    client = genai.Client(api_key=API_KEY)
    contents = []
    for h in history:
        role = "user" if h.get("role") == "user" else "model"
        contents.append({"role": role, "parts": [{"text": h.get("content", "")}]})
    contents.append({"role": "user", "parts": [{"text": message}]})
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=CHAT_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=ChatResponse,
                temperature=0.4,
            ),
        )
        if response.parsed is None:
            return ChatResponse(reply="Xin lỗi, tôi chưa hiểu. Bạn nói rõ hơn được không?")
        return response.parsed
    except Exception as e:
        print("Chat AI error:", e)
        return ChatResponse(reply="Xin lỗi, hệ thống đang bận. Thử lại sau.")