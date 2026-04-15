import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { NavBar }from "./components/NavBar/NavBar";
import { Footer } from "./components/Footer/Footer";

import { HomePage } from "./pages/HomePage/HomePage";
import { Login } from "./pages/Login/Login";
import { Signup } from "./pages/Signup/Signup";
import { useAuth } from "./hooks/useAuth.js";
import { UserPage } from "./pages/UserPage/UserPage.jsx";
import { CreateEventPage } from "./pages/Organizer/CreateEventPage/CreateEventPage.jsx";
import { EventDetail } from "./pages/EventDetailPage/EventDetail.jsx";
import { OrderPage } from "./pages/OrderPage/OrderPage.jsx";
import { MyEventPage } from "./pages/Organizer/MyEventPage/MyEventPage.jsx";
import { ConfirmPaymentPage } from "./pages/ConfirmPaymentPage/ConfirmPaymentPage.jsx";
import { MyOrderPage } from "./pages/MyOrderPage.jsx/MyOrderPage.jsx";
import PaymentResult from "./pages/PaymentResultPage/PaymentResult.jsx";
import MyTicketsPage from "./pages/MyTicketsPage/MyTicketsPage.jsx";
import { LoadingState } from "./components/LoadingState/LoadingState.jsx";
import OrganizerRoute from "./components/ProtectCreateEvent/OrganizerRout.jsx";
import { AdminPanel } from "./pages/AdminPages/AminPanel.jsx";
import { OrganizerApprovalPage } from "./pages/AdminPages/OrganizerApprovalPage/OrganizerApprovalPage.jsx";
import { EventApprovalPage } from "./pages/AdminPages/EventApprovalPage/EventApprovalPage.jsx";
import { OrganizerApprovalDetail} from "./pages/AdminPages/OrganizerApprovalPage/components/OrganizerApprovalDetail.jsx";
import { EventApprovalDetail } from "./pages/AdminPages/EventApprovalPage/EventApprovalDetail.jsx";
import AdminUserList from "./pages/AdminPages/UserManagementPage/AdminUserList.jsx";

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

  if (loading) return <LoadingState displayText={"Đang tải"} />;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

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

       <Route path="/" element={<HomePage />} />

        {/* Admin only */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminPanel/>}/>
          <Route path="/admin/organizer" element={<OrganizerApprovalPage/>}/>
          <Route path="/admin/organizer/:userId" element={<OrganizerApprovalDetail />} />
          <Route path="/admin/event/:eventId" element={<EventApprovalDetail />}/>
          <Route path="/admin/event" element={<EventApprovalPage />}/>
          <Route path="/admin/user" element={<AdminUserList />}/>
        </Route>

        {/* Customer + Organizer */}
        <Route element={<ProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER"]} />}>
          
          <Route path="/user" element={<UserPage />} />
          <Route path = "/:eventId" element ={<EventDetail/>}/>
          <Route path = "/order/:eventId" element={<OrderPage/>}/>
          
          <Route path = "/order/confirm/:orderId" element={<ConfirmPaymentPage/>}/>
          <Route path = "/order/result" element={<PaymentResult/>}/>
          <Route path = "/user/my-tickets" element={<MyTicketsPage/>}/>

          <Route path ="/order/my-order" element={<MyOrderPage/>}/>
        </Route>

        {/* Organizer only */}
        <Route element={<ProtectedRoute allowedRoles={["ORGANIZER"]} />}>
          
          <Route element={<OrganizerRoute />}>
            <Route path="/my-event/create" element={<CreateEventPage />} />
          </Route>

          <Route path="/my-event" element = {<MyEventPage/>}/>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Route>
    </Routes>
  );
}