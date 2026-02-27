import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/Auth/AuthProvider.jsx";
import { initFacebookSDK } from "./lib/facebook.js";
import { GoogleOAuthProvider } from "@react-oauth/google";

  
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

initFacebookSDK().then(() => {
  console.log("Facebook SDK ready");
  createRoot(document.getElementById("root")).render(
    
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </GoogleOAuthProvider>

  );
});