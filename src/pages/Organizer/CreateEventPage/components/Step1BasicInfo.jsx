import { useData } from '../../hooks/useData';

export const Step1BasicInfo = () => {
  // Ở đây chỉ cần venues và loading của venues
  const { venues, loading } = useData();

  return (
    <form>
      {/* ... các input khác ... */}
      
      <label>Chọn địa điểm:</label>
      <select disabled={loading.venues}>
        {loading.venues ? (
          <option>Đang tải địa điểm...</option>
        ) : (
          venues.map((v) => (
            <option key={v.venueId} value={v.venueId}>
              {v.venueName}
            </option>
          ))
        )}
      </select>
    </form>
  );
};