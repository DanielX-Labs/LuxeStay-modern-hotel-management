import dynamic from 'next/dynamic';

export default dynamic(() => import('../../src/pages/Login').then(async ({ default: Login }) => {
  const { default: PublicRoute } = await import('../../src/components/middleware/PublicRoute');
  return function LoginPage() { return <PublicRoute><Login /></PublicRoute>; };
}), { ssr: false });
