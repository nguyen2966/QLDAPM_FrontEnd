import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from "react-router-dom";
import TicketQRSection from "./components/TicketQRSection.jsx";
import {API} from "../../api/api.js";
import TicketInfoSection from "./components/TicketInfoSection.jsx";
const MyTicketsPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const ticketCode = searchParams.get("ticketCode");
    const [ticketInfo, setTicketInfo] = useState({});
    const [qrToken, setQrToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);

    // Hàm gọi API lấy token mới
    const fetchQRToken = useCallback(async () => {
        if (!ticketCode) return;

        try {
            setLoading(true);
            // TODO: Thay thế URL bằng API thật của bạn
            const response = await API.QR.getQRToken(ticketCode);
            setQrToken(response.data.data.qrToken);

            // Reset thời gian về 30s sau khi lấy token mới thành công
            setTimeLeft(30);
        } catch (error) {
            console.error("Lỗi khi lấy mã QR:", error);
            // Xử lý thông báo lỗi nếu cần
        } finally {
            setLoading(false);
        }
    }, [ticketCode]);

    // 1. Gọi API ngay khi render lần đầu (mount)
    useEffect(() => {
        if (ticketCode) {
            fetchQRToken();
        }
    }, [ticketCode, fetchQRToken]);

    // 2. Logic đếm ngược thời gian
    useEffect(() => {
        if (!qrToken) return; // Không đếm ngược nếu chưa có QR

        if (timeLeft <= 0) {
            fetchQRToken(); // Tự động làm mới khi hết giờ
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId); // Cleanup
    }, [timeLeft, qrToken, fetchQRToken]);

    useEffect( () => {
        const fetchTicketInfo = async () => {
            try {
                const response = await API.ticket.getInfo(ticketCode);
                setTicketInfo(response.data.data);
            } catch (error) {
                console.error("Lỗi lấy ticket info:", error);
            }
        };

        if (ticketCode) {
            fetchTicketInfo();
        }
    },[ticketCode]);

    // Bắt lỗi nếu không có ticketCode trên URL
    if (!ticketCode) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <p className="text-gray-600 mb-4">Không tìm thấy mã vé.</p>
                <button onClick={() => navigate('/user/my-orders')} className="text-blue-600 underline">Quay lại danh sách vé</button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-sm text-gray-500 mb-6 font-medium">
                My Event / <span className="text-gray-900">Chi tiết vé sự kiện</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {/*// ================= CỘT TRÁI: HIỂN THỊ QR & ĐẾM NGƯỢC =================*/}
                <TicketQRSection
                    qrToken={qrToken}
                    timeLeft={timeLeft}
                    loading={loading}
                />

                {/*// ================= CỘT PHẢI: THÔNG TIN VÉ & NÚT LÀM MỚI =================*/}
                <TicketInfoSection
                    ticketCode={ticketCode}
                    ticketInfo={ticketInfo}
                    handleRefresh={fetchQRToken}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default MyTicketsPage;