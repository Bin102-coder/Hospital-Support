import { useEffect, useState } from "react";
import { api } from "../api";
import Layout from "../components/Layout";

export default function BacSiLichKham() {
  const [danhSach, setDanhSach] = useState([]);
  const [loi, setLoi] = useState("");

  async function tai() {
    setLoi("");
    const res = await api("/api/bac-si/lich-kham");
    if (!res.ok) { setLoi("Lỗi " + res.status); return; }
    setDanhSach(await res.json());
  }

  useEffect(() => { tai(); const t = setInterval(tai, 5000); return () => clearInterval(t); }, []);

  async function capNhat(id, trang_thai) {
    const res = await api(`/api/bac-si/lich-kham/${id}?trang_thai=${trang_thai}`, { method: "PATCH" });
    if (res.ok) tai(); else setLoi("Lỗi " + res.status);
  }

  return (
    <Layout title="Lịch khám của bệnh nhân">
      <div className="card">
        {loi && <div className="alert alert-danger">{loi}</div>}
        {danhSach.length === 0 && <p className="muted">Chưa có lịch khám.</p>}
        {danhSach.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Bệnh nhân</th>
                  <th>Thời gian</th>
                  <th>Lý do</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {danhSach.map((l) => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td>{l.benh_nhan_ho_ten}</td>
                    <td>{l.thoi_gian}</td>
                    <td>{l.ly_do || "—"}</td>
                    <td>
                      <span className={l.trang_thai === "da_xac_nhan" ? "badge badge-da" : "badge badge-moi"}>
                        {l.trang_thai}
                      </span>
                    </td>
                    <td>
                      {l.trang_thai === "cho_xac_nhan" && (
                        <>
                          <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: 13, marginRight: 4 }}
                            onClick={() => capNhat(l.id, "da_xac_nhan")}>Xác nhận</button>
                          <button className="btn btn-danger" style={{ padding: "4px 8px", fontSize: 13 }}
                            onClick={() => capNhat(l.id, "huy")}>Hủy</button>
                        </>
                      )}
                    </td>
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
