
let notificationApi;

export const setNotificationApi = (api) => {
  notificationApi = api;

  return () => {
    if (notificationApi === api) notificationApi = undefined;
  };
};

const notificationWithIcon = (type, title, msg) => {
  if (!notificationApi) return;

  notificationApi[type]({
    title,
    description: msg
  });
};

export default notificationWithIcon;
