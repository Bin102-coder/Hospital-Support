import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken, decodeToken } from "../api";
import MedicalSlideshow from "../components/MedicalSlideshow";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [hoTen, setHoTen] = useState("");
  const [maBacSi, setMaBacSi] = useState("");
  const [loi, setLoi] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoi("");
    try {
      if (mode === "register") {
        const r = await api("/api/dang-ky", {
          method: "POST",
          body: JSON.stringify({ email, mat_khau: matKhau, ho_ten: hoTen, ma_bac_si: maBacSi }),
        });
        if (!r.ok) throw new Error(await r.text());
      }
      const r = await api("/api/dang-nhap", {
        method: "POST",
        body: JSON.stringify({ email, mat_khau: matKhau }),
      });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      setToken(data.access_token);
      localStorage.setItem("email", email);
      const payload = decodeToken(data.access_token);
      navigate(payload?.vai_tro === "bac_si" ? "/bac-si" : "/", { replace: true });
    } catch (err) {
      setLoi("Lỗi: " + err.message);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-left" style={{ maxWidth: 560 }}>
        <div className="brand-row">
          <div className="brand-mark">H</div>
          <div>
            <div className="brand-name">Hospital</div>
            <div className="brand-sub">Hệ thống hỗ trợ khám bệnh</div>
          </div>
        </div>
        <div className="card" style={{ marginTop: 24 }}>
          <h2 className="center">{mode === "login" ? "Đăng nhập" : "Đăng ký"}</h2>
          <p className="muted center" style={{ marginBottom: 16 }}>
            {mode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
          </p>
          <form onSubmit={submit}>
            {mode === "register" && (
              <>
                <div style={{ marginBottom: 10 }}>
                  <input className="input" placeholder="Họ tên" value={hoTen}
                    onChange={(e) => setHoTen(e.target.value)} required />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <input className="input" placeholder="Mã bác sĩ (nếu có)" value={maBacSi}
                    onChange={(e) => setMaBacSi(e.target.value)} />
                </div>
              </>
            )}
            <div style={{ marginBottom: 10 }}>
              <input className="input" type="email" placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: 12 }}>
              <input className="input" type="password" placeholder="Mật khẩu" value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              {mode === "login" ? "Đăng nhập" : "Đăng ký"}
            </button>
          </form>
          <p className="muted center" style={{ marginTop: 12 }}>
            {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
            <button className="link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Đăng ký" : "Đăng nhập"}
            </button>
          </p>
          {loi && <div className="alert alert-danger">{loi}</div>}
          <p className="muted center" style={{ marginTop: 8, fontSize: 12 }}>
            Seed bác sĩ: admin@hospital.com / admin123
          </p>
        </div>
      </div>
      <div className="login-right">
        <div style={{ width: "100%", maxWidth: 360 }}>
          <MedicalSlideshow />
        </div>
        <div className="login-right-text">
          <h2>Chăm sóc sức khỏe thông minh</h2>
          <p className="muted">Thu thập và tổng hợp triệu chứng trước khám cho bệnh nhân.</p>
        </div>
      </div>
    </div>
  );
}
