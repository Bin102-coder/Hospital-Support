import { Navigate } from "react-router-dom";
import { currentUser } from "../api";

export default function ProtectedRoute({ children, role }) {
  const user = currentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.vai_tro !== role) return <Navigate to="/login" replace />;
  return children;
}
