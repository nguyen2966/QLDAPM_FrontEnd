import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PaymentForm from "./PaymentForm/paymentForm.jsx";
import PaymentMethod from "./paymentMethod/PaymentMethod.jsx";
import PaymentInfo from "./PaymentInfo/PaymentInfo.jsx";
import {API} from "../../api/api.js";

export function ConfirmPaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("momo");

    // Thời gian giữ ghế: 5 phút = 300 giây
    const [timeLeft, setTimeLeft] = useState(300);

    // Lấy data từ trang chọn ghế truyền sang
    const { orderId, seatIds, totalAmount, eventName } = location.state || {};

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
        if (timeLeft <= 0) return;

        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timerId); // Cleanup interval khi component unmount
    }, [timeLeft]);

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
            alert("Đã hết thời gian giữ ghế. Vui lòng chọn lại ghế!");
            return navigate(-1);
        }

        if (!formData.fullName || !formData.email || !formData.phone) {
            alert("Vui lòng điền đầy đủ thông tin người đặt vé!");
            return;
        }

        if (paymentMethod !== "momo") return;

        try {
            setLoading(true);
            const response = await API.payment.createLinkMomo(orderId, seatIds, totalAmount)

            const payUrl = response.data?.data?.data.payUrl;
            if (payUrl) {
                window.location.href = payUrl;
            } else {
                alert("Lỗi: Không lấy được link thanh toán từ server.");
            }
        } catch (error) {
            console.error("Lỗi khởi tạo MoMo:", error);
            alert(error.message || "Khởi tạo thanh toán thất bại. Vui lòng thử lại!");
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
        </div>
    );
}