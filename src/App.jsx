import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { NavBar }from "./components/NavBar/NavBar";
import { Footer } from "./components/Footer/Footer";

import { HomePage } from "./pages/HomePage/HomePage";
import { Login } from "./pages/Login/Login";
import { Signup } from "./pages/Signup/Signup";
import { useAuth } from "./hooks/useAuth.js";
import { UserPage } from "./pages/UserPage/UserPage.jsx";
import { CreateEventPage } from "./pages/Organizer/CreateEventPage/CreateEventPage.jsx";

// Layout chung — bọc NavBar + Footer quanh Outlet
const MainLayout = () => {
  const { user, accessToken, logout } = useAuth();
  return (
    <>
      <NavBar token={accessToken} role={user?.role || null} onLogout={logout} />
      <Outlet />  {/* Nội dung page render ở đây */}
      <Footer />
    </>
  );
};

// Guard kiểm tra auth + role
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
      {/* Login & Signup — KHÔNG có NavBar/Footer */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Tất cả route bên dưới đều có NavBar + Footer */}
      <Route element={<MainLayout />}>
        {/* Customer + Organizer */}
        <Route element={<ProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER"]} />}>
          <Route path="/user" element={<UserPage />} />
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Organizer only */}
        <Route element={<ProtectedRoute allowedRoles={["ORGANIZER"]} />}>
          <Route path="/my-event/create" element={<CreateEventPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Route>
    </Routes>
  );
}