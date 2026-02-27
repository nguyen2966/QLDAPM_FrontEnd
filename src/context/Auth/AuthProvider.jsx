import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.js";
import { API } from "../../api/api.js";
import { setAuthHeader } from "../../api/axiosInstance.js";

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await API.auth.refreshToken();
        handleLoginData(data.data);
      } catch {
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleLoginData = ({ user, accessToken }) => {
    setUser(user);
    setAccessToken(accessToken);
    setAuthHeader(accessToken);
  };

  const logout = async () => {
    try {
      await API.auth.logout();
      setUser(null);
      setAccessToken(null);
      setAuthHeader(null);
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, handleLoginData, logout }}>
      {children}
    </AuthContext.Provider>
  );
};