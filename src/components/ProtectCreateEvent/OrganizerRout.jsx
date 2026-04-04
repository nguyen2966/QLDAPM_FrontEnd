import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { API } from "../../api/api.js";
import Modal from "../Modal/Modal.jsx";

const OrganizerRoute = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await API.user.getUserById(user.userId);
      setProfile(res.data.data);
    } catch (err) {
      console.error("Fetch user error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchUser();
    }
  }, [user?.userId]);

  const isProfileComplete =
    profile?.role === "ORGANIZER" &&
    profile?.organizer?.businessLicenseUrl &&
    profile?.organizer?.taxCode;

  const isApproved = profile?.organizer?.isApproved === true;

  useEffect(() => {
    if (!loading && user) {
      if (!isProfileComplete || !isApproved) {
        setShowModal(true);
      }
    }
  }, [loading, user, isProfileComplete, isApproved]);

  const handleClose = () => {
    setShowModal(false);
    navigate("/user");
  };

  if (!user || loading) return null;

  // Case 1: Hồ sơ chưa hoàn thiện
  if (!isProfileComplete) {
    return (
      <Modal isOpen={showModal} onClose={handleClose}>
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold mb-2">
            Hồ sơ chưa hoàn thiện
          </h3>

          <p className="text-gray-600 mb-4">
            Bạn cần cung cấp <strong>mã số thuế</strong> và{" "}
            <strong>giấy phép kinh doanh</strong> trước khi tạo sự kiện.
          </p>

          <button
            onClick={handleClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Cập nhật hồ sơ
          </button>
        </div>
      </Modal>
    );
  }

  // Case 2: Chưa được admin duyệt
  if (!isApproved) {
    return (
      <Modal isOpen={showModal} onClose={handleClose}>
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold mb-2">
            Hồ sơ đang chờ duyệt
          </h3>

          <p className="text-gray-600 mb-4">
            Hồ sơ của bạn đã được gửi và đang chờ quản trị viên phê duyệt.
          </p>

          <button
            onClick={handleClose}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
          >
            Quay lại
          </button>
        </div>
      </Modal>
    );
  }

  return <Outlet />;
};

export default OrganizerRoute;