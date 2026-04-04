import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/Auth/AuthProvider.jsx";
import { initFacebookSDK } from "./lib/facebook.js";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { DataProvider } from "./context/Data/DataProvider.jsx";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

initFacebookSDK().then(() => {
  console.log("Facebook SDK ready");
  createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <DataProvider>
            <ToastContainer 
              position="top-right"
              autoClose={2000}
              hideProgressBar={false}
              newestOnTop={true} 
              closeOnClick
              pauseOnHover
              theme="light"/>
            <App />
          </DataProvider>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
});