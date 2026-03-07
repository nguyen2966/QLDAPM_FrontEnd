import { useState, useEffect, useCallback, useMemo } from "react";
import { API } from "../../api/api.js";
import { DataContext } from "./DataContext.js";
import { useAuth } from "../../hooks/useAuth.js";

function laPhanHoiThanhCong(response) {
  return response?.data?.status === "success";
}

function rutGonDanhSachDiaDiem(events = []) {
  const venueMap = new Map();

  events.forEach((event) => {
    const venue = event?.venue;
    if (!venue) return;

    const key = venue.venueId || venue.venueName;
    if (!key) return;

    if (!venueMap.has(key)) {
      venueMap.set(key, {
        venueId: venue.venueId ?? key,
        venueName: venue.venueName || `Địa điểm ${key}`,
        address: venue.address || "",
        capacity: venue.capacity || null,
      });
    }
  });

  return Array.from(venueMap.values());
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

      if (!laPhanHoiThanhCong(response)) {
        setEvents([]);
        setVenues([]);
        setError("Không thể tải danh sách sự kiện lúc này.");
        return;
      }

      const danhSachCoBan = response?.data?.data || [];

      const danhSachChiTiet = await Promise.all(
        danhSachCoBan.map(async (event) => {
          try {
            const detailResponse = await API.event.getById(event.eventId);

            if (laPhanHoiThanhCong(detailResponse)) {
              return detailResponse.data.data;
            }

            return event;
          } catch (detailError) {
            console.error(`Lỗi khi lấy chi tiết event ${event.eventId}:`, detailError);
            return event;
          }
        })
      );

      setEvents(danhSachChiTiet);
      setVenues(rutGonDanhSachDiaDiem(danhSachChiTiet));
    } catch (err) {
      console.error("Lỗi khi tải danh sách sự kiện:", err);
      setEvents([]);
      setVenues([]);
      setError("Không thể tải danh sách sự kiện lúc này.");
    } finally {
      setLoading({ events: false, venues: false });
    }
  }, [accessToken]);

  const refreshVenues = useCallback(() => {
    setVenues(rutGonDanhSachDiaDiem(events));
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