import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getCookie } from 'cookies-next';
import api from './axios';

// @ts-ignore
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.Pusher = Pusher;
}

const createEchoInstance = () => {
  if (typeof window === 'undefined') return null;
  if (!process.env.NEXT_PUBLIC_REVERB_APP_KEY) {
    console.warn("Pusher/Reverb app key is missing. Real-time features will be disabled.");
    return null;
  }

  const token = getCookie('token');

  return new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    wsPort: process.env.NEXT_PUBLIC_REVERB_PORT ? Number(process.env.NEXT_PUBLIC_REVERB_PORT) : 8080,
    wssPort: process.env.NEXT_PUBLIC_REVERB_PORT ? Number(process.env.NEXT_PUBLIC_REVERB_PORT) : 8080,
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel: any, options: any) => {
      return {
        authorize: (socketId: any, callback: any) => {
          api.post('/broadcasting/auth', {
            socket_id: socketId,
            channel_name: channel.name
          })
          .then(response => {
            callback(false, response.data);
          })
          .catch(error => {
            callback(true, error);
          });
        }
      };
    },
  });
};

export const echo = createEchoInstance();
