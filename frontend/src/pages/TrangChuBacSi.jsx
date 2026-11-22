import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import Layout from "../components/Layout";

export default function TrangChuBacSi() {
  const [soMoi, setSoMoi] = useState(0);
  const [soLich, setSoLich] = useState(0);

  useEffect(() => {
    (async () => {
      const r1 = await api("/api/bac-si/ho-so?trang_thai=moi");
      if (r1.ok) setSoMoi((await r1.json()).length);
      const r2 = await api("/api/bac-si/lich-kham");
      if (r2.ok) setSoLich((await r2.json()).filter((x) => x.trang_thai === "cho_xac_nhan").length);
    })();
  }, []);

  return (
    <Layout title="Trang chủ">
      <div className="hero card">
        <h1>Xin chào, bác sĩ</h1>
        <p>Quản lý hồ sơ bệnh nhân và lịch khám trong một nơi.</p>
      </div>
      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card stat-card">
          <div className="stat-number">{soMoi}</div>
          <p className="muted">Hồ sơ mới chờ xem</p>
        </div>
        <div className="card stat-card">
          <div className="stat-number">{soLich}</div>
          <p className="muted">Lịch chờ xác nhận</p>
        </div>
      </div>
      <div className="grid-2" style={{ marginTop: 16 }}>
        <Link to="/bac-si/ho-so" className="card action-card">
          <h3>Hồ sơ bệnh nhân</h3>
          <p className="muted">Xem, lọc, đánh dấu đã xem, thêm/sửa/xóa hồ sơ.</p>
          <span className="btn btn-primary" style={{ marginTop: 8, display: "inline-block" }}>Mở danh sách</span>
        </Link>
        <Link to="/bac-si/lich-kham" className="card action-card">
          <h3>Lịch khám</h3>
          <p className="muted">Xác nhận hoặc hủy lịch bệnh nhân đặt.</p>
          <span className="btn btn-ghost" style={{ marginTop: 8, display: "inline-block" }}>Xem lịch</span>
        </Link>
      </div>
    </Layout>
  );
}
