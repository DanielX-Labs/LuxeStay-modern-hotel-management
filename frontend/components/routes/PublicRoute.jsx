import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { getSessionToken, getSessionUser } from '../../utils/authentication';
import Loading from '../shared/Loading';
function PublicRoute({ children }) {
  const [loading, setLoading] = useState(true); const router = useRouter();
  useEffect(() => { const user = getSessionUser(); const token = getSessionToken(); if (user && token) router.replace('/profile?tab=my-profile'); else setLoading(false); }, [router]);
  return loading ? <Loading /> : children;
}
export default PublicRoute;