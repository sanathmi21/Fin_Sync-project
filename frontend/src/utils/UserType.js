export const getUserType = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.type; // "personal" or "business"
  } catch (e) {
    return null;
  }
};