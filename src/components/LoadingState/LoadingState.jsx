export function LoadingState({ displayText = "Đang tải" }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
    }}>
      <div style={{
        textAlign: "center",
        fontSize: "18px",
        color: "#666",
      }}>
        <div style={{
          marginBottom: "20px",
          fontSize: "48px",
        }}>⏳</div>
        {displayText}
      </div>
    </div>
  );
}
