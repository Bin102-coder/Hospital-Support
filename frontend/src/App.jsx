import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import TrangChuBenhNhan from "./pages/TrangChuBenhNhan";
import FormKhaiBao from "./pages/FormKhaiBao";
import DatLich from "./pages/DatLich";
import TrangChuBacSi from "./pages/TrangChuBacSi";
import BacSiDanhSach from "./pages/BacSiDanhSach";
import BacSiChiTiet from "./pages/BacSiChiTiet";
import BacSiLichKham from "./pages/BacSiLichKham";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute role="benh_nhan"><TrangChuBenhNhan /></ProtectedRoute>} />
        <Route path="/khai-bao" element={<ProtectedRoute role="benh_nhan"><FormKhaiBao /></ProtectedRoute>} />
        <Route path="/dat-lich" element={<ProtectedRoute role="benh_nhan"><DatLich /></ProtectedRoute>} />
        <Route path="/bac-si" element={<ProtectedRoute role="bac_si"><TrangChuBacSi /></ProtectedRoute>} />
        <Route path="/bac-si/ho-so" element={<ProtectedRoute role="bac_si"><BacSiDanhSach /></ProtectedRoute>} />
        <Route path="/bac-si/ho-so/:id" element={<ProtectedRoute role="bac_si"><BacSiChiTiet /></ProtectedRoute>} />
        <Route path="/bac-si/lich-kham" element={<ProtectedRoute role="bac_si"><BacSiLichKham /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
