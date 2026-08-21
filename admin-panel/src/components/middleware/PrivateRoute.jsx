import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getSessionToken, getSessionUser } from '../../utils/authentication';

function PrivateRoute({ children }) {
  const router = useRouter();
  const user = getSessionUser();
  const token = getSessionToken();
  const authenticated = Boolean(user && token);

  useEffect(() => {
    if (!authenticated) router.replace('/auth/login');
  }, [authenticated, router]);

  return authenticated ? children : null;
}

export default PrivateRoute;
