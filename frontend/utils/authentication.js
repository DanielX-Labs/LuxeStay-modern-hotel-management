const APP_USER_STORAGE = 'LUXESTAY-USER-STORAGE';
const APP_ACCESS_TOKEN = 'LUXESTAY-ACCESS-TOKEN';
const APP_REFRESH_TOKEN = 'LUXESTAY-REFRESH-TOKEN';
const APP_REMEMBER_SESSION = 'LUXESTAY-REMEMBER-SESSION';

const browserStorage = () => {
  if (typeof window === 'undefined') return [];
  return [window.sessionStorage, window.localStorage];
};

const readValue = (key) => {
  for (const storage of browserStorage()) {
    const value = storage.getItem(key);
    if (value) return value;
  }
  return null;
};

const clearSession = () => {
  browserStorage().forEach((storage) => {
    storage.removeItem(APP_USER_STORAGE);
    storage.removeItem(APP_ACCESS_TOKEN);
    storage.removeItem(APP_REFRESH_TOKEN);
    storage.removeItem(APP_REMEMBER_SESSION);
  });
};

export const getSessionUser = () => {
  const value = readValue(APP_USER_STORAGE);
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch (_) {
    clearSession();
    return null;
  }
};

export const getSessionToken = () => readValue(APP_ACCESS_TOKEN);
export const getRefreshToken = () => readValue(APP_REFRESH_TOKEN);

export const isRememberedSession = () => (
  typeof window !== 'undefined' && window.localStorage.getItem(APP_REMEMBER_SESSION) === 'true'
);

export const setSessionUserAndToken = (user, accessToken, refreshToken, remember = isRememberedSession()) => {
  if (typeof window === 'undefined') return;
  clearSession();

  const storage = remember ? window.localStorage : window.sessionStorage;
  storage.setItem(APP_USER_STORAGE, JSON.stringify(user));
  storage.setItem(APP_ACCESS_TOKEN, accessToken);
  storage.setItem(APP_REFRESH_TOKEN, refreshToken);
  if (remember) storage.setItem(APP_REMEMBER_SESSION, 'true');
};

export const setSessionAccessAndRefreshToken = (accessToken, refreshToken) => {
  if (typeof window === 'undefined') return;
  const storage = isRememberedSession() ? window.localStorage : window.sessionStorage;
  storage.setItem(APP_ACCESS_TOKEN, accessToken);
  storage.setItem(APP_REFRESH_TOKEN, refreshToken);
};

export const setSessionUser = (user) => {
  if (typeof window === 'undefined') return;
  const storage = isRememberedSession() ? window.localStorage : window.sessionStorage;
  storage.setItem(APP_USER_STORAGE, JSON.stringify(user));
};

export const setSessionUserKeyAgainstValue = (key, value) => {
  const user = getSessionUser();
  if (user) setSessionUser({ ...user, [key]: value });
};

export const removeSessionAndLogoutUser = (redirect = true) => {
  clearSession();
  if (redirect && typeof window !== 'undefined') window.location.assign('/auth/login');
};
