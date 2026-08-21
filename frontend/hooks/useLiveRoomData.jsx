import axios from 'axios';
import { useEffect, useState } from 'react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

export const fetchRoomData = async (endpoint) => {
  if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL is not configured');

  const response = await axios.get(`${API_URL}${endpoint}`, {
    headers: { 'Cache-Control': 'no-cache' }
  });

  if (response?.data?.result_code !== 0 || !response?.data?.result?.data) {
    throw new Error(response?.data?.result?.error || 'The rooms response was invalid');
  }

  return response.data.result;
};

export default function useLiveRoomData(initialData, endpoint) {
  const [data, setData] = useState(initialData || null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      try {
        const nextData = await fetchRoomData(endpoint);
        if (active) {
          setData(nextData);
          setError(null);
        }
      } catch (requestError) {
        // Keep showing the last successful result during a transient outage.
        if (active && !data) setError(requestError);
      }
    };

    refresh();
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, [endpoint]);

  return { data, error };
}
