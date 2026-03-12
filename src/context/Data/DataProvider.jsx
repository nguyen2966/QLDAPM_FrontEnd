import { useState, useEffect, useCallback, useMemo } from "react";
import { API } from "../../api/api.js";
import { DataContext } from "./DataContext.js";
import { useAuth } from "../../hooks/useAuth.js";

function laPhanHoiThanhCong(response) {
  return response?.data?.status === "success";
}

export const DataProvider = ({ children }) => {
  const { accessToken, loading: authLoading } = useAuth();

  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState({
    events: true,
    venues: true,
  });
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!accessToken) {
      setEvents([]);
      setVenues([]);
      setLoading({ events: false, venues: false });
      return;
    }

    setLoading({ events: true, venues: true });
    setError(null);

    try {
      const response = await API.event.getAll();
      const DanhSachVenue = await API.event.getVenues();

      if (!laPhanHoiThanhCong(response)) {
        setEvents([]);
        setVenues([]);
        setError("Không thể tải danh sách sự kiện lúc này.");
        return;
      }

      const danhSachCoBan = response?.data?.data || [];
    
      setEvents(danhSachCoBan);
      setVenues(DanhSachVenue.data.data);
      //console.log(danhSachCoBan);
      //console.log(DanhSachVenue.data.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách sự kiện:", err);
      setEvents([]);
      setVenues([]);
      setError("Không thể tải danh sách sự kiện lúc này.");
    } finally {
      setLoading({ events: false, venues: false });
    }
  }, [accessToken]);

  const refreshVenues = useCallback(async () => {
    const DanhSachVenue = await API.event.getVenues();
    setVenues(DanhSachVenue.data.data);
  }, [events]);

  useEffect(() => {
    if (authLoading) return;

    if (!accessToken) {
      setEvents([]);
      setVenues([]);
      setLoading({ events: false, venues: false });
      return;
    }

    fetchEvents();
  }, [authLoading, accessToken, fetchEvents]);

  const contextValue = useMemo(
    () => ({
      events,
      venues,
      loading,
      error,
      refreshEvents: fetchEvents,
      refreshVenues,
    }),
    [events, venues, loading, error, fetchEvents, refreshVenues]
  );

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};