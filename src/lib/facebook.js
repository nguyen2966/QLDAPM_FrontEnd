export const initFacebookSDK = () => {
  return new Promise((resolve, reject) => {
    // Already fully initialized
    if (window._fbInitialized) {
      console.log("FB already initialized ✓");
      resolve();
      return;
    }

    const doInit = () => {
      window.FB.init({
        appId: import.meta.env.VITE_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
      window._fbInitialized = true;
      console.log("FB.init() called manually ✓");
      resolve();
    };

    // If FB object already exists, init it directly — no need to load script
    if (window.FB) {
      console.log("window.FB exists, calling init directly");
      doInit();
      return;
    }

    // Script already injected but FB not ready yet — wait for it
    if (document.getElementById("facebook-jssdk")) {
      console.log("Script exists but FB not ready, polling...");
      const interval = setInterval(() => {
        if (window.FB) {
          clearInterval(interval);
          doInit();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error("Facebook SDK timeout"));
      }, 10000);
      return;
    }

    // Inject script fresh, call init in onload
    console.log("Injecting FB script...");
    const js = document.createElement("script");
    js.id = "facebook-jssdk";
    js.src = "https://connect.facebook.net/vi_VN/sdk.js";
    js.async = true;
    js.defer = true;
    js.onload = () => {
      console.log("FB script loaded ");
      doInit();
    };
    js.onerror = () => reject(new Error("Failed to load Facebook SDK"));
    document.head.appendChild(js);
  });
};