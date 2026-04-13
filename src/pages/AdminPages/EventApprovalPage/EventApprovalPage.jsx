import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../../api/api";

/* ─── Spinner ────────────────────────────────────────────────────────────── */
const Spinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="w-10 h-10 rounded-full border-4 border-red-100 border-t-red-600 animate-spin" />
  </div>
);

/* ─── Empty state ────────────────────────────────────────────────────────── */
const EmptyState = () => (
  <tr>
    <td colSpan={6}>
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg
          className="w-16 h-16 mb-4 text-red-100"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
        <p className="text-sm font-semibold text-gray-500">Không có sự kiện nào đang chờ duyệt</p>
        <p className="text-xs text-gray-400 mt-1">Các sự kiện mới sẽ hiển thị ở đây</p>
      </div>
    </td>
  </tr>
);

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export  const EventApprovalPage = () => {
  const navigate = useNavigate();
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchName, setSearch]   = useState("");
  const [dateFilter, setDate]     = useState("");
  const [sortOrder, setSort]      = useState("newest");

  /* Fetch pending events */
  useEffect(() => {
    (async () => {
      try {
        const res = await API.admin.getPendingEvent();
        setEvents(res.data?.data ?? res.data ?? []);
      } catch (err) {
        toast.error(
          err?.response?.data?.message ?? "Không thể tải danh sách sự kiện chờ duyệt.",
          { duration: 4000 }
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Client-side filter + sort */
  const filtered = useMemo(() => {
    let list = [...events];
    if (searchName.trim()) {
      const q = searchName.toLowerCase();
      list = list.filter(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          e.organizerName?.toLowerCase().includes(q)
      );
    }
    if (dateFilter) {
      list = list.filter((e) => {
        const d = e.dateToStart ? new Date(e.dateToStart).toISOString().slice(0, 10) : "";
        return d === dateFilter;
      });
    }
    list.sort((a, b) => {
      const da = new Date(a.dateToStart ?? 0).getTime();
      const db = new Date(b.dateToStart ?? 0).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });
    return list;
  }, [events, searchName, dateFilter, sortOrder]);

  const fmt = (raw) => {
    if (!raw) return "—";
    const d = new Date(raw);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* <AdminNavbar /> */}

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link to="/admin" className="text-gray-400 hover:text-red-700 transition-colors">
            Quản trị viên
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-red-700 font-medium">Duyệt sự kiện</span>
        </nav>

        {/* Heading */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Duyệt sự kiện</h1>
            <p className="text-sm text-gray-500 mt-1">
              Xem xét và phê duyệt các sự kiện đang chờ xử lý
            </p>
          </div>
          {!loading && (
            <span className="text-sm text-gray-500">
              <span className="font-bold text-red-700">{filtered.length}</span> sự kiện chờ duyệt
            </span>
          )}
        </div>

        {/* ── Search / Filter bar ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Text search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                placeholder="Tìm tên sự kiện hoặc nhà tổ chức..."
                value={searchName}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                           placeholder-gray-400 transition"
              />
            </div>

            {/* Date */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                         text-gray-600 transition"
            />

            {/* Sort */}
            <select
              value={sortOrder}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                         text-gray-600 bg-white transition"
            >
              <option value="newest">Thời gian sớm nhất</option>
              <option value="oldest">Thời gian muộn nhất</option>
            </select>

            {/* Search btn */}
            <button
              type="button"
              className="px-6 py-2.5 bg-red-700 hover:bg-red-800 active:bg-red-900
                         text-white text-sm font-semibold rounded-lg transition-colors
                         shadow-sm active:scale-95 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table top bar */}
          <div className="px-6 py-3 bg-red-700 flex items-center justify-between">
            <span className="text-white text-sm font-semibold tracking-wide flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Danh sách sự kiện chờ duyệt
            </span>
            {!loading && (
              <span className="text-red-200 text-xs font-medium">
                Hiển thị {filtered.length} / {events.length}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-red-50">
                  {["STT", "Tên sự kiện", "Nhà tổ chức", "Thời gian tổ chức", "Địa điểm", "Thao tác"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6}>
                      <Spinner />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <EmptyState />
                ) : (
                  filtered.map((event, idx) => (
                    <tr
                      key={event._id ?? event.eventId ?? idx}
                      className="hover:bg-red-50/60 transition-colors group"
                    >
                      {/* # */}
                      <td className="px-6 py-4 text-sm text-gray-400 font-medium w-12">
                        {idx + 1}
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-red-700 transition-colors">
                          {event.eventName ?? "—"}
                        </p>
                        {event.category && (
                          <p className="text-xs text-gray-400 mt-0.5">{event.category}</p>
                        )}
                      </td>

                      {/* Organizer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-700 font-bold text-xs">
                            {event.organizerName?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <span className="text-sm text-gray-700">{event.organizerName ?? "—"}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {fmt(event.dateToStart)}
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px]">
                        <span className="line-clamp-2">{event.venueName ?? event.venue ?? "—"}</span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            navigate(`/admin/event/${event.eventId}`)
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold
                                     text-red-700 border border-red-300 rounded-lg
                                     hover:bg-red-700 hover:text-white hover:border-red-700
                                     transition-all active:scale-95 shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* <AdminFooter /> */}
    </div>
  );
}