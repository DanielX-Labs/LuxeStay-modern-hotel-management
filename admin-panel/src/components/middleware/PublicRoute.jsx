import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getSessionToken, getSessionUser } from '../../utils/authentication';

function PublicRoute({ children }) {
  const router = useRouter();
  const user = getSessionUser();
  const token = getSessionToken();
  const authenticated = Boolean(user && token);

  useEffect(() => {
    if (authenticated) router.replace('/main/dashboard');
  }, [authenticated, router]);

  return authenticated ? null : children;
}

export default PublicRoute;
