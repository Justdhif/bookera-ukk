import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<any> | null;
  }
}

// Make Pusher available globally (required by Laravel Echo)
if (typeof window !== "undefined") {
  window.Pusher = Pusher;
}

let echoInstance: Echo<any> | null = null;

export const initializeEcho = (token: string): Echo<any> => {
  if (echoInstance) {
    return echoInstance;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const isPusher = process.env.NEXT_PUBLIC_BROADCAST_DRIVER === "pusher";

  if (isPusher) {
    // Using Pusher
    echoInstance = new Echo({
      broadcaster: "pusher",
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || "mt1",
      forceTLS: true,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
      authEndpoint: `${apiUrl}/broadcasting/auth`,
    });
  } else {
    // Using Laravel Reverb (default)
    echoInstance = new Echo({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
      wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "8080"),
      wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "8080"),
      forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || "http") === "https",
      enabledTransports: ["ws", "wss"],
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
      authEndpoint: `${apiUrl}/broadcasting/auth`,
    });
  }

  if (typeof window !== "undefined") {
    window.Echo = echoInstance;
  }

  return echoInstance;
};

export const disconnectEcho = (): void => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    if (typeof window !== "undefined") {
      window.Echo = null;
    }
  }
};

export const getEcho = (): Echo<any> | null => {
  return echoInstance;
};
