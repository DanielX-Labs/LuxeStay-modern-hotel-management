import dynamic from 'next/dynamic';

export default dynamic(() => import('../../src/pages/Main').then(async ({ default: Main }) => {
  const { default: PrivateRoute } = await import('../../src/components/middleware/PrivateRoute');
  return function MainPage() { return <PrivateRoute><Main /></PrivateRoute>; };
}), { ssr: false });
