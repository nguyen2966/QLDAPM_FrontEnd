export function UserHero({ editMode, loading, saving, onStartEdit, onUpdate, onCancel }) {
  return (
    <section className="user-hero">
      <div className="user-hero__left">
        <div className="user-hero__kicker">👤 Hồ sơ cá nhân</div>
        <h1 className="user-hero__title">Quản lý thông tin tài khoản</h1>
      </div>
      <div className="user-hero__right">
        {!editMode ? (
          <button className="user-btn user-btn--primary" type="button" onClick={onStartEdit} disabled={loading}>
            ✏️ Chỉnh sửa
          </button>
        ) : (
          <div className="user-hero__actions">
            <button className="user-btn user-btn--primary" type="button" onClick={onUpdate} disabled={saving}>
              {saving ? "Đang cập nhật..." : "✅ Cập nhật"}
            </button>
            <button className="user-btn user-btn--ghost" type="button" onClick={onCancel} disabled={saving}>
              ⛔ Hủy
            </button>
          </div>
        )}
      </div>
    </section>
  );
}