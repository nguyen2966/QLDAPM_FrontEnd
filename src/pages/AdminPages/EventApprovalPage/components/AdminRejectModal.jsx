import { useState } from "react";
import { toast } from "react-toastify";
import { API } from "../../../../api/api";

/**
 * AdminRejectModal
 *
 * Props:
 *  - isOpen        : boolean
 *  - onClose       : () => void
 *  - onSuccess     : () => void   (called after successful rejection)
 *  - eventId       : string
 *  - eventName     : string
 *  - organizerName : string
 */
export const AdminRejectModal = ({
  isOpen,
  onClose,
  onSuccess,
  eventId,
  eventName,
  organizerName,
}) => {
  const [reason, setReason]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [touched, setTouched]   = useState(false);

  const hasError = touched && reason.trim() === "";

  const handleClose = () => {
    setReason("");
    setTouched(false);
    onClose();
  };

  const handleConfirm = async () => {
    setTouched(true);
    if (!reason.trim()) {
        toast.error("Cần có lý do để từ chối sự kiện.");
        return;
    }

    setLoading(true);
    try {
      await API.admin.disaprroveEvent(eventId, reason.trim());
      toast.success("Đã từ chối sự kiện thành công.", { duration: 3000 });
      handleClose();
      onSuccess?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ?? "Từ chối sự kiện thất bại. Vui lòng thử lại.",
        { duration: 4000 }
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    /* ── Backdrop ── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      {/* dim layer */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* ── Modal card ── */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">

        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-700 via-red-500 to-red-700" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight uppercase">
              Từ chối sự kiện
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Event summary card */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{eventName ?? "—"}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{organizerName ?? "—"}</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                             bg-amber-100 text-amber-700 border border-amber-200 flex-shrink-0 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
              Chờ duyệt
            </span>
          </div>

          {/* Reason textarea */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Lý do từ chối <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Vui lòng nhập lý do từ chối..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
              disabled={loading}
              className={`w-full px-4 py-3 text-sm border rounded-xl resize-none
                          focus:outline-none focus:ring-2 focus:border-transparent
                          placeholder-gray-400 transition
                          disabled:bg-gray-50 disabled:cursor-not-allowed
                          ${hasError
                            ? "border-red-400 focus:ring-red-400 bg-red-50"
                            : "border-gray-200 focus:ring-red-500"
                          }`}
            />
            {hasError && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Vui lòng nhập lý do từ chối.
              </p>
            )}
            <p className="mt-1 text-right text-xs text-gray-400">{reason.length} ký tự</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200
                       rounded-xl hover:bg-gray-50 hover:border-gray-300
                       transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-bold text-white bg-red-700
                       hover:bg-red-800 active:bg-red-900
                       rounded-xl transition-all active:scale-95
                       disabled:opacity-60 disabled:cursor-not-allowed
                       flex items-center gap-2 shadow-sm shadow-red-200"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Xác nhận từ chối
              </>
            )}
          </button>
        </div>
      </div>

      {/* CSS animation */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .animate-fade-in-up { animation: fade-in-up 0.22s ease-out both; }
      `}</style>
    </div>
  );
}