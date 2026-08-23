import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from '../src/store';
import antTheme from '../src/utils/theme';
import 'antd/dist/reset.css';
import '../src/index.css';

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <ConfigProvider theme={{ token: antTheme }}>
        <Component {...pageProps} />
        <Toaster position='top-right' richColors closeButton expand visibleToasts={5} />
      </ConfigProvider>
    </Provider>
  );
}
