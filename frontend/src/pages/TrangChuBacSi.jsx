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
    <Layout title="Trang chủ bác sĩ">
      <div className="card">
        <h3>Tổng quan</h3>
        <div className="row">
          <div className="chip">Hồ sơ mới: {soMoi}</div>
          <div className="chip">Lịch chờ xác nhận: {soLich}</div>
        </div>
      </div>
      <div className="card">
        <h3>Chức năng</h3>
        <div className="row" style={{ marginTop: 12 }}>
          <Link to="/bac-si/ho-so" className="btn btn-primary">Hồ sơ bệnh nhân</Link>
          <Link to="/bac-si/lich-kham" className="btn btn-ghost">Lịch khám</Link>
        </div>
      </div>
    </Layout>
  );
}
