export function UserNotice({ notice }) {
  if (!notice) return null;
  return (
    <div className={`user-notice user-notice--${notice.type}`} role="status">
      {notice.message}
    </div>
  );
}