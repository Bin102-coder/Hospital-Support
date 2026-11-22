import { Link, useNavigate } from "react-router-dom";
import { clearToken, currentUser } from "../api";
import ChatWidget from "./ChatWidget";

export default function Layout({ children, title }) {
  const user = currentUser();
  const navigate = useNavigate();
  const email = localStorage.getItem("email") || "";
  const initial = (email[0] || "U").toUpperCase();

  function logout() {
    clearToken();
    localStorage.removeItem("email");
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">H</div>
          <div>
            <div className="brand-name">Hospital</div>
            <div className="brand-sub">Hỗ trợ khám bệnh</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {user?.vai_tro === "bac_si" && (
            <>
              <Link to="/bac-si" className="side-link">Trang chủ</Link>
              <Link to="/bac-si/ho-so" className="side-link">Hồ sơ bệnh nhân</Link>
              <Link to="/bac-si/lich-kham" className="side-link">Lịch khám</Link>
            </>
          )}
          {user?.vai_tro === "benh_nhan" && (
            <>
              <Link to="/" className="side-link">Trang chủ</Link>
              <Link to="/khai-bao" className="side-link">Khai báo triệu chứng</Link>
              <Link to="/dat-lich" className="side-link">Đặt lịch khám</Link>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="avatar">{initial}</div>
          <div className="user-info">
            <div className="user-email">{email}</div>
            <div className="user-role">{user?.vai_tro === "bac_si" ? "Bác sĩ" : "Bệnh nhân"}</div>
          </div>
          <button className="btn btn-ghost" style={{ width: "100%", marginTop: 10 }} onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="main-content">
        <div className="topbar">
          <h1 style={{ margin: 0 }}>{title}</h1>
        </div>
        <div className="content-area fade-in">{children}</div>
      </main>
      {user?.vai_tro === "benh_nhan" && <ChatWidget />}
    </div>
  );
}
