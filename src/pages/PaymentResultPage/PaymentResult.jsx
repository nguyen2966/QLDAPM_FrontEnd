import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SuccessPayment from "./components/successPayment.jsx";
import FailPayment from "./components/failPayment.jsx";

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Đọc các tham số từ thanh URL
    const orderId = searchParams.get('orderId') || 'Không xác định';
    const resultCode = searchParams.get('resultCode');
    const message = searchParams.get('message') || 'Giao dịch không thành công';
    const amount = searchParams.get('amount') || '0';

    // MoMo quy định resultCode = "0" là thành công.
    const isSuccess = resultCode === '0' || searchParams.get('success') === 'true';

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border border-gray-100">

                {isSuccess ? (
                    /* ================= GIAO DIỆN THÀNH CÔNG ================= */
                    <SuccessPayment orderId={orderId} amount={amount} navigate={navigate} />
                ) : (
                    /* ================= GIAO DIỆN THẤT BẠI ================= */
                    <FailPayment orderId={orderId} resultCode={resultCode} message={message} navigate={navigate} />
                )}

            </div>
        </div>
    );
};

export default PaymentResult;