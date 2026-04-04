export function UserFormCard({
  loading, editMode, saving,
  form, errors, onChange,
  licenseFile, onPickLicense,
  role,
}) {
  const isOrganizer = (form.role || role) === "ORGANIZER";

  return (
    <section className="user-card user-card--form">
      {loading ? (
        <div className="user-skeleton">
          <div className="user-skeleton__bar" />
          <div className="user-skeleton__bar" />
          <div className="user-skeleton__bar" />
        </div>
      ) : (
        <form className="user-form" onSubmit={(e) => e.preventDefault()}>
          <div className="user-row">
            <div className="user-field">
              <label className="user-label">Thư điện tử (không thể chỉnh sửa)</label>
              <input className="user-input" value={form.email} disabled />
            </div>
            <div className="user-field">
              <label className="user-label">Vai trò</label>
              <input className="user-input" value={form.roleLabel} disabled />
            </div>
          </div>

          <div className="user-row">
            <div className={`user-field ${errors.name ? "user-field--error" : ""}`}>
              <label className="user-label">Tên</label>
              <input
                className="user-input"
                value={form.name}
                onChange={onChange("name")}
                disabled={!editMode || saving}
                placeholder="Nhập tên"
              />
              {errors.name && <div className="user-error">{errors.name}</div>}
            </div>
            <div className={`user-field ${errors.phoneNumber ? "user-field--error" : ""}`}>
              <label className="user-label">Số điện thoại</label>
              <input
                className="user-input"
                value={form.phoneNumber}
                onChange={onChange("phoneNumber")}
                disabled={!editMode || saving}
                placeholder="Ví dụ: 0901234567"
                inputMode="numeric"
              />
              {errors.phoneNumber && <div className="user-error">{errors.phoneNumber}</div>}
            </div>
          </div>

          {isOrganizer && (
            <>
              <div className="user-sectionTitle">Thông tin nhà tổ chức</div>
              <div className="user-row">
                <div className="user-field">
                  <label className="user-label">Mã số thuế</label>
                  <input
                    className="user-input"
                    value={form.taxCode}
                    onChange={onChange("taxCode")}
                    disabled={!editMode || saving}
                    placeholder="Ví dụ: 0123456789"
                  />
                </div>
                <div className={`user-field ${errors.websiteUrl ? "user-field--error" : ""}`}>
                  <label className="user-label">Trang web</label>
                  <input
                    className="user-input"
                    value={form.websiteUrl}
                    onChange={onChange("websiteUrl")}
                    disabled={!editMode || saving}
                    placeholder="https://..."
                  />
                  {errors.websiteUrl && <div className="user-error">{errors.websiteUrl}</div>}
                </div>
              </div>
              <div className="user-row">
                <div className="user-field">
                  <label className="user-label">Giấy phép kinh doanh</label>
                  {!editMode ? (
                    <div className="user-static">
                      {form.businessLicenseUrl ? (
                        <a className="user-link" href={form.businessLicenseUrl} target="_blank" rel="noreferrer">
                          Xem giấy phép
                        </a>
                      ) : (
                        <span className="user-muted">—</span>
                      )}
                    </div>
                  ) : (
                    <>
                      <input
                        className="user-input"
                        value={form.businessLicenseUrl}
                        onChange={onChange("businessLicenseUrl")}
                        disabled={saving}
                        placeholder="Nhập đường dẫn giấy phép (hoặc chọn tệp bên dưới)"
                      />
                      <label className="user-fileBtn user-fileBtn--inline">
                        <input type="file" accept=".pdf,image/*" onChange={onPickLicense} />
                        Chọn tệp giấy phép
                      </label>
                      <div className="user-help">
                        {licenseFile ? (
                          <>Đã chọn: <b>{licenseFile.name}</b></>
                        ) : (
                          <>Bạn có thể nhập đường dẫn hoặc chọn tệp (minh hoạ).</>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </form>
      )}
    </section>
  );
}