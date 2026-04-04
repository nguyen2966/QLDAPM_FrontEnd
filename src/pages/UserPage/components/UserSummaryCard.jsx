export function UserSummaryCard({
  avatarPreview, displayName, roleLabel,
  profile, userId,
  editMode, avatarFile, onPickAvatar,
  getInitials,
}) {

  const organizer = profile?.organizer;
  const isApproved = organizer?.isApproved;

  return (
    <aside className="user-card user-card--summary">
      <div className="user-avatarWrap">
        <div className="user-avatar" aria-label="Ảnh đại diện">
          {avatarPreview ? (
            <img className="user-avatar__img" src={avatarPreview} alt="Xem trước ảnh đại diện" />
          ) : (
            <span className="user-avatar__txt">{getInitials(displayName)}</span>
          )}
        </div>
        <div className="user-summary">
          <div className="user-summary__name">{displayName}</div>
          <div className="user-summary__meta">
            <span className="user-pill">{roleLabel}</span>
            {profile?.isProfileComplete ? (
              <span className="user-pill user-pill--ok">Đã hoàn thiện</span>
            ) : (
              <span className="user-pill">Chưa đủ</span>
            )}
          </div>
        </div>
      </div>

      <div className="user-divider" />

      <div className="user-miniInfo">
        <div className="user-miniRow">
          <span className="user-miniKey">UserId</span>
          <span className="user-miniVal">{profile?.userId ?? userId ?? "-"}</span>
        </div>
        <div className="user-miniRow">
          <span className="user-miniKey">Thời điểm tạo tài khoản</span>
          <span className="user-miniVal">
            {profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : "—"}
          </span>
        </div>

        <div className="user-miniRow">
          <span className="user-miniKey">Trạng thái</span>
          <span className="user-miniVal">
            {isApproved ? (<p>Đã duyệt</p>) : (<p>Chờ duyệt</p>)}
          </span>
        </div>
      </div>

      {editMode && (
        <>
          <div className="user-divider" />
          <div className="user-uploadBlock">
            <div className="user-uploadTitle">Ảnh đại diện</div>
            <label className="user-fileBtn">
              <input type="file" accept="image/*" onChange={onPickAvatar} />
              Chọn ảnh
            </label>
            {avatarFile ? (
              <div className="user-fileHint">Đã chọn: <b>{avatarFile.name}</b></div>
            ) : (
              <div className="user-fileHint">Chưa chọn ảnh</div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}