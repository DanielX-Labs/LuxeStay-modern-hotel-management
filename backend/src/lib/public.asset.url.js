const publicAssetUrl = (value) => {
  if (!value || /^https?:\/\//i.test(value)) return value;

  const apiUrl = (process.env.API_URL || process.env.RENDER_EXTERNAL_URL || '').replace(/\/$/, '');
  const assetPath = value.startsWith('/') ? value : `/${value}`;
  return `${apiUrl}${assetPath}`;
};

module.exports = publicAssetUrl;
