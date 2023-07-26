const getIPAddress = async () => {
  let ip = '';
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    ip = data.ip;
  } catch (error) {
    ip = '';
  }
  return ip;
};
export {
  getIPAddress
};
