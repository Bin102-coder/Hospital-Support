import { useEffect, useState } from "react";
import { api } from "../api";
import Layout from "../components/Layout";

export default function DatLich() {
  const [danhSach, setDanhSach] = useState([]);
  const [form, setForm] = useState({ thoi_gian: "", ly_do: "" });
  const [loi, setLoi] = useState("");

  async function tai() {
    setLoi("");
    const res = await api("/api/benh-nhan/lich-kham");
    if (!res.ok) { setLoi("Lỗi " + res.status); return; }
    setDanhSach(await res.json());
  }

  useEffect(() => { tai(); const t = setInterval(tai, 5000); return () => clearInterval(t); }, []);

  async function submit(e) {
    e.preventDefault();
    setLoi("");
    const res = await api("/api/dat-lich", {
      method: "POST",
      body: JSON.stringify({ thoi_gian: form.thoi_gian, ly_do: form.ly_do }),
    });
    if (!res.ok) { setLoi("Lỗi " + res.status); return; }
    setForm({ thoi_gian: "", ly_do: "" });
    tai();
  }

  return (
    <Layout title="Đặt lịch khám">
      <div className="card">
        <h3>Đặt lịch mới</h3>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 8 }}>
            <input className="input" type="datetime-local" value={form.thoi_gian}
              onChange={(e) => setForm({ ...form, thoi_gian: e.target.value })} required />
          </div>
          <div style={{ marginBottom: 8 }}>
            <input className="input" placeholder="Lý do khám" value={form.ly_do}
              onChange={(e) => setForm({ ...form, ly_do: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary">Đặt lịch</button>
        </form>
        {loi && <div className="alert alert-danger">{loi}</div>}
      </div>

      <div className="card">
        <h3>Lịch của tôi</h3>
        {danhSach.length === 0 && <p className="muted">Chưa có lịch khám.</p>}
        {danhSach.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {danhSach.map((l) => (
                <tr key={l.id}>
                  <td>{l.thoi_gian}</td>
                  <td>{l.ly_do || "—"}</td>
                  <td>
                    <span className={l.trang_thai === "da_xac_nhan" ? "badge badge-da" : "badge badge-moi"}>
                      {l.trang_thai}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
