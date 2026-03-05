import { useState, useEffect, useCallback, useMemo } from 'react';
import { API } from '../../api/api.js';
import { DataContext } from './DataContext.js';


export const DataProvider = ({ children }) => {
 
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]); // Đón đầu luôn cho chức năng chọn địa điểm
  
  // Quản lý trạng thái loading dưới dạng object để biết chính xác cái nào đang load
  const [loading, setLoading] = useState({
    events: true,
    venues: true,
  });
  
  const [error, setError] = useState(null);

  
  // Dùng useCallback để hàm này không bị tạo lại mỗi lần component re-render
  const fetchEvents = useCallback(async () => {
    setLoading(prev => ({ ...prev, events: true }));
    try {
      const response = await API.event.getAll(); // Mọi api trả về đều chuẩn hóa có response.data.data
      if (response.data?.status === "success") {
        setEvents(response.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách sự kiện:", err);
      setError("Không thể tải danh sách sự kiện lúc này.");
    } finally {
      setLoading(prev => ({ ...prev, events: false }));
    }
  }, []);

  const fetchVenues = useCallback(async () => {
    setLoading(prev => ({ ...prev, venues: true }));
    try {
      // Gọi API mock getAllVenues mà chúng ta đã nhắc đến
      const response = await API.venue.getAllVenues(); 
      if (response.data?.status === "success") {
        setVenues(response.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách địa điểm:", err);
      // Không cần set Error toàn cục nếu venue chỉ là data phụ
    } finally {
      setLoading(prev => ({ ...prev, venues: false }));
    }
  }, []);



  useEffect(() => {
    // Có thể dùng Promise.all nếu muốn tải song song và đợi cả hai cùng xong
    fetchEvents();
    fetchVenues();
  }, [fetchEvents, fetchVenues]);

  
  // BẮT BUỘC DÙNG useMemo: Nếu không có useMemo, mỗi khi có state thay đổi, 
  // toàn bộ các component con dùng useData() đều bị ép render lại.
  const contextValue = useMemo(() => ({
    // Data
    events,
    venues,
    
    // Trạng thái
    loading,
    error,
    
    // Các hàm trigger để component con có thể chủ động gọi lại API khi cần
    // (VD: sau khi user tạo event mới thành công, gọi refreshEvents để list tự cập nhật)
    refreshEvents: fetchEvents,
    refreshVenues: fetchVenues,
  }), [events, venues, loading, error, fetchEvents, fetchVenues]);

  // 3. Render Provider
  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

