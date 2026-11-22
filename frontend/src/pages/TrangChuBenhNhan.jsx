import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function TrangChuBenhNhan() {
  return (
    <Layout title="Trang chủ bệnh nhân">
      <div className="card">
        <h3>Chào mừng bạn</h3>
        <p className="muted">Chọn chức năng bên dưới để bắt đầu.</p>
        <div className="row" style={{ marginTop: 12 }}>
          <Link to="/khai-bao" className="btn btn-primary">Khai báo triệu chứng</Link>
          <Link to="/dat-lich" className="btn btn-ghost">Đặt lịch khám</Link>
        </div>
      </div>
      <div className="card">
        <h3>Hỗ trợ</h3>
        <p className="muted">Bấm icon chat ở góc dưới phải để được trợ lý ảo hỗ trợ.</p>
      </div>
    </Layout>
  );
}
