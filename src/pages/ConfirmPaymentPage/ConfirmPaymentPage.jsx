import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PaymentForm from "./PaymentForm/paymentForm.jsx";
import PaymentMethod from "./paymentMethod/PaymentMethod.jsx";
import PaymentInfo from "./PaymentInfo/PaymentInfo.jsx";
import {API} from "../../api/api.js";
import {CustomToast} from "../../components/Toast/toast.jsx";

export function ConfirmPaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("momo");

    const [toastConfig, setToastConfig] = useState(null);

    // Thêm eventId và holdExpiredAt vào danh sách lấy từ location.state
    const { orderId, seatIds, totalAmount, eventName, holdExpiredAt, eventId } = location.state || {};

    // 1. BỎ hardcode 300 giây, set giá trị mặc định là 0
    const [timeLeft, setTimeLeft] = useState(0);

    const showToast = (message, type = "info") => {
        setToastConfig({ message, type });
    };


    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
    });

    function formatCurrency(value) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(Number(value || 0));
    }

    // Xử lý đồng hồ đếm ngược
    useEffect(() => {
        if (!holdExpiredAt) return;

        // Hàm tính toán số giây còn lại dựa trên giờ hệ thống và giờ backend
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const expiredTime = new Date(holdExpiredAt).getTime();
            const diff = Math.floor((expiredTime - now) / 1000);
            return diff > 0 ? diff : 0;
        };

        // Cập nhật ngay lần đầu tiên
        setTimeLeft(calculateTimeLeft());

        const timerId = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(timerId);
                showToast("Đã hết thời gian giữ ghế. Vui lòng chọn lại ghế!", "warning");
                // Tự động đá về trang sơ đồ ghế khi hết giờ
                setTimeout(() => navigate(`/order/${eventId}`), 2000);
            }
        }, 1000);

        return () => clearInterval(timerId);
    }, [holdExpiredAt, eventId, navigate]);

    // Format giây thành dạng MM:SS
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePayment = async () => {
        if (timeLeft <= 0) {
            showToast("Đã hết thời gian giữ ghế. Vui lòng chọn lại ghế!", "warning");
            setTimeout(() => navigate(`/order/${eventId}`), 2000);
            return;
        }

        if (!formData.fullName || !formData.email || !formData.phone) {
            showToast("Vui lòng điền đầy đủ thông tin người đặt vé!", "warning");
            return;
        }


        if (Number(totalAmount) === 0) {
            try{
                setLoading(true);
                const result = await API.payment.freePay(orderId, seatIds);
                sessionStorage.removeItem(`activeOrder_${eventId}`);

                showToast("Đăng ký vé thành công! Đang chuyển hướng...", "success");

                // Đợi 1.5 giây để hiện Toast xong rồi mới chuyển trang
                setTimeout(() => {
                    navigate(`/order/result?orderId=${orderId}&success=true&amount=0`);
                }, 1500);
                return;
            } catch (e){
                showToast("Đã xảy ra lỗi khi đăng ký vé. Vui lòng thử lại!", "error");
                throw e
            } finally {
                setLoading(false);
            }
        }

        if (paymentMethod !== "momo") return;

        try {
            setLoading(true);
            const response = await API.payment.createLinkMomo(orderId, seatIds, totalAmount)

            const payUrl = response.data?.data?.data.payUrl;
            if (payUrl) {
                sessionStorage.removeItem(`activeOrder_${eventId}`);
                window.location.href = payUrl;
            } else {
                showToast("Không lấy được link thanh toán từ server.", "error");
            }
        } catch (error) {
            console.error("Lỗi khởi tạo MoMo:", error);
            showToast(error.message || "Khởi tạo thanh toán thất bại!", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!orderId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Không tìm thấy thông tin đơn hàng!</h3>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    Quay lại trang trước
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center lg:text-left">
                    Xác nhận thanh toán
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ================= CỘT TRÁI: THÔNG TIN & PHƯƠNG THỨC THANH TOÁN ================= */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Form thông tin người đặt vé */}
                        <PaymentForm
                            formData={formData}
                            onChange={handleInputChange}
                        />

                        {/* 2. Phương thức thanh toán (Dời qua cột trái) */}
                        <PaymentMethod
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                        />

                    </div>

                    {/* ================= CỘT PHẢI: TỔNG KẾT ĐƠN HÀNG ================= */}
                    <PaymentInfo
                        timeLeft={timeLeft}
                        formatTime={formatTime}
                        orderId={orderId}
                        eventName={eventName}
                        seatIds={seatIds}
                        amount={totalAmount}
                        handlePayment={handlePayment}
                        loading={loading}
                        formatCurrency={formatCurrency}
                    />

                </div>
            </div>

            {toastConfig && (
                <CustomToast
                    message={toastConfig.message}
                    type={toastConfig.type}
                    // Truyền hàm đóng: khi toast tự tắt sau 3s, nó sẽ set state về null
                    onClose={() => setToastConfig(null)}
                />
            )}
        </div>
    );
}