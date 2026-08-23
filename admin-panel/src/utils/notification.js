import { toast } from 'sonner';

const notificationWithIcon = (type, title, msg) => {
  const description = typeof msg === 'string' ? msg : 'The requested action could not be completed.';
  const options = { description, duration: type === 'error' ? 6000 : 4000 };
  if (type === 'success') return toast.success(title || 'Success', options);
  if (type === 'warning') return toast.warning(title || 'Attention', options);
  if (type === 'info') return toast.info(title || 'Information', options);
  return toast.error(title || 'Action failed', options);
};

export default notificationWithIcon;
