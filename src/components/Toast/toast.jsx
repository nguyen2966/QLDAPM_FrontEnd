import { useEffect } from 'react';

// Một component Toast đơn giản sử dụng Tailwind
export const CustomToast = ({ message, type, onClose }) => {

    const toastStyles = {
        success: "bg-green-100 text-green-800 border-green-500", // Xanh lá
        error: "bg-red-100 text-red-800 border-red-500",         // Đỏ
        warning: "bg-yellow-100 text-yellow-800 border-yellow-500", // Vàng
        info: "bg-blue-100 text-blue-800 border-blue-500",       // Xanh dương
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Tự động đóng sau 3s
        return () => clearTimeout(timer);
    }, [onClose]);

    // Lấy style dựa vào biến type truyền vào, mặc định là info
    const currentStyle = toastStyles[type] || toastStyles.info;

    return (
        <div className={`fixed top-5 z-[9999] right-5 px-4 py-3 border-l-4 rounded shadow-md transition-all duration-300 ${currentStyle}`}>
            <p className="font-medium">{message}</p>
        </div>
    );
};