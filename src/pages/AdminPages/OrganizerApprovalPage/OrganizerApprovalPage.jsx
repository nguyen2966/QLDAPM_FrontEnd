import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./OrganizerApproval.css";
import { API } from "../../../api/api";
import { Link } from "react-router-dom";

/* ── Skeleton rows khi loading ── */
function SkeletonRows({ count = 4 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="oa-skeleton-row">
      {[60, 90, 70, 55, 40].map((w, j) => (
        <td key={j}>
          <div className="oa-skeleton" style={{ width: `${w}%` }} />
        </td>
      ))}
    </tr>
  ));
}

/* ── Format ngày ── */
function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export const OrganizerApprovalPage = () => {
  const navigate = useNavigate();

  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // asc = sớm nhất

  /* ── Fetch danh sách ── */
  const fetchOrganizers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.admin.getDisapprovedOrganizers();
      if (res.data.status === "success") {
        setOrganizers(res.data.data || []);
      } else {
        throw new Error(data.message || "Không thể tải dữ liệu.");
      }
    } catch (err) {
      toast.error("Có lỗi khi lấy dữ liệu")
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizers();
  }, [fetchOrganizers]);

  /* ── Lọc + sắp xếp ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = organizers.filter((o) => {
      if (!q) return true;
      const haystack = [o.name, o.email, o.taxCode, String(o.userId)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    list = [...list].sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return sortOrder === "asc" ? da - db : db - da;
    });

    return list;
  }, [organizers, search, sortOrder]);

  /* ── Đi tới trang chi tiết ── */
  const goToDetail = (organizer) => {
    navigate(`/admin/organizer-approve/${organizer.userId}`);
  };

  if (error) {
    return (
      <div className="oa-page">
        <div className="oa-empty">
          <div className="oa-empty__icon"><svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2L2 20H22L12 2Z" fill="#FACC15" stroke="#000" stroke-width="2"/>
  <line x1="12" y1="8" x2="12" y2="13" stroke="#000" stroke-width="2"/>
  <circle cx="12" cy="17" r="1.5" fill="#000"/>
</svg></div>
          <p className="oa-empty__text">{error}</p>
          <button
            className="home-btn home-btn--primary"
            style={{ margin: "14px auto 0" }}
            onClick={fetchOrganizers}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="oa-page">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8">
        <Link to="/admin" className="text-gray-400 hover:text-red-700 transition-colors">
          Quản trị viên
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-red-700 font-medium">Duyệt nhà tổ chức</span>
      </nav>

      {/* Toolbar */}
      <div className="oa-list__toolbar">
        <div className="oa-list__search">
          <span className="oa-list__search-icon" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            className="oa-list__search-input"
            type="text"
            placeholder="Tìm tên tài khoản, email, mã số thuế…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Tìm kiếm nhà tổ chức"
          />
        </div>

        <div className="oa-list__sort">
          <span className="oa-list__sort-label">Sắp xếp:</span>
          <select
            className="oa-list__sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            aria-label="Sắp xếp theo"
          >
            <option value="asc">Thời gian sớm nhất</option>
            <option value="desc">Thời gian mới nhất</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="oa-table-wrap">
        <table
          className="oa-table"
          aria-label="Danh sách nhà tổ chức chờ duyệt"
        >
          <thead>
            <tr>
              <th>Tên nhà tổ chức</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Ngày gửi hồ sơ</th>
              <th>Tình trạng License</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <SkeletonRows count={4} />
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="oa-empty">
                    <div className="oa-empty__icon"></div>
                    <p className="oa-empty__text">
                      {search
                        ? "Không tìm thấy nhà tổ chức nào khớp."
                        : "Không có nhà tổ chức nào chờ phê duyệt."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((org) => (
                <tr key={org.userId}>
                  <td className="oa-table__name">
                    {org.name || `Nhà tổ chức #${org.userId}`}
                  </td>
                  <td>{org.email || "—"}</td>
                  <td>{org.phoneNumber || "—"}</td>
                  <td className="oa-table__date">
                    {formatDate(org.createdAt)}
                  </td>
                  <td>{org.businessLicenseUrl ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 13L9 17L19 7" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 6L18 18M18 6L6 18" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
</svg>}</td>
                  <td className="oa-table__action">
                    <button
                      className="oa-btn-detail"
                      type="button"
                      onClick={() => goToDetail(org)}
                      aria-label={`Xem chi tiết ${org.name || org.userId}`}
                    >
                      Xem chi tiết →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Count */}
      {!loading && filtered.length > 0 && (
        <p
          style={{
            marginTop: 14,
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(0,0,0,0.45)",
            textAlign: "right",
          }}
        >
          {filtered.length} nhà tổ chức đang chờ được phê duyệt
        </p>
      )}
    </div>
  );
};
