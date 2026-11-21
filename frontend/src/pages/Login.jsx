import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken, decodeToken } from "../api";

function SceneExterior() {
  return (
    <svg viewBox="0 0 400 320" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>
      <rect width="400" height="320" fill="url(#sky1)" />
      <rect x="40" y="110" width="320" height="180" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
      <rect x="70" y="140" width="50" height="40" fill="#cbd5e1" />
      <rect x="140" y="140" width="50" height="40" fill="#cbd5e1" />
      <rect x="210" y="140" width="50" height="40" fill="#cbd5e1" />
      <rect x="280" y="140" width="50" height="40" fill="#cbd5e1" />
      <rect x="160" y="210" width="80" height="80" fill="#0d9488" />
      <rect x="185" y="225" width="30" height="50" fill="#ffffff" />
      <rect x="0" y="290" width="400" height="30" fill="#86efac" />
      <circle cx="330" cy="60" r="26" fill="#fde68a" />
    </svg>
  );
}

function SceneCorridor() {
  return (
    <svg viewBox="0 0 400 320" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="320" fill="#e2e8f0" />
      <rect x="0" y="0" width="400" height="40" fill="#0d9488" />
      <rect x="20" y="60" width="360" height="240" fill="#f8fafc" />
      <rect x="40" y="80" width="100" height="120" fill="#cbd5e1" />
      <rect x="160" y="80" width="100" height="120" fill="#cbd5e1" />
      <rect x="280" y="80" width="80" height="120" fill="#cbd5e1" />
      <rect x="40" y="220" width="320" height="60" fill="#94a3b8" />
      <rect x="150" y="235" width="100" height="30" fill="#0d9488" />
    </svg>
  );
}

function SceneLab() {
  return (
    <svg viewBox="0 0 400 320" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="320" fill="#f0f9ff" />
      <rect x="0" y="260" width="400" height="60" fill="#bae6fd" />
      <rect x="30" y="80" width="120" height="160" rx="8" fill="#ffffff" stroke="#0d9488" />
      <rect x="50" y="100" width="80" height="20" fill="#0d9488" />
      <rect x="50" y="130" width="80" height="20" fill="#94a3b8" />
      <rect x="50" y="160" width="80" height="20" fill="#94a3b8" />
      <rect x="200" y="90" width="160" height="140" rx="8" fill="#ffffff" stroke="#0d9488" />
      <circle cx="250" cy="140" r="24" fill="#fde68a" />
      <rect x="290" y="120" width="50" height="60" fill="#cbd5e1" />
      <rect x="200" y="250" width="160" height="20" fill="#0d9488" />
    </svg>
  );
}

const SCENES = [SceneExterior, SceneCorridor, SceneLab];

export default function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [hoTen, setHoTen] = useState("");
  const [loi, setLoi] = useState("");
  const [sceneIndex, setSceneIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setSceneIndex((i) => (i + 1) % SCENES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  async function submit(e) {
    e.preventDefault();
    setLoi("");
    try {
      if (mode === "register") {
        const r = await api("/api/dang-ky", {
          method: "POST",
          body: JSON.stringify({ email, mat_khau: matKhau, ho_ten: hoTen }),
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

  const Scene = SCENES[sceneIndex];

  return (
    <div className="login-shell">
      <div className="login-left">
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
              <div style={{ marginBottom: 10 }}>
                <input className="input" placeholder="Họ tên" value={hoTen}
                  onChange={(e) => setHoTen(e.target.value)} required />
              </div>
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
        <div className="scene-wrap fade-in" key={sceneIndex}>
          <Scene />
        </div>
        <div className="login-right-text">
          <h2>Chăm sóc sức khỏe thông minh</h2>
          <p className="muted">Thu thập và tổng hợp triệu chứng trước khám cho bệnh nhân.</p>
        </div>
      </div>
    </div>
  );
}