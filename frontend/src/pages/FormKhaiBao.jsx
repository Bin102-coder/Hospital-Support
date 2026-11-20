import { useState } from "react";
import { api } from "../api";
import Layout from "../components/Layout";

const CAU_HOI = [
  { key: "ly_do_kham", hoi: "Bạn đến khám vì lý do gì?" },
  { key: "trieu_chung", hoi: "Bạn có những triệu chứng nào? (ngăn cách bằng dấu phẩy)" },
  { key: "thoi_gian", hoi: "Triệu chứng bắt đầu từ khi nào, kéo dài bao lâu?" },
  { key: "tien_su", hoi: "Bạn có tiền sử bệnh nào không?" },
  { key: "thuoc_dang_dung", hoi: "Bạn đang dùng thuốc gì không?" },
  { key: "di_ung", hoi: "Bạn có dị ứng gì không?" },
];

export default function FormKhaiBao() {
  const [buoc, setBuoc] = useState(0);
  const [traLoi, setTraLoi] = useState({});
  const [nhap, setNhap] = useState("");
  const [ketQua, setKetQua] = useState(null);
  const [loi, setLoi] = useState("");
  const [dangGui, setDangGui] = useState(false);

  async function guiBanTomTat(duLieu) {
    setDangGui(true);
    setLoi("");
    const loiGoc = CAU_HOI.map((c) => `${c.hoi} ${duLieu[c.key] || ""}`).join("\n");
    const payload = {
      ly_do_kham: duLieu.ly_do_kham,
      trieu_chung: (duLieu.trieu_chung || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      thoi_gian: duLieu.thoi_gian,
      muc_do: duLieu.muc_do,
      tien_su: duLieu.tien_su,
      thuoc_dang_dung: duLieu.thuoc_dang_dung,
      di_ung: duLieu.di_ung,
      loi_benh_nhan: loiGoc,
    };
    try {
      const res = await api("/api/tom-tat", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Lỗi " + res.status);
      setKetQua(await res.json());
    } catch (e) {
      setLoi("Không gửi được: " + e.message);
    } finally {
      setDangGui(false);
    }
  }

  function tiepTuc() {
    if (!nhap.trim()) return;
    const duLieu = { ...traLoi, [CAU_HOI[buoc].key]: nhap.trim() };
    setTraLoi(duLieu);
    setNhap("");
    if (buoc + 1 < CAU_HOI.length) {
      setBuoc(buoc + 1);
    } else {
      guiBanTomTat(duLieu);
    }
  }

  function lamLai() {
    setBuoc(0);
    setTraLoi({});
    setNhap("");
    setKetQua(null);
    setLoi("");
  }

  return (
    <Layout title="Thu thập triệu chứng trước khám">
      {!ketQua && !loi && (
        <div className="card fade-in">
          <div className="card-hero" style={{ padding: 16, borderRadius: 10, marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Khai báo triệu chứng</h2>
            <p style={{ margin: 0, opacity: 0.9 }}>Câu {buoc + 1}/{CAU_HOI.length}</p>
          </div>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${((buoc) / (CAU_HOI.length - 1)) * 100}%` }} />
          </div>
          <h3 style={{ marginTop: 8 }}>{CAU_HOI[buoc].hoi}</h3>
          <input
            className="input"
            value={nhap}
            onChange={(e) => setNhap(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tiepTuc()}
            autoFocus
            disabled={dangGui}
            placeholder="Nhập câu trả lời..."
          />
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={tiepTuc} disabled={dangGui}>
              {buoc + 1 < CAU_HOI.length ? "Tiếp tục →" : "Hoàn tất ✓"}
            </button>
          </div>
        </div>
      )}
      {loi && <div className="alert alert-danger">{loi}</div>}
      {ketQua && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Đã gửi cho bác sĩ</h3>
          {ketQua.canh_bao_khan_cap && (
            <div className="alert alert-danger">
              ⚠ Cảnh báo khẩn cấp: triệu chứng có dấu hiệu nguy hiểm. Hãy đến cơ sở y tế ngay.
            </div>
          )}
          <p>{ketQua.thong_bao}</p>
          {ketQua.loi_khuyen && (
            <div className="card" style={{ marginTop: 8, background: "#f0fdfa" }}>
              <h3 style={{ marginTop: 0 }}>Lời khuyên tham khảo</h3>
              <p>{ketQua.loi_khuyen}</p>
              <p className="muted" style={{ fontSize: 13 }}>
                Đây chỉ là lời khuyên chung, không phải chẩn đoán. Hãy gặp bác sĩ để được khám và tư vấn chính xác.
              </p>
            </div>
          )}
          <p className="muted">
            Lưu ý: thông tin chỉ mang tính tham khảo, không thay thế chẩn đoán của bác sĩ.
          </p>
          <button className="btn btn-ghost" onClick={lamLai} style={{ marginTop: 8 }}>
            Khai báo mới
          </button>
        </div>
      )}
    </Layout>
  );
}
