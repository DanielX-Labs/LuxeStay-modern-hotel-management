import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import antTheme from '../src/utils/theme';
import 'antd/dist/reset.css';
import '../src/index.css';

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <ConfigProvider theme={{ token: antTheme }}>
        <Component {...pageProps} />
      </ConfigProvider>
    </Provider>
  );
}
