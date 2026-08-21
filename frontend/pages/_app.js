
import { ConfigProvider } from 'antd';
import { DefaultSeo } from 'next-seo';
import { Provider, useSelector } from 'react-redux';
import SEO from '../next-seo.config';
import { store } from '../store';

import 'antd/dist/reset.css';
import '../styles/global.css';

function LoadApp({ Component, pageProps }) {
  const { theme } = useSelector((state) => state.app);

  return (
    <>
      <DefaultSeo {...SEO} />
      <ConfigProvider theme={{ token: theme }}>
        <Component {...pageProps} />
      </ConfigProvider>
    </>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <LoadApp Component={Component} pageProps={pageProps} />
    </Provider>
  );
}

export default MyApp;
