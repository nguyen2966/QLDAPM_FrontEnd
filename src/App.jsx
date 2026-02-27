import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import { HomePage } from "./pages/HomePage/HomePage";
import { Login } from "./pages/Login/Login";
import { Signup } from "./pages/Signup/Signup";
import { useAuth } from "./hooks/useAuth.js";
import { UserPage } from "./pages/UserPage/UserPage.jsx";

// Component bảo vệ Route
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes cho Customer */}
      <Route element={<ProtectedRoute allowedRoles={["CUSTOMER","ORGANIZER"]} />}>
        <Route path="/" element={<HomePage />} />
      </Route>

       <Route element={<ProtectedRoute allowedRoles={["CUSTOMER","ORGANIZER"]} />}>
        <Route path="/user" element={<UserPage />} />
      </Route>



      {/* đường dẫn lạ thì về trang chủ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}