import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import Layout from "../components/Layout";

export default function BacSiChiTiet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hoSo, setHoSo] = useState(null);
  const [loi, setLoi] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  async function tai() {
    setLoi("");
    const res = await api(`/api/bac-si/ho-so/${id}`);
    if (!res.ok) { setLoi("Lỗi " + res.status); return; }
    const data = await res.json();
    setHoSo(data);
    const nd = data.noi_dung_tom_tat || {};
    setForm({
      loi_benh_nhan: data.loi_benh_nhan || "",
      ban_tom_tat: nd.ban_tom_tat || "",
      trieu_chung: (nd.trieu_chung || []).join(", "),
      canh_bao_khan_cap: data.canh_bao_khan_cap,
      trang_thai: data.trang_thai,
    });
  }

  useEffect(() => { tai(); }, [id]);

  async function danhDauDaXem() {
    const res = await api(`/api/bac-si/ho-so/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ trang_thai: "da_xem" }),
    });
    if (res.ok) setHoSo(await res.json()); else setLoi("Lỗi " + res.status);
  }

  async function luuSua(e) {
    e.preventDefault();
    const payload = {
      loi_benh_nhan: form.loi_benh_nhan,
      ban_tom_tat: form.ban_tom_tat,
      trieu_chung: form.trieu_chung.split(",").map((s) => s.trim()).filter(Boolean),
      canh_bao_khan_cap: form.canh_bao_khan_cap,
      trang_thai: form.trang_thai,
    };
    const res = await api(`/api/bac-si/ho-so/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    if (res.ok) { setHoSo(await res.json()); setEditing(false); } else setLoi("Lỗi " + res.status);
  }

  async function xoa() {
    if (!window.confirm("Xóa hồ sơ này?")) return;
    const res = await api(`/api/bac-si/ho-so/${id}`, { method: "DELETE" });
    if (res.ok) navigate("/bac-si"); else setLoi("Lỗi " + res.status);
  }

  if (loi) return <div className="container"><div className="alert alert-danger">{loi}</div></div>;
  if (!hoSo) return <div className="container"><p className="muted">Đang tải...</p></div>;

  const nd = hoSo.noi_dung_tom_tat || {};
  const trieuChung = nd.trieu_chung || [];

  return (
    <Layout title={`Hồ sơ bệnh nhân #${hoSo.id}`}>
      <div className="card">
        <p><Link to="/bac-si">← Quay lại danh sách</Link></p>

        <div className="row" style={{ marginBottom: 8 }}>
          <span className="muted">Bệnh nhân:</span>
          <b>{hoSo.benh_nhan_ho_ten}</b>
          <span className="muted">(id {hoSo.benh_nhan_id})</span>
          <span className={hoSo.trang_thai === "moi" ? "badge badge-moi" : "badge badge-da"}>
            {hoSo.trang_thai === "moi" ? "Mới" : "Đã xem"}
          </span>
          <span className="muted">{new Date(hoSo.tao_luc).toLocaleString()}</span>
        </div>

        {hoSo.canh_bao_khan_cap && <div className="alert alert-danger">Cảnh báo khẩn cấp</div>}

        {!editing ? (
          <>
            <h3>Tóm tắt cho bác sĩ</h3>
            <p>{nd.ban_tom_tat || "Chưa có tóm tắt."}</p>
            <div className="info-grid" style={{ marginTop: 10 }}>
              <div className="info-item"><b>Lý do khám:</b> {nd.ly_do_kham || "—"}</div>
              <div className="info-item"><b>Thời gian:</b> {nd.thoi_gian || "—"}</div>
              <div className="info-item"><b>Mức độ:</b> {nd.muc_do || "—"}</div>
              <div className="info-item"><b>Tiền sử:</b> {nd.tien_su || "—"}</div>
              <div className="info-item"><b>Thuốc đang dùng:</b> {nd.thuoc_dang_dung || "—"}</div>
              <div className="info-item"><b>Dị ứng:</b> {nd.di_ung || "—"}</div>
            </div>
            <div style={{ marginTop: 10 }}>
              <b>Triệu chứng:</b>{" "}
              {trieuChung.length > 0 ? trieuChung.map((t, i) => <span key={i} className="tag">{t}</span>) : "—"}
            </div>

            <h3>Lời khai gốc của bệnh nhân</h3>
            <pre className="pre">{hoSo.loi_benh_nhan}</pre>

            <h3>Gợi ý để bác sĩ cân nhắc</h3>
            {hoSo.goi_y_can_nhac && hoSo.goi_y_can_nhac.length > 0 ? (
              hoSo.goi_y_can_nhac.map((g, i) => (
                <div key={i} className="suggest-card">
                  <b>{g.ten}</b>
                  <p className="muted" style={{ margin: "4px 0" }}>{g.ly_do}</p>
                  <p style={{ margin: 0, fontSize: 13 }}>Cần hỏi thêm: {g.can_hoi_them}</p>
                </div>
              ))
            ) : <p className="muted">Chưa có gợi ý.</p>}
            <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>{hoSo.luu_y}</p>

            <div className="row" style={{ marginTop: 12 }}>
              {hoSo.trang_thai === "moi" && (
                <button className="btn btn-primary" onClick={danhDauDaXem}>Đánh dấu đã xem</button>
              )}
              <button className="btn btn-ghost" onClick={() => setEditing(true)}>Sửa</button>
              <button className="btn btn-danger" onClick={xoa}>Xóa</button>
            </div>
          </>
        ) : (
          <form onSubmit={luuSua}>
            <div style={{ marginBottom: 8 }}>
              <label className="muted">Lời khai bệnh nhân</label>
              <textarea className="input" rows={4} value={form.loi_benh_nhan}
                onChange={(e) => setForm({ ...form, loi_benh_nhan: e.target.value })} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label className="muted">Tóm tắt</label>
              <textarea className="input" rows={3} value={form.ban_tom_tat}
                onChange={(e) => setForm({ ...form, ban_tom_tat: e.target.value })} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label className="muted">Triệu chứng (ngăn cách dấu phẩy)</label>
              <input className="input" value={form.trieu_chung}
                onChange={(e) => setForm({ ...form, trieu_chung: e.target.value })} />
            </div>
            <div className="row" style={{ marginBottom: 8 }}>
              <label><input type="checkbox" checked={form.canh_bao_khan_cap}
                onChange={(e) => setForm({ ...form, canh_bao_khan_cap: e.target.checked })} /> Cảnh báo khẩn cấp</label>
              <select className="input" style={{ width: "auto" }} value={form.trang_thai}
                onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}>
                <option value="moi">Mới</option>
                <option value="da_xem">Đã xem</option>
              </select>
            </div>
            <div className="row">
              <button type="submit" className="btn btn-primary">Lưu</button>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Hủy</button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
