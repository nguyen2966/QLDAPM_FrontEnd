import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import PaymentForm from "./PaymentForm/paymentForm.jsx";
import PaymentMethod from "./paymentMethod/PaymentMethod.jsx";
import PaymentInfo from "./PaymentInfo/PaymentInfo.jsx";
import {API} from "../../api/api.js";
import { toast } from "react-toastify";

export function ConfirmPaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("momo");

    const { orderId, seatIds, totalAmount, eventName, holdExpiredAt, eventId } = location.state || {};

    const [timeLeft, setTimeLeft] = useState(0);

    const showToast = (message, type = "info") => {
        toast[type](message);
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

    useEffect(() => {
        if (!holdExpiredAt) return;

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const expiredTime = new Date(holdExpiredAt).getTime();
            const diff = Math.floor((expiredTime - now) / 1000);
            return diff > 0 ? diff : 0;
        };

        setTimeLeft(calculateTimeLeft());

        const timerId = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(timerId);
                showToast("Đã hết thời gian giữ ghế. Vui lòng chọn lại ghế!", "warning");
                setTimeout(() => navigate(`/order/${eventId}`), 2000);
            }
        }, 1000);

        return () => clearInterval(timerId);
    }, [holdExpiredAt, eventId, navigate]);

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
        console.log("Kiểm tra formData hiện tại:", formData);
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
            try {
                setLoading(true);
                const result = await API.payment.freePay(orderId, seatIds);
                sessionStorage.removeItem(`activeOrder_${eventId}`);

                showToast("Đăng ký vé thành công! Đang chuyển hướng...", "success");

                setTimeout(() => {
                    navigate(`/order/result?orderId=${orderId}&success=true&amount=0`);
                }, 1500);
                return;
            } catch (e) {
                showToast("Đã xảy ra lỗi khi đăng ký vé. Vui lòng thử lại!", "error");
                throw e;
            } finally {
                setLoading(false);
            }
        }

        if (paymentMethod !== "momo") return;

        try {
            setLoading(true);
            const response = await API.payment.createLinkMomo(orderId, seatIds, totalAmount);

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

                    <div className="lg:col-span-2 space-y-6">
                        <PaymentForm
                            formData={formData}
                            onChange={handleInputChange}
                        />
                        <PaymentMethod
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                        />
                    </div>

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