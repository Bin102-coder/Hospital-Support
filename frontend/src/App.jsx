import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import FormKhaiBao from "./pages/FormKhaiBao";
import BacSiDanhSach from "./pages/BacSiDanhSach";
import BacSiChiTiet from "./pages/BacSiChiTiet";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute role="benh_nhan">
              <FormKhaiBao />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bac-si"
          element={
            <ProtectedRoute role="bac_si">
              <BacSiDanhSach />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bac-si/:id"
          element={
            <ProtectedRoute role="bac_si">
              <BacSiChiTiet />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
