import "./UserPage.css";

import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "../../hooks/useAuth.js";
import { API } from "../../api/api.js";
import { UserHero } from "./components/UserHero";
import { UserNotice } from "./components/UserNotice";
import { UserSummaryCard } from "./components/UserSummaryCard";
import { UserFormCard } from "./components/UserFormCard";

function getInitials(text) {
  const s = String(text || "").trim();
  if (!s) return "U";
  const parts = s.split(/\s+/).slice(0, 2);
  const letters = parts.map((p) => p[0]?.toUpperCase()).filter(Boolean);
  return letters.join("") || s[0].toUpperCase();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function normalizeToForm(profile) {
  const organizer = profile?.organizer || null;
  return {
    name: profile?.name || "",
    email: profile?.email || "",
    phoneNumber: profile?.phoneNumber || "",
    role: profile?.role || "",
    taxCode: organizer?.taxCode || "",
    websiteUrl: organizer?.websiteUrl || "",
    businessLicenseUrl: organizer?.businessLicenseUrl || "",
  };
}

function validateForm(form) {
  const errors = {};
  const name = (form.name || "").trim();
  const phone = (form.phoneNumber || "").trim();

  if (!name) errors.name = "Vui lòng nhập tên.";
  else if (name.length < 2) errors.name = "Tên quá ngắn (tối thiểu 2 ký tự).";

  if (!phone) errors.phoneNumber = "Vui lòng nhập số điện thoại.";
  else if (!/^\d{9,11}$/.test(phone)) errors.phoneNumber = "Số điện thoại chỉ gồm 9–11 chữ số.";

  if (form.websiteUrl && !/^https?:\/\/.+/i.test(form.websiteUrl.trim())) {
    errors.websiteUrl = "Trang web nên bắt đầu bằng http:// hoặc https://";
  }

  return errors;
}

export function UserPage() {
  const { user } = useAuth();

  const userId = useMemo(() => user?.userId ?? user?.id, [user]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(() => normalizeToForm(user));
  const [editMode, setEditMode] = useState(false);

  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    () => user?.avatarUrl || user?.picture || ""
  );
  const avatarUrlRef = useRef("");

  const [licenseFile, setLicenseFile] = useState(null);

  const fetchProfile = async () => {
    if (!userId) return;
    setLoading(true);
    setNotice(null);

    try {
      const res = await API.user.getUserById(userId);
      const data = res?.data?.data;
      setProfile(data);
      setForm(normalizeToForm(data));
      setEditMode(false);
      setErrors({});
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể tải hồ sơ. Vui lòng thử lại.";
      setNotice({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    return () => {
      if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(timer);
  }, [notice]);


  const startEdit = () => {
    setNotice(null);
    setErrors({});
    setEditMode(true);
  };

  const cancelEdit = () => {
    setNotice(null);
    setErrors({});
    setEditMode(false);

    const base = normalizeToForm(profile || user);
    setForm(base);

    setAvatarFile(null);
    setLicenseFile(null);
    if (avatarUrlRef.current) {
      URL.revokeObjectURL(avatarUrlRef.current);
      avatarUrlRef.current = "";
    }
    setAvatarPreview(user?.avatarUrl || user?.picture || "");
  };

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const onPickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    const url = URL.createObjectURL(file);
    avatarUrlRef.current = url;

    setAvatarFile(file);
    setAvatarPreview(url);
  };

  const onPickLicense = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLicenseFile(file);
  };

  // const onUpdate = async () => {
  //   setNotice(null);

  //   const nextErrors = validateForm(form);
  //   if (Object.keys(nextErrors).length > 0) {
  //     setErrors(nextErrors);
  //     setNotice({ type: "error", message: "Vui lòng kiểm tra lại các trường đang bị lỗi." });
  //     return;
  //   }

  //   let newAvatarDataUrl = null;
  //   if (avatarFile) {
  //     newAvatarDataUrl = await fileToDataUrl(avatarFile);
  //   }

  //   setSaving(true);
  //   try {
  //     const payload = {
  //       name: form.name.trim(),
  //       phoneNumber: form.phoneNumber.trim(),
  //       avatarImg: avatarFile || undefined,
  //       taxCode: form.taxCode?.trim() || undefined,
  //       websiteUrl: form.websiteUrl?.trim() || undefined,
  //       licenseFile: licenseFile
  //     };

  //     const res = await API.user.updateUser(userId, payload);
  //     const updated = res?.data?.data;

  //     setProfile(updated);
  //     setForm(normalizeToForm(updated));
  //     setEditMode(false);
  //     setErrors({});
  //     setNotice({ type: "success", message: "✅ Cập nhật hồ sơ thành công." });
  //   } catch (err) {
  //     const msg = err?.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.";
  //     setNotice({ type: "error", message: msg });
  //   } finally {
  //     setSaving(false);
  //   }

  //   if (newAvatarDataUrl) {
  //     updateAvatar(newAvatarDataUrl);
  //     setAvatarPreview(newAvatarDataUrl);
  //     setAvatarFile(null);
  //   }
  // };

  const onUpdate = async () => {
    setNotice(null);

    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setNotice({ type: "error", message: "Vui lòng kiểm tra lại các trường đang bị lỗi." });
      return;
    }

    // Build FormData so files are sent as multipart/form-data
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("phoneNumber", form.phoneNumber.trim());

    if (form.taxCode?.trim()) fd.append("taxCode", form.taxCode.trim());
    if (form.websiteUrl?.trim()) fd.append("websiteUrl", form.websiteUrl.trim());
    if (avatarFile) fd.append("avatarImg", avatarFile);
    if (licenseFile) fd.append("licenseFile", licenseFile);

    console.log(form);
    console.log(avatarFile);
    console.log(licenseFile);

    setSaving(true);
    try {
      const res = await API.user.updateUser(userId, fd);   // not a plain object
      const updated = res?.data?.data;

      setProfile(updated);
      setForm(normalizeToForm(updated));
      setEditMode(false);
      setErrors({});
      setNotice({ type: "success", message: "✅ Cập nhật hồ sơ thành công." });

      // Update avatar preview after a successful save
      if (avatarFile) {
        const dataUrl = await fileToDataUrl(avatarFile);
        setAvatarPreview(dataUrl);
        setAvatarFile(null);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.";
      setNotice({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  const displayName = form.name || user?.name || user?.email || "Người dùng";
  const roleLabel =
    (form.role || user?.role) === "ORGANIZER"
      ? "Nhà tổ chức"
      : (form.role || user?.role) === "CUSTOMER"
        ? "Khách hàng"
        : "Tài khoản";

  return (
    <div className="user-page">

      <main className="user-main">
        <UserHero
          editMode={editMode}
          loading={loading}
          saving={saving}
          onStartEdit={startEdit}
          onUpdate={onUpdate}
          onCancel={cancelEdit}
        />

        <UserNotice notice={notice} />

        <section className="user-grid">
          <UserSummaryCard
            avatarPreview={avatarPreview}
            displayName={displayName}
            roleLabel={roleLabel}
            profile={profile}
            userId={userId}
            editMode={editMode}
            avatarFile={avatarFile}
            onPickAvatar={onPickAvatar}
            getInitials={getInitials}
          />

          <UserFormCard
            loading={loading}
            editMode={editMode}
            saving={saving}
            form={{ ...form, roleLabel }}
            errors={errors}
            onChange={onChange}
            licenseFile={licenseFile}
            onPickLicense={onPickLicense}
            role={user?.role}
          />
        </section>
      </main>
    </div>
  );
}