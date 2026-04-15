import { useState } from "react";

export const LockAccountModal = ({ user, onConfirm, onCancel }) => {
  const [reason, setReason] = useState("");

  if (!user) return null;

  const handleConfirm = () => {
    // Truyền thêm lý do khóa lên component cha
    onConfirm(user.userId, reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm transition-all p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Icon & Heading */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Khóa tài khoản
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Người dùng sẽ không thể đăng nhập sau khi bị khóa.
          </p>
        </div>

        {/* User Info Card */}
        <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-700 font-bold text-sm">
              {user.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
              {user.phoneNumber && (
                <p className="text-xs text-gray-500">{user.phoneNumber}</p>
              )}
            </div>
          </div>
        </div>

        {/* Reason Input */}
        <div className="mb-6">
          <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-2">
            Lý do khóa <span className="text-gray-400 font-normal">(Không bắt buộc)</span>
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ví dụ: Vi phạm điều khoản sử dụng..."
            rows={3}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 resize-none transition-all bg-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 active:bg-red-800 transition-all shadow-sm active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Xác nhận khóa
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default LockAccountModal;