export const isSessionValid = () => {
  const isLoggedIn = localStorage.getItem("adminAuth") === "true";
  const expiry = localStorage.getItem("sessionExpiry");

  if (!isLoggedIn || !expiry) return false;

  if (Date.now() > Number(expiry)) {
    // Session expired → remove tokens
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("sessionExpiry");
    return false;
  }
  return true;
};
