import dynamic from 'next/dynamic';

export default dynamic(() => import('../src/pages/Error'), { ssr: false });
