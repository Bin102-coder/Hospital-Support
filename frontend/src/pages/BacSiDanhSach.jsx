import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import Layout from "../components/Layout";

export default function BacSiDanhSach() {
  const [danhSach, setDanhSach] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loc, setLoc] = useState("all");
  const [loi, setLoi] = useState("");
  const [hienForm, setHienForm] = useState(false);
  const [form, setForm] = useState({
    benh_nhan_id: "",
    loi_benh_nhan: "",
    ban_tom_tat: "",
    trieu_chung: "",
    canh_bao_khan_cap: false,
    trang_thai: "moi",
  });

  async function tai() {
    setLoi("");
    const q = loc === "all" ? "" : `?trang_thai=${loc}`;
    const res = await api(`/api/bac-si/ho-so${q}`);
    if (!res.ok) { setLoi("Lỗi " + res.status); return; }
    setDanhSach(await res.json());
  }

  async function taiBenhNhan() {
    const res = await api("/api/bac-si/benh-nhan");
    if (res.ok) setPatients(await res.json());
  }

  useEffect(() => { tai(); }, [loc]);
  useEffect(() => { taiBenhNhan(); }, []);

  async function taoHoSo(e) {
    e.preventDefault();
    setLoi("");
    const payload = {
      benh_nhan_id: Number(form.benh_nhan_id),
      loi_benh_nhan: form.loi_benh_nhan,
      ban_tom_tat: form.ban_tom_tat,
      trieu_chung: form.trieu_chung.split(",").map((s) => s.trim()).filter(Boolean),
      canh_bao_khan_cap: form.canh_bao_khan_cap,
      trang_thai: form.trang_thai,
    };
    const res = await api("/api/bac-si/ho-so", { method: "POST", body: JSON.stringify(payload) });
    if (!res.ok) { setLoi("Lỗi " + res.status); return; }
    setHienForm(false);
    setForm({ benh_nhan_id: "", loi_benh_nhan: "", ban_tom_tat: "", trieu_chung: "", canh_bao_khan_cap: false, trang_thai: "moi" });
    tai();
  }

  return (
    <Layout title="Danh sách hồ sơ bệnh nhân">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <div className="row">
            <label className="muted">Lọc:</label>
            <select className="input" style={{ width: "auto" }} value={loc} onChange={(e) => setLoc(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="moi">Mới</option>
              <option value="da_xem">Đã xem</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => setHienForm(!hienForm)}>
            {hienForm ? "Đóng" : "Thêm hồ sơ"}
          </button>
        </div>

        {hienForm && (
          <form onSubmit={taoHoSo} style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8 }}>
              <label className="muted">Bệnh nhân</label>
              <select className="input" value={form.benh_nhan_id} onChange={(e) => setForm({ ...form, benh_nhan_id: e.target.value })} required>
                <option value="">-- Chọn --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.ho_ten} ({p.email})</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 8 }}>
              <textarea className="input" placeholder="Lời khai bệnh nhân" value={form.loi_benh_nhan}
                onChange={(e) => setForm({ ...form, loi_benh_nhan: e.target.value })} required rows={3} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <input className="input" placeholder="Tóm tắt (tùy chọn)" value={form.ban_tom_tat}
                onChange={(e) => setForm({ ...form, ban_tom_tat: e.target.value })} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <input className="input" placeholder="Triệu chứng (ngăn cách dấu phẩy)" value={form.trieu_chung}
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
            <button type="submit" className="btn btn-primary">Lưu</button>
          </form>
        )}

        {loi && <div className="alert alert-danger">{loi}</div>}
        {danhSach.length === 0 && <p className="muted">Không có hồ sơ.</p>}
        {danhSach.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Bệnh nhân</th>
                  <th>Lý do khám</th>
                  <th>Trạng thái</th>
                  <th>Cảnh báo</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {danhSach.map((h) => (
                  <tr key={h.id}>
                    <td><Link to={`/bac-si/${h.id}`}>{h.id}</Link></td>
                    <td>{h.benh_nhan_ho_ten}</td>
                    <td>{h.ly_do_kham}</td>
                    <td>
                      <span className={h.trang_thai === "moi" ? "badge badge-moi" : "badge badge-da"}>
                        {h.trang_thai}
                      </span>
                    </td>
                    <td>{h.canh_bao_khan_cap ? <span className="badge badge-warn">!</span> : ""}</td>
                    <td className="muted">{new Date(h.tao_luc).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
