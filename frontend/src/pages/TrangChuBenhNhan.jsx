import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function TrangChuBenhNhan() {
  return (
    <Layout title="Trang chủ">
      <div className="hero card">
        <h1>Xin chào, bệnh nhân</h1>
        <p>Chăm sóc sức khỏe thông minh - thu thập và tổng hợp triệu chứng trước khám.</p>
      </div>
      <div className="grid-2" style={{ marginTop: 16 }}>
        <Link to="/khai-bao" className="card action-card">
          <h3>Khai báo triệu chứng</h3>
          <p className="muted">Gửi thông tin triệu chứng cho bác sĩ trước khi khám.</p>
          <span className="btn btn-primary" style={{ marginTop: 8, display: "inline-block" }}>Bắt đầu</span>
        </Link>
        <Link to="/dat-lich" className="card action-card">
          <h3>Đặt lịch khám</h3>
          <p className="muted">Chọn thời gian và lý do khám phù hợp.</p>
          <span className="btn btn-ghost" style={{ marginTop: 8, display: "inline-block" }}>Đặt lịch</span>
        </Link>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Trợ lý ảo</h3>
        <p className="muted">Bấm icon chat ở góc dưới phải để được hỗ trợ đặt lịch, hỏi đáp và gợi ý tính năng.</p>
      </div>
    </Layout>
  );
}
